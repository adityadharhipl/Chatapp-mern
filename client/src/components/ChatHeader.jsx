import React from 'react';
import { useChatStore } from '../store/chatStore';

const ChatHeader = () => {
  const { activeTab, activeChatUser } = useChatStore();

  return (
    <>
      <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center shadow-sm shrink-0">
        <div className="font-bold text-lg flex items-center gap-2">
          {activeTab === 'global' ? (
            <>
              🌍 Global Room
              <span className="text-xs font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 ml-2">🤖 AI Available</span>
            </>
          ) : `💬 ${activeChatUser?.name}`}
        </div>
      </div>
    </>
  );
};

export default ChatHeader;
