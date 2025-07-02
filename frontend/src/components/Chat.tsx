import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { UserProfile } from './auth/UserProfile';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  weatherData?: {
    current?: {
      temperature?: number;
    };
    location?: string;
  };
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      const response = await fetch(`${API_BASE_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ query: text }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.answer || 'I could not process that weather query.',
        weatherData: data.weatherData,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const examplePrompts = [
    "What is the weather in San Francisco?",
    "How's the weather in Paris today?",
    "Is it going to rain in London?",
    "What's the temperature in New York?"
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">Weather Agent</h1>
            <UserProfile />
          </div>
        </div>
      </nav>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Hello there!</h2>
                <p className="text-xl text-gray-600">How can I help you today?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
                {examplePrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="p-4 h-auto text-left justify-start"
                    onClick={() => handleSendMessage(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={message.type === 'user' ? 'flex justify-end' : 'flex justify-start'}
                >
                  <div className={message.type === 'user' 
                    ? 'bg-blue-600 text-white px-4 py-2 rounded-lg max-w-xs lg:max-w-md'
                    : 'bg-white text-gray-900 shadow-md px-4 py-2 rounded-lg max-w-xs lg:max-w-md'
                  }>
                    <p>{message.content}</p>
                    {message.weatherData && (
                      <Card className="mt-3 p-4 bg-blue-500 text-white">
                        <div className="text-lg font-bold">
                          {Math.round(message.weatherData.current?.temperature || 0)}°C
                        </div>
                        <div className="text-sm">
                          {message.weatherData.location}
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t bg-white p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="what is the weather"
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage(input);
                  }
                }}
                disabled={isLoading}
              />
              <Button 
                onClick={() => handleSendMessage(input)}
                disabled={isLoading || !input.trim()}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat; 