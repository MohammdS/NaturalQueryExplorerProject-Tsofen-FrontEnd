import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Database, Bot, User, Clock, Trash2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const ChatPage = () => {
  const navigate = useNavigate();
  const { currentDatabase, chatMessages, sendMessage, user, isGuest, clearChat } = useApp();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!currentDatabase) {
      navigate('/dashboard');
    }
  }, [currentDatabase, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (!currentDatabase) {
    return null; // Will redirect to dashboard
  }

  const suggestions = [
    "Show me the top 10 customers by revenue",
    "What's the monthly sales trend?",
    "Analyze user behavior patterns",
    "Generate a summary report",
    "Find all products with low stock",
    "Compare sales between regions",
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              size="sm"
              className="transition-smooth hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Database className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold">{currentDatabase.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {currentDatabase.description || 'Database interaction'}
                </p>
              </div>
              {isGuest && (
                <Badge variant="outline" className="ml-2">
                  Guest Mode
                </Badge>
              )}
            </div>
            {chatMessages.length > 0 && (
              <Button
                onClick={clearChat}
                variant="outline"
                size="sm"
                className="transition-smooth hover:bg-muted"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Chat
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 container mx-auto px-6 py-6 flex flex-col max-w-4xl">
        {/* Messages */}
        <div className="flex-1 space-y-4 mb-6 overflow-y-auto">
          {chatMessages.length === 0 ? (
            <Card className="bg-gradient-card shadow-soft border-0 p-8 text-center">
              <div className="space-y-4">
                <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Start Your Conversation</h3>
                  <p className="text-muted-foreground mb-6">
                    Ask questions about your database, request analysis, or explore your data.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        onClick={() => setMessage(suggestion)}
                        variant="outline"
                        className="text-left h-auto p-3 whitespace-normal transition-smooth hover:bg-muted"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-4 max-w-[80%] animate-slide-up",
                  msg.isUser ? "ml-auto" : "mr-auto"
                )}
              >
                <div
                  className={cn(
                    "flex gap-3 w-full",
                    msg.isUser ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg shrink-0 h-fit",
                      msg.isUser ? "bg-gradient-primary" : "bg-muted"
                    )}
                  >
                    {msg.isUser ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <Card
                    className={cn(
                      "shadow-soft border-0 flex-1",
                      msg.isUser
                        ? "bg-gradient-primary text-white"
                        : "bg-card"
                    )}
                  >
                    <CardContent className="p-4">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      <div
                        className={cn(
                          "flex items-center gap-1 mt-2 text-xs",
                          msg.isUser
                            ? "text-white/70"
                            : "text-muted-foreground"
                        )}
                      >
                        <Clock className="h-3 w-3" />
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <Card className="bg-gradient-card shadow-elevated border-0">
          <CardContent className="p-4">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask ${currentDatabase.name} anything...`}
                className="flex-1 transition-smooth focus:ring-primary/20 border-0 bg-background/50"
                maxLength={1000}
              />
              <Button
                type="submit"
                disabled={!message.trim()}
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300 px-6"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span>{message.length}/1000</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatPage;
