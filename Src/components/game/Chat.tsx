'use client';

import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle } from 'lucide-react';

const QUICK_MESSAGES = [
  "Good game!",
  "Well played!",
  "Good luck!",
  "Thanks for the game!",
  "Nice move!",
  "gg",
  "👍",
  "😄"
];

export function GameChat() {
  const { chatMessages, addChatMessage, playerName } = useGameStore();
  const opponentName = "Computer";
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);
  
  const handleSend = () => {
    if (!input.trim()) return;
    addChatMessage(playerName, input.trim());
    setInput('');
    
    // Simulate opponent response
    setTimeout(() => {
      const responses = ["Nice move!", "Good game!", "Well played!", "👍"];
      const response = responses[Math.floor(Math.random() * responses.length)];
      addChatMessage(opponentName, response);
    }, 1000 + Math.random() * 2000);
  };
  
  const handleQuickMessage = (msg: string) => {
    addChatMessage(playerName, msg);
    
    // Simulate opponent response
    setTimeout(() => {
      const responses = ["Thanks!", "You too!", "😊", "👍"];
      const response = responses[Math.floor(Math.random() * responses.length)];
      addChatMessage(opponentName, response);
    }, 500 + Math.random() * 1500);
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Chat
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-2 p-3 pt-0 overflow-hidden">
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="space-y-2">
            {chatMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No messages yet. Say hello! 👋
              </p>
            ) : (
              chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`text-sm p-2 rounded-lg ${
                    msg.sender === playerName
                      ? "bg-primary text-primary-foreground ml-4"
                      : "bg-muted mr-4"
                  }`}
                >
                  <span className="font-medium text-xs opacity-70">{msg.sender}</span>
                  <p>{msg.content}</p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        {/* Quick messages */}
        <div className="flex flex-wrap gap-1">
          {QUICK_MESSAGES.slice(0, 4).map(msg => (
            <Button
              key={msg}
              variant="outline"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={() => handleQuickMessage(msg)}
            >
              {msg}
            </Button>
          ))}
        </div>
        
        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="h-8 text-sm"
          />
          <Button size="sm" className="h-8 w-8 p-0" onClick={handleSend}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
