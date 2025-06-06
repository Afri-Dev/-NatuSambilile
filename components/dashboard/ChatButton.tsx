import React from 'react';
import { MessageSquare } from 'lucide-react';

interface ChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
  disabled?: boolean;
}

const ChatButton: React.FC<ChatButtonProps> = ({ onClick, isOpen, disabled = false }) => {
  if (isOpen) return null;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-colors z-40 ${
        disabled 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      }`}
      aria-label={disabled ? 'Chat is disabled during quiz' : 'Open study buddy chat'}
    >
      <MessageSquare size={24} />
    </button>
  );
};

export default ChatButton;
