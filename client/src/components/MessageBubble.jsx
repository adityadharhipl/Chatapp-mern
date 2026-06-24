import React from 'react';
import { useChatStore } from '../store/chatStore';

const MessageBubble = ({ msg }) => {
  const { currentUser, activeTab } = useChatStore();
  
  const isOwn = activeTab === 'global' ? msg.username === currentUser.name : msg.senderId === currentUser._id;
  const displayName = activeTab === 'global' ? msg.username : msg.senderName;

  return (
    <div className={`flex flex-col max-w-[70%] ${isOwn ? 'self-end' : 'self-start'}`}>
      <div className={`px-4 py-3 rounded-2xl ${isOwn ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-100 dark:border-slate-700 rounded-bl-sm'}`}>
        {!isOwn && <span className="text-xs font-bold block mb-1 opacity-70 text-indigo-600 dark:text-indigo-400">{displayName}</span>}
        <p className="text-[15px]">{msg.text}</p>
      </div>
      <span className={`text-[10px] text-slate-400 mt-1 ${isOwn ? 'text-right' : 'text-left ml-2'}`}>{msg.time}</span>
    </div>
  );
};

export default MessageBubble;
