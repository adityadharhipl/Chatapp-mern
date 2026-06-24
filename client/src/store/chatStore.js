import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import socket from '../services/socket';
import { API_URL, getAuthHeaders } from '../services/api';

const ChatContext = createContext();

export const useChatStore = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('chats');
  const [activeChatUser, setActiveChatUser] = useState(null);
  
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  
  const [globalMessages, setGlobalMessages] = useState([]);
  const [privateMessages, setPrivateMessages] = useState({});

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    if (currentUser) socket.emit("register_user", currentUser._id);
  }, [currentUser]);

  useEffect(() => {
    socket.on('online_users', setOnlineUsers);
    socket.on('receive_message', (data) => setGlobalMessages(prev => [...prev, data]));
    socket.on('receive_private_message', (data) => {
      const chatPartnerId = data.senderId === currentUser?._id ? data.receiverId : data.senderId;
      setPrivateMessages(prev => ({
        ...prev,
        [chatPartnerId]: [...(prev[chatPartnerId] || []), data]
      }));
    });

    return () => {
      socket.off('online_users');
      socket.off('receive_message');
      socket.off('receive_private_message');
    };
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users/all`, { headers: getAuthHeaders() });
      if (res.ok) setAllUsers(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchFriends = async () => {
    try {
      const res = await fetch(`${API_URL}/users/friends`, { headers: getAuthHeaders() });
      if (res.ok) setFriends(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_URL}/users/requests`, { headers: getAuthHeaders() });
      if (res.ok) setFriendRequests(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchPrivateMessages = async (friendId) => {
    try {
      const res = await fetch(`${API_URL}/messages/${friendId}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        const formattedMsgs = data.map(msg => ({
          senderId: msg.sender,
          receiverId: msg.receiver,
          text: msg.text,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
        setPrivateMessages(prev => ({ ...prev, [friendId]: formattedMsgs }));
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchFriends();
      fetchRequests();
    }
  }, [token, activeTab]);

  useEffect(() => {
    if (activeTab === 'chats' && activeChatUser && !privateMessages[activeChatUser._id]) {
      fetchPrivateMessages(activeChatUser._id);
    }
  }, [activeChatUser, activeTab]);

  const login = (data) => {
    setToken(data.token);
    setCurrentUser(data);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setGlobalMessages([]);
    setPrivateMessages({});
    setActiveChatUser(null);
  };

  return React.createElement(
    ChatContext.Provider,
    {
      value: {
        token, currentUser, theme, toggleTheme,
        activeTab, setActiveTab, activeChatUser, setActiveChatUser,
        onlineUsers, friends, allUsers, friendRequests,
        globalMessages, privateMessages,
        fetchUsers, fetchFriends, fetchRequests, fetchPrivateMessages,
        login, logout
      }
    },
    children
  );
};
