'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: any[];
}

export default function TestMCPPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-with-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          customerProfile: {
            state: 'CA',
            vehicles: [{
              year: 2015,
              make: 'Tesla',
              model: 'Model S'
            }],
            address: '1847 14th Avenue, San Francisco, CA 94122',
          },
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const text = decoder.decode(value);
          assistantContent += text;
          
          // Update assistant message in real-time
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg && lastMsg.role === 'assistant') {
              lastMsg.content = assistantContent;
            } else {
              newMessages.push({
                id: Date.now().toString(),
                role: 'assistant',
                content: assistantContent,
              });
            }
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const suggestedPrompts = [
    "What are the official California rates for my Tesla?",
    "Which states do you have official rate data for?",
    "Show me all profiles in the dataset",
    "How accurate are your quotes compared to official rates?",
    "Compare your Progressive quote to the official CA DOI rate",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="p-6 mb-4 bg-white shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 MCP State DOI Test
          </h1>
          <p className="text-gray-600">
            Testing AI with official state insurance department data via MCP server
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="text-blue-600">Test Profile:</strong>
              <div className="text-gray-700 mt-1">
                📍 San Francisco, CA<br/>
                🚗 2015 Tesla Model S
              </div>
            </div>
            <div>
              <strong className="text-green-600">Available Data:</strong>
              <div className="text-gray-700 mt-1">
                ✅ California DOI<br/>
                ✅ New York DFS
              </div>
            </div>
          </div>
        </Card>

        {/* Suggested Prompts */}
        {messages.length === 0 && (
          <Card className="p-6 mb-4 bg-white shadow-lg">
            <h2 className="text-lg font-semibold mb-3">💡 Try these prompts:</h2>
            <div className="grid gap-2">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const syntheticEvent = {
                      preventDefault: () => {},
                    } as React.FormEvent<HTMLFormElement>;
                    handleInputChange({
                      target: { value: prompt }
                    } as React.ChangeEvent<HTMLInputElement>);
                    setTimeout(() => handleSubmit(syntheticEvent), 100);
                  }}
                  className="text-left p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Chat Messages */}
        <Card className="p-6 mb-4 bg-white shadow-lg max-h-[500px] overflow-y-auto" ref={messagesContainerRef}>
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Start a conversation to test the MCP State DOI integration...
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id}>
                  <div
                    className={`p-4 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-100 ml-8'
                        : 'bg-gray-100 mr-8'
                    }`}
                  >
                    <div className="text-sm font-semibold mb-1">
                      {message.role === 'user' ? '👤 You' : '🤖 AI Assistant'}
                    </div>
                    <div 
                      className="whitespace-pre-wrap prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: message.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/_(.*?)_/g, '<em>$1</em>')
                          .replace(/\n/g, '<br/>')
                      }}
                    />
                  </div>

                  {/* Show tool calls if available */}
                  {message.toolCalls?.map((tool, idx) => (
                    <div
                      key={idx}
                      className="ml-12 mt-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200"
                    >
                      <div className="text-sm font-semibold text-yellow-800 mb-1">
                        🔧 Tool Call: {tool.name}
                      </div>
                      <div className="text-xs text-yellow-600">
                        {JSON.stringify(tool.args)}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              
              {/* Typing indicator */}
              {isLoading && (
                <div className="p-4 rounded-lg bg-gray-100 mr-8 animate-pulse">
                  <div className="text-sm font-semibold mb-1">
                    🤖 AI Assistant
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    <span className="text-sm text-gray-500 ml-2">AI is thinking...</span>
                  </div>
                </div>
              )}
              
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </Card>

        {/* Input Form */}
        <Card className="p-4 bg-white shadow-lg">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about official rates..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6"
            >
              {isLoading ? '...' : 'Send'}
            </Button>
          </form>
          {isLoading && (
            <div className="mt-2 text-sm text-gray-500">
              🔄 AI is thinking and may call MCP tools...
            </div>
          )}
        </Card>

        {/* Info */}
        <Card className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            🎯 What's happening behind the scenes:
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• ✅ AI accesses official CA & NY insurance department data</li>
            <li>• 🔧 MCP tools automatically called based on your questions</li>
            <li>• ⚡ Responses stream character-by-character in real-time</li>
            <li>• 📊 10 official DOI profiles (5 CA + 5 NY)</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

