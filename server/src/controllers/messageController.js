const Message = require('../models/Message');
const User = require('../models/User');
const Provider = require('../models/Provider');
const Booking = require('../models/Booking');
const createNotification = require('../utils/createNotification');
const mongoose = require('mongoose');

// @desc    Get all conversations for logged in user
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;

    // Find all messages involving current user
    const messages = await Message.find({
      $or: [{ senderId: currentUserId }, { receiverId: currentUserId }],
    })
      .sort({ createdAt: -1 })
      .populate('bookingId', 'serviceType status scheduledDate');

    // Group by other user ID
    const conversationMap = new Map();

    for (const msg of messages) {
      const isSender = msg.senderId.toString() === currentUserId.toString();
      const otherUserId = isSender ? msg.receiverId.toString() : msg.senderId.toString();

      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          otherUserId,
          lastMessage: {
            _id: msg._id,
            content: msg.content,
            createdAt: msg.createdAt,
            senderId: msg.senderId,
            isRead: msg.isRead,
          },
          booking: msg.bookingId || null,
          unreadCount: 0,
        });
      }

      // Count unread messages sent by the other user to current user
      if (!isSender && !msg.isRead) {
        const conv = conversationMap.get(otherUserId);
        conv.unreadCount += 1;
      }
    }

    const conversations = Array.from(conversationMap.values());

    // Populate user and provider details for each conversation partner
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const user = await User.findById(conv.otherUserId).select(
          'name email role avatar isOnline lastActiveAt phone'
        );

        let providerInfo = null;
        if (user && user.role === 'provider') {
          providerInfo = await Provider.findOne({ userId: user._id }).select(
            'businessName category averageRating location'
          );
        }

        return {
          ...conv,
          participant: user,
          provider: providerInfo,
        };
      })
    );

    // Filter out any where user was deleted
    const validConversations = populatedConversations.filter((c) => c.participant);

    res.status(200).json({ success: true, conversations: validConversations });
  } catch (error) {
    next(error);
  }
};

// @desc    Get message history between current user and other user
// @route   GET /api/messages/:otherUserId
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const { otherUserId } = req.params;
    const { bookingId } = req.query;
    if (!mongoose.isValidObjectId(otherUserId) || (bookingId && !mongoose.isValidObjectId(bookingId))) {
      return res.status(400).json({ success: false, message: 'Invalid conversation or booking ID' });
    }
    if (otherUserId === currentUserId.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot open a conversation with yourself' });
    }
    const participant = await User.findById(otherUserId).select('role');
    const isCustomerProviderPair = participant && (
      (req.user.role === 'customer' && participant.role === 'provider') ||
      (req.user.role === 'provider' && participant.role === 'customer')
    );
    if (!isCustomerProviderPair) {
      return res.status(403).json({ success: false, message: 'Direct messaging is available between customers and providers' });
    }
    if (bookingId) {
      const booking = await Booking.findById(bookingId).select('customerId providerId');
      const provider = await Provider.findOne({ userId: currentUserId }).select('_id');
      const recipientProvider = await Provider.findOne({ userId: otherUserId }).select('_id');
      const isBookingParticipant = booking && (
        (booking.customerId.toString() === currentUserId.toString() && recipientProvider?._id.toString() === booking.providerId.toString()) ||
        (booking.customerId.toString() === otherUserId && provider?._id.toString() === booking.providerId.toString())
      );
      if (!isBookingParticipant) {
        return res.status(403).json({ success: false, message: 'Not authorized to access this booking conversation' });
      }
    }

    const query = {
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId },
      ],
    };

    if (bookingId) {
      query.bookingId = bookingId;
    }

    const messages = await Message.find(query)
      .sort({ createdAt: 1 })
      .populate('senderId', 'name avatar role')
      .populate('receiverId', 'name avatar role')
      .populate('bookingId', 'serviceType status scheduledDate estimatedPrice');

    // Automatically mark unread messages received from otherUserId as read
    await Message.updateMany(
      {
        senderId: otherUserId,
        receiverId: currentUserId,
        isRead: false,
        ...(bookingId && { bookingId }),
      },
      { isRead: true }
    );

    // Fetch participant details
    const participantDetails = await User.findById(otherUserId).select(
      'name email role avatar isOnline lastActiveAt phone'
    );

    let provider = null;
    if (participantDetails && participantDetails.role === 'provider') {
      provider = await Provider.findOne({ userId: participantDetails._id }).select(
        'businessName category averageRating location'
      );
    }

    res.status(200).json({
      success: true,
      messages,
      participant: participantDetails,
      provider,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content, bookingId } = req.body;

    if (!receiverId || !content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Receiver and content are required' });
    }
    if (!mongoose.isValidObjectId(receiverId) || (bookingId && !mongoose.isValidObjectId(bookingId))) {
      return res.status(400).json({ success: false, message: 'Invalid recipient or booking ID' });
    }
    if (receiverId === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot send a message to yourself' });
    }
    if (content.trim().length > 5000) {
      return res.status(400).json({ success: false, message: 'Message must be 5000 characters or fewer' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Recipient not found' });
    }
    const isCustomerProviderPair = (
      (req.user.role === 'customer' && receiver.role === 'provider') ||
      (req.user.role === 'provider' && receiver.role === 'customer')
    );
    if (!isCustomerProviderPair) {
      return res.status(403).json({ success: false, message: 'Direct messaging is available between customers and providers' });
    }
    if (bookingId) {
      const booking = await Booking.findById(bookingId).select('customerId providerId');
      const senderProvider = await Provider.findOne({ userId: req.user.id }).select('_id');
      const receiverProvider = await Provider.findOne({ userId: receiverId }).select('_id');
      const participantPair = booking && (
        (booking.customerId.toString() === req.user.id.toString() && receiverProvider?._id.toString() === booking.providerId.toString()) ||
        (booking.customerId.toString() === receiverId && senderProvider?._id.toString() === booking.providerId.toString())
      );
      if (!participantPair) {
        return res.status(403).json({ success: false, message: 'Not authorized to message about this booking' });
      }
    }

    const message = await Message.create({
      senderId: req.user.id,
      receiverId,
      bookingId: bookingId || null,
      content: content.trim(),
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'name avatar role')
      .populate('receiverId', 'name avatar role')
      .populate('bookingId', 'serviceType status');

    await createNotification(
      receiverId,
      `New message from ${req.user.name}`,
      'message',
      '/messages'
    );
    res.status(201).json({ success: true, message: populatedMessage });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark messages from a specific user as read
// @route   PUT /api/messages/read/:otherUserId
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const { otherUserId } = req.params;
    if (!mongoose.isValidObjectId(otherUserId) || otherUserId === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid conversation participant' });
    }
    const participant = await User.findById(otherUserId).select('role');
    const isCustomerProviderPair = participant && (
      (req.user.role === 'customer' && participant.role === 'provider') ||
      (req.user.role === 'provider' && participant.role === 'customer')
    );
    if (!isCustomerProviderPair) {
      return res.status(403).json({ success: false, message: 'Direct messaging is available between customers and providers' });
    }

    await Message.updateMany(
      { senderId: otherUserId, receiverId: req.user.id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get total unread messages count
// @route   GET /api/messages/unread-count
// @access  Private
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({
      receiverId: req.user.id,
      isRead: false,
    });

    res.status(200).json({ success: true, unreadCount: count });
  } catch (error) {
    next(error);
  }
};
