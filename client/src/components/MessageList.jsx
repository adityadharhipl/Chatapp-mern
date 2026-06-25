import React, { useRef, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import MessageBubble from './MessageBubble';

const MessageList = () => {
  const { activeTab, activeChatUser, globalMessages, privateMessages, isAiTyping } = useChatStore();
  const messagesEndRef = useRef(null);

  const messages = activeTab === 'global' ? globalMessages : (privateMessages[activeChatUser?._id] || []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-4">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} msg={msg} />
        ))}
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
  );
};

export default MessageList;
