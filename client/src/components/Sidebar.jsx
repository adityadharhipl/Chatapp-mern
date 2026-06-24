import React from 'react';
import { useChatStore } from '../store/chatStore';
import { API_URL, getAuthHeaders } from '../services/api';

const Sidebar = () => {
  const { 
    currentUser, activeTab, setActiveTab, activeChatUser, setActiveChatUser,
    onlineUsers, friends, allUsers, friendRequests,
    fetchUsers, fetchFriends, fetchRequests, logout 
  } = useChatStore();

  const sendFriendRequest = async (id) => {
    try {
      const res = await fetch(`${API_URL}/users/request/${id}`, { method: 'POST', headers: getAuthHeaders() });
      if (res.ok) fetchUsers();
    } catch (e) { console.error(e); }
  };

  const acceptRequest = async (id) => {
    try {
      const res = await fetch(`${API_URL}/users/accept/${id}`, { method: 'POST', headers: getAuthHeaders() });
      if (res.ok) {
        fetchRequests();
        fetchFriends();
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-indigo-600 text-white">
        <div className="font-bold flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          {currentUser?.name}
        </div>
        <button onClick={logout} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full">
          Logout
        </button>
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
  );
};

export default Sidebar;
