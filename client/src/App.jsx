import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');
const API_URL = 'http://localhost:5000/api';

function App() {
  // Auth state
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  // UI State
  const [view, setView] = useState('login');
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('chats');
  const [activeChatUser, setActiveChatUser] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  // Data State
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);

  // Chat State
  const [globalMessages, setGlobalMessages] = useState([]);
  const [privateMessages, setPrivateMessages] = useState({});
  const [inputMessage, setInputMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Theme Logic
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  // Register Socket when logged in
  useEffect(() => {
    if (currentUser) {
      socket.emit("register_user", currentUser._id);
    }
  }, [currentUser]);

  // Socket Listeners
  useEffect(() => {
    socket.on('online_users', (users) => setOnlineUsers(users));
    socket.on('receive_message', (data) => setGlobalMessages(prev => [...prev, data]));
    socket.on('receive_private_message', (data) => {
      const chatPartnerId = data.senderId === currentUser?._id ? data.receiverId : data.senderId;
      setPrivateMessages(prev => ({
        ...prev,
        [chatPartnerId]: [...(prev[chatPartnerId] || []), data]
      }));
    });

    socket.on('message_blocked', (data) => {
      setError(data.warning);
      // Auto clear warning after 5 seconds
      setTimeout(() => setError(''), 5000);
    });

    socket.on('aiTyping', (status) => setIsAiTyping(status));
    socket.on('global_message_deleted', (msgId) => {
      setGlobalMessages(prev => prev.filter(m => m._id !== msgId));
    });
    socket.on('message_deleted', ({ msgId, chatId }) => {
      setPrivateMessages(prev => {
        if (!prev[chatId]) return prev;
        return {
          ...prev,
          [chatId]: prev[chatId].filter(m => m._id !== msgId)
        };
      });
    });

    return () => {
      socket.off('online_users');
      socket.off('receive_message');
      socket.off('receive_private_message');
      socket.off('message_blocked');
      socket.off('aiTyping');
      socket.off('global_message_deleted');
      socket.off('message_deleted');
    };
  }, [currentUser]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [globalMessages, privateMessages, activeChatUser, activeTab, isAiTyping]);

  // Fetch Data when logged in
  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchFriends();
      fetchRequests();
    }
  }, [token, activeTab]); // Re-fetch occasionally or on tab switch

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users/all`, { headers: authHeaders });
      if (res.ok) setAllUsers(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchFriends = async () => {
    try {
      const res = await fetch(`${API_URL}/users/friends`, { headers: authHeaders });
      if (res.ok) setFriends(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_URL}/users/requests`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        // Sort newest requests to the top
        const sorted = data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setFriendRequests(sorted);
      }
    } catch (e) { console.error(e); }
  };

  const fetchPrivateMessages = async (friendId) => {
    try {
      const res = await fetch(`${API_URL}/messages/${friendId}`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        const formattedMsgs = data.map(msg => ({
          _id: msg._id,
          senderId: msg.sender,
          receiverId: msg.receiver,
          text: msg.text,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          // Optional: we don't have senderName directly here unless populated, but we use senderId to determine if isOwn
        }));

        setPrivateMessages(prev => ({
          ...prev,
          [friendId]: formattedMsgs
        }));
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (activeTab === 'chats' && activeChatUser && !privateMessages[activeChatUser._id]) {
      fetchPrivateMessages(activeChatUser._id);
    }
  }, [activeChatUser, activeTab]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    if (view === 'register' && password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      const endpoint = view === 'login' ? '/auth/login' : '/auth/register';
      const body = view === 'login' ? { email, password } : { name, email, password, confirmPassword };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      if (view === 'login') {
        // Only login sets token and navigates to dashboard
        setToken(data.token);
        setCurrentUser(data);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
      } else {
        // Registration success → redirect to login page
        setError('✅ Registration successful! Please login now.');
        setName('');
        setPassword('');
        setConfirmPassword('');
        setView('login');
      }

    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setGlobalMessages([]);
    setPrivateMessages({});
    setActiveChatUser(null);
  };

  const sendFriendRequest = async (id) => {
    try {
      const res = await fetch(`${API_URL}/users/request/${id}`, { method: 'POST', headers: authHeaders });
      if (res.ok) fetchUsers();
    } catch (e) { console.error(e); }
  };

  const acceptRequest = async (id) => {
    try {
      const res = await fetch(`${API_URL}/users/accept/${id}`, { method: 'POST', headers: authHeaders });
      if (res.ok) {
        fetchRequests();
        fetchFriends();
      }
    } catch (e) { console.error(e); }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const messageData = {
      _id: Date.now().toString(),
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (activeTab === 'global') {
      socket.emit('send_message', { ...messageData, username: currentUser.name || currentUser.email });
      setInputMessage('');
    } else if (activeTab === 'chats' && activeChatUser) {
      const textToSave = inputMessage;
      setInputMessage('');

      try {
        // Save to DB first
        const res = await fetch(`${API_URL}/messages`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            receiverId: activeChatUser._id,
            text: textToSave
          })
        });

        if (res.ok) {
          const savedMsg = await res.json();
          // Then emit to socket for real-time delivery
          socket.emit('private_message', {
            ...messageData,
            _id: savedMsg._id,
            text: textToSave,
            senderId: currentUser._id,
            senderName: currentUser.name,
            receiverId: activeChatUser._id
          });
        }
      } catch (e) { console.error("Error saving message", e); }
    }
  };

  const deleteMessage = async (msgId) => {
    if (activeTab === 'global') {
      socket.emit('delete_global_message', msgId);
    } else {
      try {
        const res = await fetch(`${API_URL}/messages/${msgId}`, {
          method: 'DELETE',
          headers: authHeaders
        });
        if (res.ok) {
          setPrivateMessages(prev => {
            const updated = prev[activeChatUser._id].filter(m => m._id !== msgId);
            return { ...prev, [activeChatUser._id]: updated };
          });
          socket.emit('delete_private_message', { msgId, receiverId: activeChatUser._id, senderId: currentUser._id });
        }
      } catch (e) { console.error("Error deleting message", e); }
    }
  };

  // UI Components
  const ThemeToggle = () => (
    <button onClick={toggleTheme} className="absolute top-4 right-4 p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors z-50">
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );

  if (!token) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#111111] font-sans p-4 md:p-8 relative">
        <ThemeToggle />
        
        <div className="w-full max-w-5xl bg-white rounded-[2rem] md:rounded-[2.5rem] flex flex-col md:flex-row shadow-2xl min-h-[600px] overflow-hidden relative z-10">
          
          {/* Left Side: Form */}
          <div className="w-full md:w-1/2 p-8 md:p-14 lg:p-16 flex flex-col justify-center relative bg-white">
            <div className="max-w-md w-full mx-auto">
              <h1 className="text-[32px] font-bold text-slate-900 mb-3 flex items-center gap-2">
                {view === 'login' ? 'Welcome Back' : 'Register'} <span className="text-3xl">👋</span>
              </h1>
              <p className="text-slate-500 mb-8 text-[15px] leading-relaxed pr-4">
                {view === 'login' 
                  ? "Today is a new day. It's your day. You shape it. Sign in to start chatting with your friends."
                  : "Today is a new day. It's your day. You shape it. Sign up to start chatting with your friends."}
              </p>

              {error && (
                <div className="mb-6 text-red-500 text-center bg-red-50 border border-red-100 py-3 px-4 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                {view === 'register' && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 block">Full Name</label>
                    <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required 
                      className="w-full px-4 py-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-400 text-[15px]" />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 block">Email</label>
                  <input type="email" placeholder="Example@email.com" value={email} onChange={e => setEmail(e.target.value)} required 
                    className="w-full px-4 py-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-400 text-[15px]" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 block">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} placeholder="At least 8 characters" value={password} onChange={e => setPassword(e.target.value)} required 
                      className="w-full px-4 py-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-400 pr-12 text-[15px]" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? '🫣' : '👁️'}
                    </button>
                  </div>
                </div>
                
                {view === 'register' && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 block">Confirm Password</label>
                    <div className="relative">
                      <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required 
                        className="w-full px-4 py-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-400 pr-12 text-[15px]" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showConfirmPassword ? '🫣' : '👁️'}
                      </button>
                    </div>
                  </div>
                )}

                {/* {view === 'login' && (
                  <div className="flex justify-end pt-1 pb-1">
                    <a href="#" className="text-sm text-blue-600 hover:underline font-medium">Forgot Password?</a>
                  </div>
                )} */}
                
                <button type="submit" className="w-full py-3.5 bg-[#1e293b] hover:bg-[#0f172a] text-white rounded-xl font-medium transition-all text-[15px] shadow-md shadow-slate-200">
                  {view === 'login' ? 'Login' : 'Register'}
                </button>
              </form>
{/* 
              <div className="mt-8 flex items-center justify-center gap-4">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-slate-400 text-sm font-medium">Or</span>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              <div className="mt-6 space-y-3">
                <button className="w-full py-3 px-4 bg-[#f8fafc] hover:bg-slate-100 border border-slate-100 rounded-xl flex items-center justify-center gap-3 text-[15px] font-medium text-slate-700 transition-colors">
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                  Sign in with Google
                </button>
                <button className="w-full py-3 px-4 bg-[#f8fafc] hover:bg-slate-100 border border-slate-100 rounded-xl flex items-center justify-center gap-3 text-[15px] font-medium text-slate-700 transition-colors">
                  <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-5 h-5" alt="Facebook" />
                  Sign in with Facebook
                </button>
              </div> */}

              <div className="mt-8 text-center text-[15px] text-slate-500">
                {view === 'login' ? "Don't have an account?" : "Already have an account?"}
                <button onClick={() => { setView(view === 'login' ? 'register' : 'login'); setError(''); }} className="ml-1.5 text-blue-600 hover:underline font-medium">
                  {view === 'login' ? 'Register' : 'Login'}
                </button>
              </div>
              
              <div className="mt-12 text-center text-[11px] text-slate-400 font-medium tracking-wider uppercase">
                Powered by Aditya
              </div>
            </div>
          </div>

          {/* Right Side: Image */}
          <div className="w-full md:w-1/2 p-4 hidden md:block bg-white">
            <img 
              src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000&auto=format&fit=crop" 
              alt="Dark Floral" 
              className="w-full h-[650px] object-cover rounded-3xl"
            />
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="h-screen w-full flex bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-indigo-600 text-white">
          <div className="font-bold flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">{currentUser.name?.charAt(0) || 'U'}</div>
            {currentUser.name}
          </div>
          <button onClick={handleLogout} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full">Logout</button>
        </div>

        <div className="flex p-2 gap-1 bg-slate-100 dark:bg-slate-900/50">
          <button onClick={() => setActiveTab('chats')} className={`flex-1 py-1.5 text-xs font-semibold rounded-md ${activeTab === 'chats' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}>Chats</button>
          <button onClick={() => setActiveTab('find')} className={`flex-1 py-1.5 text-xs font-semibold rounded-md ${activeTab === 'find' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}>Find</button>
          <button onClick={() => setActiveTab('requests')} className={`flex-1 py-1.5 text-xs font-semibold rounded-md relative ${activeTab === 'requests' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}>
            Reqs
            {friendRequests.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 rounded-full text-[10px] flex items-center justify-center">{friendRequests.length}</span>}
          </button>
          <button onClick={() => setActiveTab('global')} className={`flex-1 py-1.5 text-xs font-semibold rounded-md ${activeTab === 'global' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}>Global</button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {activeTab === 'chats' && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Your Friends</h3>
              {friends.length === 0 && <p className="text-sm text-slate-500 text-center mt-5">No friends yet.</p>}
              {friends.map(friend => {
                const isOnline = onlineUsers.includes(friend._id);
                return (
                  <div key={friend._id} onClick={() => setActiveChatUser(friend)} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${activeChatUser?._id === friend._id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'} border border-transparent`}>
                    <div className="relative">
                      <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold">{friend.name.charAt(0)}</div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${isOnline ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{friend.name}</h4>
                      <p className="text-xs text-slate-500 truncate">{isOnline ? 'Online' : 'Offline'}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'find' && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Add Friends</h3>
              {allUsers.length === 0 && <p className="text-sm text-slate-500 text-center mt-5">No new users found.</p>}
              {allUsers.map(user => (
                <div key={user._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold">{user.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{user.name}</h4>
                  </div>
                  <button onClick={() => sendFriendRequest(user._id)} className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800/50">Add</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Pending Requests</h3>
              {friendRequests.length === 0 && <p className="text-sm text-slate-500 text-center mt-5">No pending requests.</p>}
              {friendRequests.map(req => (
                <div key={req._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold">{req.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{req.name}</h4>
                  </div>
                  <button onClick={() => acceptRequest(req._id)} className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600">Accept</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-slate-50/50 dark:bg-slate-900/50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] dark:bg-blend-overlay">
        <ThemeToggle />

        {((activeTab === 'chats' && activeChatUser) || activeTab === 'global') ? (
          <>
            <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center shadow-sm shrink-0">
              <div className="font-bold text-lg flex items-center gap-2">
                {activeTab === 'global' ? (
                  <>
                    🌍 Global Room
                    <span className="text-xs font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 ml-2">🤖 AI Available</span>
                  </>
                ) : (
                  <div className="flex flex-col">
                    <span>💬 {activeChatUser.name}</span>
                    <span className="text-xs font-normal text-slate-500">
                      {onlineUsers.includes(activeChatUser._id) ? 'Online' : (activeChatUser.lastSeen ? 'Last seen ' + new Date(activeChatUser.lastSeen).toLocaleString() : 'Offline')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
              <div className="max-w-4xl mx-auto w-full flex flex-col gap-4">
                {(activeTab === 'global' ? globalMessages : (privateMessages[activeChatUser?._id] || [])).map((msg, idx) => {
                  const isOwn = activeTab === 'global' ? msg.username === currentUser.name : msg.senderId === currentUser._id;
                  const displayName = activeTab === 'global' ? msg.username : msg.senderName;
                  const isAI = msg.isAI;
                  return (
                    <div key={idx} className={`flex flex-col max-w-[70%] group ${isOwn ? 'self-end' : 'self-start'}`}>
                      <div className={`px-4 py-3 rounded-2xl relative ${isOwn ? 'bg-indigo-600 text-white rounded-br-sm' : (isAI ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100 shadow-sm border border-emerald-200 dark:border-emerald-800 rounded-bl-sm' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-100 dark:border-slate-700 rounded-bl-sm')}`}>
                        {!isOwn && (
                          isAI ? (
                            <span className="text-xs font-bold block mb-1 opacity-70 flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                              <span className="text-sm">🤖</span> {displayName || "AI Assistant"}
                            </span>
                          ) : (
                            <span className="text-xs font-bold block mb-1 opacity-70 text-indigo-600 dark:text-indigo-400">{displayName}</span>
                          )
                        )}
                        <p className="text-[15px]">{msg.text}</p>
                        {isOwn && msg._id && (
                          <button onClick={() => deleteMessage(msg._id)} className="absolute top-2 right-2 text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" title="Delete Message">
                            ✕
                          </button>
                        )}
                      </div>
                      <span className={`text-[10px] text-slate-400 mt-1 ${isOwn ? 'text-right' : 'text-left ml-2'}`}>{msg.time}</span>
                    </div>
                  )
                })}
                {isAiTyping && activeTab === 'global' && (
                  <div className="flex flex-col max-w-[70%] self-start">
                    <div className="px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100 shadow-sm border border-emerald-200 dark:border-emerald-800 rounded-bl-sm">
                      <span className="text-xs font-bold block mb-1 opacity-70 flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <span className="text-sm">🤖</span> AI Assistant
                      </span>
                      <p className="text-[15px] italic opacity-75">AI is typing...</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800">
              {error && (
                <div className="max-w-4xl mx-auto mb-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 animate-pulse">
                  <span className="text-xl">⚠️</span>
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                  <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600 text-lg font-bold">✕</button>
                </div>
              )}
              <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-3">
                <input type="text" value={inputMessage} onChange={e => setInputMessage(e.target.value)} placeholder="Type a message..." className="flex-1 bg-slate-100 dark:bg-slate-800 border-none px-6 py-4 rounded-full text-base outline-none focus:ring-2 focus:ring-indigo-500/50" />
                <button type="submit" disabled={!inputMessage.trim()} className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50">➤</button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <div className="text-6xl mb-4 opacity-50">💬</div>
            <h2 className="text-xl font-medium">Select a chat to start messaging</h2>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
