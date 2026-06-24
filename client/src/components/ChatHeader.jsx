import React from 'react';
import { useChatStore } from '../store/chatStore';

const ChatHeader = () => {
  const { activeTab, activeChatUser } = useChatStore();

  return (
    <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center shadow-sm shrink-0">
      <div className="font-bold text-lg">
        {activeTab === 'global' ? '🌍 Global Room' : `💬 ${activeChatUser?.name}`}
      </div>
    </div>
  );
};

export default ChatHeader;
