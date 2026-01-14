import React, { useState } from 'react';
import { Bot, X, Send, Loader2 } from 'lucide-react';

interface AIAssistantPanelProps {
  context: string;
  onClose: () => void;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ context, onClose }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'system', content: `I'm your RAGFlow assistant for ${context}. How can I help you?` }
  ]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    const newMessages = [
      ...messages,
      { role: 'user', content: input }
    ];
    
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    
    // Simulate AI response - in a real app, this would be an API call
    setTimeout(() => {
      let aiResponse = '';
      
      switch(context) {
        case 'requirements':
          aiResponse = 'Based on our database, similar roles typically require 3+ years experience with React, TypeScript, and Node.js. Would you like me to suggest a complete list of requirements?';
          break;
        case 'job-postings':
          aiResponse = 'I can generate an optimized job posting based on your requirements. The current template has an 87% engagement rate on LinkedIn. Would you like to see a draft?';
          break;
        case 'candidates':
          aiResponse = "I have analyzed the candidates and found 5 promising matches with >85% fit to your requirements. Would you like me to rank them or explain the scoring?";
          break;
        case 'interviews':
          aiResponse = 'I can generate technical questions specific to React and Node.js for this candidate. Based on their profile, I recommend focusing on state management and async patterns.';
          break;
        default:
          aiResponse = "I'm here to assist with your talent acquisition process. What specific information do you need?";
      }
      
      setMessages([
        ...newMessages,
        { role: 'system', content: aiResponse }
      ]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-lg border-l border-gray-200 flex flex-col z-50 transition-all duration-200 ease-in-out">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-blue-700 text-white">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5" />
          <h3 className="font-medium">RAGFlow Assistant</h3>
        </div>
        <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`${
              message.role === 'user' 
                ? 'ml-auto bg-blue-50 text-blue-800' 
                : 'mr-auto bg-gray-100 text-gray-800'
            } p-3 rounded-lg max-w-[85%]`}
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask for assistance..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim()}
            className={`p-2 rounded-md ${
              input.trim() 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            } transition-colors`}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPanel;