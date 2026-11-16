import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Search, Send, Shield, CheckCheck, Check,
  Wrench, Sparkles, RefreshCw
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { messageService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { CUSTOMER_NAV, PROVIDER_NAV } from '../../utils/constants';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const QUICK_PROMPTS = [
  'Hello! How can I help you today?',
  'What is the estimated completion time?',
  'I am on my way to your location.',
  'Could you please share your address details?',
];

const MessagesPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [listError, setListError] = useState('');
  const [messagesError, setMessagesError] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef(null);

  const navItems =
    user?.role === 'provider'
      ? PROVIDER_NAV
      : CUSTOMER_NAV;

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  // Fetch all conversations
  const fetchConversations = async (silent = false) => {
    try {
      if (!silent) setLoadingList(true);
      const res = await messageService.getConversations();
      if (res.data?.success) {
        setListError('');
        const list = res.data.conversations || [];
        setConversations(list);

        // If no active conversation yet and list has items, default to the first one
        if (!activeConv && list.length > 0 && !silent) {
          setActiveConv(list[0]);
        }
      }
    } catch (err) {
      if (!silent) {
        console.error('Failed to load conversations:', err);
        setListError(err.response?.data?.message || 'Failed to load conversations');
      }
    } finally {
      if (!silent) setLoadingList(false);
    }
  };

  // Fetch messages for active conversation
  const fetchMessages = async (otherUserId, silent = false) => {
    if (!otherUserId) return;
    try {
      if (!silent) {
        setLoadingMessages(true);
        setMessagesError('');
      }
      const res = await messageService.getMessages(otherUserId);
      if (res.data?.success) {
        setMessagesError('');
        setMessages(res.data.messages || []);
      }
    } catch (err) {
      if (!silent) {
        console.error('Failed to load chat history:', err);
        setMessagesError(err.response?.data?.message || 'Failed to load chat history');
      }
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchConversations(false);
  }, []);

  // When active conversation changes, load messages
  useEffect(() => {
    if (activeConv?.otherUserId) {
      fetchMessages(activeConv.otherUserId, false);
    } else {
      setMessages([]);
    }
  }, [activeConv?.otherUserId]);

  // Periodic polling for active conversation and conversation list
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations(true);
      if (activeConv?.otherUserId) {
        fetchMessages(activeConv.otherUserId, true);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [activeConv?.otherUserId]);

  // Auto-scroll on messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(true);
    }
  }, [messages.length]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || !activeConv?.otherUserId || sending) return;

    setSending(true);
    try {
      const res = await messageService.sendMessage({
        receiverId: activeConv.otherUserId,
        bookingId: activeConv.booking?._id || undefined,
        content: text,
      });

      if (res.data?.success && res.data.message) {
        setMessages((prev) => [...prev, res.data.message]);
        setInputText('');
        scrollToBottom(true);
        // Refresh conversation preview
        fetchConversations(true);
      }
    } catch (err) {
      console.error('Failed to send:', err);
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

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const name = c.provider?.businessName || c.participant?.name || '';
    const email = c.participant?.email || '';
    const lastMsg = c.lastMessage?.content || '';
    const q = searchQuery.toLowerCase();
    return name.toLowerCase().includes(q) || email.toLowerCase().includes(q) || lastMsg.toLowerCase().includes(q);
  });

  const activeName = activeConv?.provider?.businessName || activeConv?.participant?.name || 'User';
  const activeIsOnline = activeConv?.participant?.isOnline;
  const activeLastActive = activeConv?.participant?.lastActiveAt
    ? formatDistanceToNow(new Date(activeConv.participant.lastActiveAt), { addSuffix: true })
    : 'recently';

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-4">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              In-App Messages
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Chat directly with service providers and customers in real-time
            </p>
          </div>
          <button
            onClick={() => {
              fetchConversations(false);
              if (activeConv) fetchMessages(activeConv.otherUserId, false);
            }}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
            Refresh
          </button>
        </div>

        {/* Messaging Container */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden h-[calc(100vh-210px)] min-h-[550px] flex">

          {/* Left: Conversation List */}
          <div className="w-full sm:w-80 md:w-96 border-r border-gray-100 flex flex-col flex-shrink-0 bg-white">
            {/* Search Bar */}
            <div className="p-3.5 border-b border-gray-100">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Conversation Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {loadingList ? (
                <div className="p-6 text-center text-gray-400">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs">Loading chats...</p>
                </div>
              ) : listError ? (
                <div className="p-6 text-center">
                  <p role="alert" className="text-xs text-red-700">{listError}</p>
                  <button onClick={() => fetchConversations(false)} className="mt-2 text-xs font-semibold text-blue-600">Try again</button>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <MessageSquare className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-xs font-semibold text-gray-700">No conversations found</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Book a service or message a provider to start chatting.
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = activeConv?.otherUserId === conv.otherUserId;
                  const name = conv.provider?.businessName || conv.participant?.name || 'User';
                  const timeStr = conv.lastMessage?.createdAt
                    ? formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false })
                    : '';
                  const hasUnread = conv.unreadCount > 0;

                  return (
                    <button
                      key={conv.otherUserId}
                      onClick={() => setActiveConv(conv)}
                      className={`w-full text-left p-3.5 flex items-start gap-3 hover:bg-gray-50/80 transition-all ${
                        isSelected ? 'bg-blue-50/70 border-r-4 border-blue-600' : ''
                      }`}
                    >
                      {/* Avatar with status indicator */}
                      <div className="relative flex-shrink-0">
                        <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                          {conv.participant?.avatar ? (
                            <img
                              src={conv.participant.avatar}
                              alt={name}
                              className="w-11 h-11 rounded-full object-cover"
                            />
                          ) : (
                            name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white ${
                            conv.participant?.isOnline ? 'bg-emerald-500' : 'bg-gray-300'
                          }`}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className={`text-xs font-semibold truncate ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                            {name}
                          </p>
                          <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">{timeStr}</span>
                        </div>

                        {conv.provider && (
                          <p className="text-[10px] text-blue-600 font-medium truncate mb-0.5">
                            {conv.provider.category}
                          </p>
                        )}

                        <p
                          className={`text-xs truncate ${
                            hasUnread ? 'font-semibold text-gray-900' : 'text-gray-500'
                          }`}
                        >
                          {conv.lastMessage?.content || 'No messages'}
                        </p>
                      </div>

                      {/* Unread badge */}
                      {hasUnread && (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 shadow-xs">
                          {conv.unreadCount}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Active Chat Area */}
          <div className="hidden sm:flex flex-1 flex-col bg-slate-50/50">
            {activeConv ? (
              <>
                {/* Chat Header */}
                <div className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                        {activeConv.participant?.avatar ? (
                          <img
                            src={activeConv.participant.avatar}
                            alt={activeName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          activeName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white ${
                          activeIsOnline ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-sm text-gray-900 truncate">{activeName}</h2>
                        {activeConv.provider && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Shield className="w-3 h-3 text-emerald-600" />
                            Provider
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5 truncate">
                        <span className={`w-1.5 h-1.5 rounded-full ${activeIsOnline ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {activeIsOnline ? 'Active now' : `Active ${activeLastActive}`}
                        {activeConv.participant?.phone && (
                          <span>· {activeConv.participant.phone}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {activeConv.booking && (
                    <div className="hidden md:flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl text-xs text-blue-800">
                      <Wrench className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-medium truncate max-w-[140px]">{activeConv.booking.serviceType}</span>
                      <span className="capitalize px-1.5 py-0.5 bg-blue-200/50 rounded-md text-[10px] font-semibold">
                        {activeConv.booking.status?.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-5 overflow-y-auto space-y-3">
                  {loadingMessages ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
                      <p className="text-xs">Loading messages...</p>
                    </div>
                  ) : messagesError ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                      <p role="alert" className="text-sm text-red-700">{messagesError}</p>
                      <button onClick={() => fetchMessages(activeConv.otherUserId, false)} className="text-xs font-semibold text-blue-600">Try again</button>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-800">Start a conversation with {activeName}</h3>
                      <p className="text-xs text-gray-500 max-w-sm mt-1">
                        Send questions about job status, arrival timing, or pricing details.
                      </p>
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
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-xs ${
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

                {/* Quick Prompts */}
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
                      placeholder={`Type a message to ${activeName}...`}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim() || sending}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white p-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center flex-shrink-0"
                      title="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-3">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-gray-800">Your Messages</h3>
                <p className="text-xs text-gray-500 max-w-sm mt-1">
                  Select a conversation from the left to start viewing message threads or send an update.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MessagesPage;
