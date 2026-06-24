import React, { useRef, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import MessageBubble from './MessageBubble';

const MessageList = () => {
  const { activeTab, activeChatUser, globalMessages, privateMessages } = useChatStore();
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
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
