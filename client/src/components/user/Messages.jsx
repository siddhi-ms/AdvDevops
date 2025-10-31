import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import MainNavbar from "../../navbar/mainNavbar.jsx";
import Avatar from './Avatar.jsx';

const SOCKET_SERVER_URL = 'http://localhost:5000';
const API_URL = 'http://localhost:5000/api';

const getLoggedInUserId = () => {
  return localStorage.getItem('userId');
};

const MessagesPage = () => {
  const [contacts, setContacts] = useState([]);
  const [activeContactId, setActiveContactId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set()); // Track online users
  const [lastMessageTimestamps, setLastMessageTimestamps] = useState({}); // Track last message times
  const socketRef = useRef(null);
  const activeContactIdRef = useRef(activeContactId);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Helper function to check if user is online
  const isUserOnline = (userId) => {
    const isOnline = onlineUsers.has(userId);
    return isOnline;
  };
  
  // Save contact interaction order to localStorage for consistent ordering
  const saveContactOrder = (contacts) => {
    try {
      const orderMap = {};
      contacts.forEach((contact, index) => {
        orderMap[contact._id] = index;
      });
      localStorage.setItem('contactsOrder', JSON.stringify(orderMap));
    } catch (e) {
      console.warn('Failed to save contact order to localStorage');
    }
  };

  // Helper function to format timestamp for recent messages
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'now';
    } else if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // Less than a week
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  useEffect(() => {
    const userId = getLoggedInUserId();
    if (!userId) {
      console.error('No logged-in user found!');
      return;
    }
    setLoggedInUserId(userId);
  }, []);

  useEffect(() => {
    activeContactIdRef.current = activeContactId;
  }, [activeContactId]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!loggedInUserId) return;
    
    setLoadingContacts(true);
    fetch(`${API_URL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(users => {
        // Filter out the current logged-in user from the contacts list
        const filteredUsers = users.filter(user => user._id !== loggedInUserId);
        
        // Try to get saved order from localStorage
        const savedOrder = localStorage.getItem('contactsOrder');
        let userOrder = {};
        if (savedOrder) {
          try {
            userOrder = JSON.parse(savedOrder);
          } catch (e) {
            console.warn('Failed to parse saved contacts order');
          }
        }
        
        const withMeta = filteredUsers.map((u, index) => ({ 
          ...u, 
          latestMessage: "", 
          lastMessageTime: null,
          lastSeen: null,
          _originalIndex: userOrder[u._id] !== undefined ? userOrder[u._id] : index // Use saved order or fallback to current index
        }));
        setContacts(withMeta);
        setLoadingContacts(false);
      })
      .catch(() => setLoadingContacts(false));
  }, [loggedInUserId]);

  useEffect(() => {
    if (!activeContactId || !loggedInUserId) {
      setMessages([]); // Clear messages when no contact is active
      return;
    }
    const chatId = [loggedInUserId, activeContactId].sort().join('_');
    fetch(`${API_URL}/messages/${chatId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(msgs => {
        setMessages(msgs);
      })
      .catch(err => console.error('Failed to load messages:', err));
  }, [activeContactId, loggedInUserId]);

  useEffect(() => {
    if (!loggedInUserId) return;

    socketRef.current = io(SOCKET_SERVER_URL);

    // Add error handling
    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socketRef.current.on('disconnect', (reason) => {
      // Silent disconnect handling
    });

    socketRef.current.on('reconnect', (attemptNumber) => {
      // Re-emit user_online after reconnection and request online users
      if (loggedInUserId) {
        socketRef.current.emit("user_online", loggedInUserId);
        socketRef.current.emit("get_online_users");
      }
    });

    // Wait for connection to be established before emitting user_online
    socketRef.current.on('connect', () => {
      socketRef.current.emit("user_online", loggedInUserId);
      
      // Request online users list via Socket.IO
      setTimeout(() => {
        socketRef.current.emit("get_online_users");
      }, 500);
    });

    // Handle receiving the initial online users list
    const handleOnlineUsersList = (data) => {
      setOnlineUsers(new Set(data.onlineUsers));
    };

    const handleIncomingMessage = (msg) => {
      const currentActiveId = activeContactIdRef.current;
      const currentChatId = currentActiveId
        ? [loggedInUserId, currentActiveId].sort().join("_")
        : null;

      // Only add message to UI if it's not from the current user (to avoid duplication)
      if (msg.senderId !== loggedInUserId && msg.chatId === currentChatId) {
        setMessages((prev) => [...prev, msg]);
        setIsTyping(false); // Stop typing indicator when message is received
      }

      // Update contacts list with latest message
      setContacts((prevContacts) =>
        prevContacts.map((c) => {
          if (msg.chatId.includes(c._id) && c._id !== loggedInUserId) {
            return {
              ...c,
              latestMessage: msg.text,
              lastMessageTime: msg.time,
            };
          }
          return c;
        })
      );
    };

    // Handle user status changes
    const handleUserStatusChange = (data) => {
      setOnlineUsers(prev => {
        const newOnlineUsers = new Set(prev);
        if (data.isOnline) {
          newOnlineUsers.add(data.userId);
        } else {
          newOnlineUsers.delete(data.userId);
        }
        return newOnlineUsers;
      });
    };

    // Listen for typing events
    const handleUserTyping = (data) => {
      const currentActiveId = activeContactIdRef.current;
      const currentChatId = currentActiveId
        ? [loggedInUserId, currentActiveId].sort().join("_")
        : null;

      if (data.chatId === currentChatId && data.userId !== loggedInUserId) {
        setIsTyping(true);
        
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    };

    const handleUserStoppedTyping = (data) => {
      const currentActiveId = activeContactIdRef.current;
      const currentChatId = currentActiveId
        ? [loggedInUserId, currentActiveId].sort().join("_")
        : null;

      if (data.chatId === currentChatId && data.userId !== loggedInUserId) {
        setIsTyping(false);
      }
    };

    socketRef.current.on("online_users_list", handleOnlineUsersList);
    socketRef.current.on("chat message", handleIncomingMessage);
    socketRef.current.on("user_status_change", handleUserStatusChange);
    socketRef.current.on("user typing", handleUserTyping);
    socketRef.current.on("user stopped typing", handleUserStoppedTyping);

    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect");
        socketRef.current.off("connect_error");
        socketRef.current.off("disconnect");
        socketRef.current.off("reconnect");
        socketRef.current.off("online_users_list", handleOnlineUsersList);
        socketRef.current.off("chat message", handleIncomingMessage);
        socketRef.current.off("user_status_change", handleUserStatusChange);
        socketRef.current.off("user typing", handleUserTyping);
        socketRef.current.off("user stopped typing", handleUserStoppedTyping);
        socketRef.current.disconnect();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [loggedInUserId]);

  useEffect(() => {
    if (!activeContactId || !socketRef.current || !loggedInUserId) return;
    const chatId = [loggedInUserId, activeContactId].sort().join('_');
    socketRef.current.emit("joinRoom", chatId);
    
    setIsTyping(false);
    
    return () => {
      socketRef.current.emit("leaveRoom", chatId);
    };
  }, [activeContactId, loggedInUserId]);

  // Save contact order to localStorage for persistent ordering across refreshes
  useEffect(() => {
    if (contacts.length > 0) {
      // Create a debounced save to avoid too frequent updates
      const timeoutId = setTimeout(() => {
        saveContactOrder(contacts);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [contacts]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeContactId || !loggedInUserId) return;
    
    const chatId = [loggedInUserId, activeContactId].sort().join('_');
    const newMessage = {
      chatId,
      senderId: loggedInUserId,
      text: messageInput.trim(),
      time: new Date().toISOString(),
    };
    
    socketRef.current.emit('chat message', newMessage);

    socketRef.current.emit('stopped typing', { chatId, userId: loggedInUserId });

    setMessages((prev) => [...prev, newMessage]);
    setContacts(prev =>
      prev.map(c =>
        c._id === activeContactId
          ? { 
              ...c, 
              latestMessage: newMessage.text,
              lastMessageTime: newMessage.time
            }
          : c
      )
    );
    setMessageInput('');
  };

  // Handle typing indicator
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    
    if (!activeContactId || !loggedInUserId) return;
    
    const chatId = [loggedInUserId, activeContactId].sort().join('_');
    socketRef.current.emit('typing', { chatId, userId: loggedInUserId });
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('stopped typing', { chatId, userId: loggedInUserId });
    }, 2000);
  };

  const ChatBubble = ({ message, index }) => {
    if (!loggedInUserId) return null;
    
    const msgSenderId = String(message.senderId).trim();
    const loggedInId = String(loggedInUserId).trim();
    const isSent = msgSenderId === loggedInId;
    
    return (
      <div 
        className={`flex mb-4 ${isSent ? 'justify-end' : 'justify-start'}`}
      >
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl text-white shadow-lg transform transition-all duration-200 hover:scale-102 ${
          isSent 
            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 rounded-br-none hover:shadow-xl' 
            : 'bg-gradient-to-br from-gray-700 to-gray-800 rounded-tl-none hover:shadow-xl'
        }`}>
          <p className="text-sm">{message.text}</p>
          <p className="text-xs mt-1 text-right opacity-70">
            {new Date(message.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    );
  };

  if (!loggedInUserId) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // Sort contacts by recent activity and online status
  const sortedContacts = [...contacts].sort((a, b) => {    
    // First priority: latest message timestamp (more recent = higher priority)
    const aTime = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
    const bTime = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
    if (aTime !== bTime) return bTime - aTime;
    
    // Second priority: online status
    const aOnline = isUserOnline(a._id) ? 1 : 0;
    const bOnline = isUserOnline(b._id) ? 1 : 0;
    if (aOnline !== bOnline) return bOnline - aOnline;
    
    // Third: alphabetical by name for consistent ordering
    const nameComparison = (a.name || '').localeCompare(b.name || '');
    if (nameComparison !== 0) return nameComparison;
    
    // Last: use original index for stable sort (prevents order changes on refresh)
    return (a._originalIndex || 0) - (b._originalIndex || 0);
  });

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <style>
        {`
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
          .contact-item { transition: all 0.2s ease; }
          .contact-item:hover { transform: translateX(2px); background-color: #f8fafc; }
          .send-button { transition: all 0.2s ease; }
          .send-button:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4); }
          .send-button:active:not(:disabled) { transform: scale(0.95); }
          .online-dot { animation: pulse 3s ease-in-out infinite; }
          @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.6;} }
          .skeleton { background: linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:200% 100%; animation: loading 1.5s ease-in-out infinite; }
          @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
          .typing-indicator { display: flex; align-items: center; gap: 4px; }
          .typing-dot { width: 8px; height: 8px; border-radius: 50%; background-color: #9ca3af; animation: typing 1.4s infinite; }
          .typing-dot:nth-child(1){animation-delay:0s;} .typing-dot:nth-child(2){animation-delay:0.2s;} .typing-dot:nth-child(3){animation-delay:0.4s;}
          @keyframes typing { 0%,60%,100%{transform:translateY(0);opacity:0.7;} 30%{transform:translateY(-10px);opacity:1;} }
        `}
      </style>
      <div className="flex-1 flex flex-col">
        <MainNavbar />
        
        {/* Messages Header */}
        <div className="mt-20 bg-white shadow-sm border-b">
          <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
          </div>
        </div>

        <main className="flex-1 flex overflow-hidden">
          {/* Conversations List */}
          <div className="w-full md:w-96 bg-white border-r overflow-y-auto">
            {loadingContacts ? (
              <>
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="flex items-center p-4 border-b">
                    <div className="skeleton h-12 w-12 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <div className="skeleton h-4 w-32 mb-2 rounded"></div>
                      <div className="skeleton h-3 w-40 rounded"></div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              sortedContacts.map((user) => {
                const userIsOnline = isUserOnline(user._id);
                const hasRecentMessage = user.latestMessage;
                
                return (
                  <div 
                    key={user._id}
                    className={`contact-item flex items-center p-4 cursor-pointer border-b hover:bg-gray-50 transition-all duration-200 ${
                      user._id === activeContactId 
                        ? 'bg-indigo-50 border-l-4 border-indigo-600' 
                        : ''
                    }`}
                    onClick={() => setActiveContactId(user._id)}
                  >
                    <div className="relative mr-3">
                      <Avatar 
                        src={user.avatar}
                        name={user.name}
                        size="md"
                        className="ring-2 ring-white shadow-md"
                      />
                      {userIsOnline ? (
                        <div className="online-dot absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      ) : (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-gray-400 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {user.name}
                        </h3>
                        {user.lastMessageTime && (
                          <span className="text-xs text-gray-500 ml-2">
                            {formatMessageTime(user.lastMessageTime)}
                          </span>
                        )}
                      </div>
                      <div className="mt-1">
                        {hasRecentMessage && (
                          <p className="text-sm text-gray-700 truncate">
                            {user.latestMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col bg-white">
            {activeContactId ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center bg-gradient-to-r from-indigo-50 to-white shadow-sm">
                  <div className="relative mr-3">
                    <Avatar 
                      src={contacts.find(u => u._id === activeContactId)?.avatar}
                      name={contacts.find(u => u._id === activeContactId)?.name}
                      size="sm"
                      className="ring-2 ring-indigo-200 shadow-md"
                    />
                    {isUserOnline(activeContactId) ? (
                      <div className="online-dot absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    ) : (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{contacts.find(u => u._id === activeContactId)?.name}</p>
                    <p className="text-sm text-gray-500 flex items-center">
                      {isUserOnline(activeContactId) ? (
                        <>
                          <span className="online-dot w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          Active now
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 bg-gray-400 rounded-full mr-1"></span>
                          Offline
                        </>
                      )}
                    </p>
                  </div>
                </div>
                
                {/* Messages Area */}
                <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-slate-50 to-white">
                  {messages.map((msg, idx) => (
                    <ChatBubble key={msg._id || idx} message={msg} index={idx}/>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex justify-start mb-3">
                      <div className="bg-gray-200 px-3 py-2 rounded-xl text-gray-600 flex items-center typing-indicator">
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t bg-white shadow-lg">
                  <div className="flex items-center space-x-3">
                    <input 
                      type="text" 
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={handleInputChange}
                      className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-300"
                    />
                    <button 
                      type="submit"
                      className="send-button p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-md"
                      disabled={!messageInput.trim()}
                    >
                      ➤
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <svg className="w-24 h-24 mb-4 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <h2 className="text-2xl font-semibold text-indigo-700">Welcome to CollabLearn Messages</h2>
                <p className="mt-2">Select a conversation to start chatting.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MessagesPage;