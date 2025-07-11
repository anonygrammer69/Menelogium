import React, { useState, useRef, useEffect } from 'react';
import GrokIcon from './grok icon.png';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputText.trim();
    setInputText('');
    setIsLoading(true);

    try {
      console.log('Sending request with payload:', { chatInput: messageToSend });
      
      const response = await fetch('https://pumped-sincerely-coyote.ngrok-free.app/webhook/groq-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatInput: messageToSend }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Parsed response data:', data);
      
      // Extract text from the "output" field and clean it up
      let botResponseText = '';
      if (data.output) {
        // Remove emojis and extra whitespace, clean up the text
        botResponseText = data.output
          .replace(/👋/g, '') // Remove wave emoji
          .replace(/\n+/g, ' ') // Replace multiple newlines with single space
          .trim(); // Remove leading/trailing whitespace
      } else if (data.result) {
        botResponseText = data.result;
      } else if (data.response) {
        botResponseText = data.response;
      } else if (data.message) {
        botResponseText = data.message;
      } else if (data.text) {
        botResponseText = data.text;
      } else if (data.content) {
        botResponseText = data.content;
      } else if (typeof data === 'string') {
        botResponseText = data;
      } else {
        botResponseText = 'I received your message but couldn\'t find a response.';
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText || 'I received your message but couldn\'t find a response.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for details.`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Window */}
      <div
        className={`absolute top-48 right-6 w-80 h-56 bg-white rounded-xl shadow-2xl transition-all duration-300 ease-in-out z-50 chatbot-menu ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-gray-900 text-white p-4 rounded-t-lg flex justify-between border-t-lg items-center border-gray-800">
          <h3 className="font-bold text-lg font-garamond">🤖 AI Assistant</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-red-400 text-2xl font-bold transition-colors hover:bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div className="h-64 overflow-y-auto p-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-3 rounded-xl text-sm shadow-lg border-2 ${
                  message.isUser
                    ? 'bg-blue-600 text-white border-blue-700 rounded-br-sm'
                    : 'bg-white text-gray-900 border-gray-300 rounded-bl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap font-garamond font-medium">{message.text}</p>
                <span className={`text-xs mt-2 block ${message.isUser ? 'text-blue-200' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-white text-gray-900 border-2 border-gray-300 rounded-xl rounded-bl-sm px-4 py-3 text-sm shadow-lg">
                <div className="flex space-x-1 items-center">
                  <span className="text-gray-600 font-garamond">Thinking</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-700 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t-2 border-gray-200 bg-white rounded-b-lg">
          <div className="flex space-x-3">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-garamond placeholder-gray-500"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputText.trim() || isLoading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 text-sm font-bold shadow-lg hover:shadow-xl border-2 border-blue-700 hover:border-blue-800"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex hover:cursor-pointer z-40"
      >
        <img src={GrokIcon} alt="Chatbot" className="fixed bottom-6 right-6 w-16 h-16 bg-gray-200 rounded-xl hover:border-2 border-black hover:bg-gray-400 transition duration-300 ease-in-out"/>
      </button>
    </>
  );
};

export default Chatbot;