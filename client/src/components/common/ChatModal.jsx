import { useState, useEffect, useRef } from 'react';
import {
  X, Send, Shield, CheckCheck, Check,
  Wrench, Calendar, Sparkles,
} from 'lucide-react';
import { messageService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const QUICK_PROMPTS = [
  'Hello! How can I help with this booking?',
  'What is the estimated completion time?',
  'I am on my way to your location.',
  'Could you please share any additional details?',
];

const ChatModal = ({
  isOpen,
  onClose,
  recipientUser, // { _id, name, avatar, role, isOnline, lastActiveAt, phone }
  providerInfo,  // optional provider profile details
  booking,       // optional booking object
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const recipientId = recipientUser?._id;

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  const fetchMessages = async (silent = false) => {
    if (!recipientId) return;
    try {
      if (!silent) setLoading(true);
      const res = await messageService.getMessages(recipientId, {
        bookingId: booking?._id || undefined,
      });
      if (res.data?.success) {
        setMessages(res.data.messages || []);
      }
    } catch (err) {
      if (!silent) {
        console.error('Error loading chat:', err);
        toast.error('Unable to load message history');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Initial fetch and auto-scroll
  useEffect(() => {
    if (isOpen && recipientId) {
      fetchMessages(false);
    } else {
      setMessages([]);
    }
  }, [isOpen, recipientId]);

  // Polling every 3.5 seconds while open to receive real-time messages
  useEffect(() => {
    if (!isOpen || !recipientId) return;
    const interval = setInterval(() => {
      fetchMessages(true);
    }, 3500);
    return () => clearInterval(interval);
  }, [isOpen, recipientId]);

  // Scroll on new messages
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(true);
    }
  }, [messages.length]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || !recipientId || sending) return;

    setSending(true);
    try {
      const res = await messageService.sendMessage({
        receiverId: recipientId,
        bookingId: booking?._id || undefined,
        content: text,
      });
      if (res.data?.success && res.data.message) {
        setMessages((prev) => [...prev, res.data.message]);
        setInputText('');
        scrollToBottom(true);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen || !recipientUser) return null;

  const displayName = providerInfo?.businessName || recipientUser.name || 'User';
  const isOnline = recipientUser.isOnline;
  const lastActive = recipientUser.lastActiveAt
    ? formatDistanceToNow(new Date(recipientUser.lastActiveAt), { addSuffix: true })
    : 'recently';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl h-[620px] max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white px-5 py-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/20">
                {recipientUser.avatar ? (
                  <img src={recipientUser.avatar} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-slate-900 ${
                  isOnline ? 'bg-emerald-400' : 'bg-gray-400'
                }`}
                title={isOnline ? 'Active now' : `Last active ${lastActive}`}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-base truncate">{displayName}</h3>
                {providerInfo && (
                  <span className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                    <Shield className="w-3 h-3 text-blue-300" />
                    Provider
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 truncate">
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                {isOnline ? 'Active now' : `Active ${lastActive}`}
                {recipientUser.phone && (
                  <span className="hidden sm:inline text-slate-400">· {recipientUser.phone}</span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Optional Context Banner for Booking */}
        {booking && (
          <div className="bg-blue-50/90 border-b border-blue-100 px-4 py-2 flex items-center justify-between text-xs text-blue-900 gap-2">
            <div className="flex items-center gap-2 truncate">
              <Wrench className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span className="font-semibold truncate">{booking.serviceType}</span>
              <span className="text-blue-500">·</span>
              <span className="text-blue-700 capitalize">Status: <b>{booking.status?.replace('_', ' ')}</b></span>
            </div>
            {booking.scheduledDate && (
              <span className="text-blue-600 flex items-center gap-1 flex-shrink-0">
                <Calendar className="w-3 h-3" />
                {format(new Date(booking.scheduledDate), 'dd MMM')}
              </span>
            )}
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-50/60 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
              <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">Loading conversations...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-gray-800">Direct Chat with {displayName}</h4>
              <p className="text-xs text-gray-500 max-w-xs mt-1">
                Say hello or ask any questions regarding scheduling, price estimates, or service requirements.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
                {QUICK_PROMPTS.slice(0, 2).map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className="text-xs bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1.5 rounded-full transition-all shadow-xs"
                  >
                    💬 {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMine = (msg.senderId?._id || msg.senderId) === user?._id;
              const time = msg.createdAt ? format(new Date(msg.createdAt), 'hh:mm a') : '';

              return (
                <div
                  key={msg._id || idx}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                      isMine
                        ? 'bg-blue-600 text-white rounded-br-xs'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                    <div
                      className={`flex items-center gap-1 justify-end mt-1 text-[10px] ${
                        isMine ? 'text-blue-100' : 'text-gray-400'
                      }`}
                    >
                      <span>{time}</span>
                      {isMine && (
                        msg.isRead ? (
                          <CheckCheck className="w-3.5 h-3.5 text-blue-200" title="Read" />
                        ) : (
                          <Check className="w-3 h-3 text-blue-200" title="Sent" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-1.5 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {QUICK_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={sending}
              className="text-[11px] whitespace-nowrap bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-full transition-colors flex-shrink-0"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-gray-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${displayName}...`}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white p-2.5 rounded-xl shadow-xs transition-colors flex-shrink-0 flex items-center justify-center"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
