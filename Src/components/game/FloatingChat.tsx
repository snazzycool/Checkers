'use client';

import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

const QUICK_MESSAGES = [
  "Good game! 👍",
  "Well played!",
  "Good luck!",
  "Thanks for the game!",
  "Nice move!",
  "gg",
  "😄",
  "👏"
];

export function FloatingChat() {
  const { 
    chatMessages, 
    addChatMessage, 
    playerName, 
    chatOpen, 
    setChatOpen,
    mode,
    opponent
  } = useGameStore();
  
  const multiplayer = useMultiplayer();
  
  const opponentName = opponent?.name || "Computer";
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);
  
  useEffect(() => {
    if (chatOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [chatOpen]);
  
  const handleSend = () => {
    if (!input.trim()) return;
    
    if (mode === 'playing' && multiplayer.isConnected) {
      // Send via WebSocket for online multiplayer
      multiplayer.sendChat(input.trim());
    } else {
      // Local chat for vs-computer or offline
      addChatMessage(playerName, input.trim());
      
      // Simulate opponent response in vs-computer mode
      if (mode === 'vs-computer') {
        setTimeout(() => {
          const responses = ["Nice move!", "Good game!", "Well played!", "👍", "Interesting..."];
          const response = responses[Math.floor(Math.random() * responses.length)];
          addChatMessage(opponentName, response);
        }, 1000 + Math.random() * 2000);
      }
    }
    
    setInput('');
  };
  
  const handleQuickMessage = (msg: string) => {
    if (mode === 'playing' && multiplayer.isConnected) {
      // Send via WebSocket for online multiplayer
      multiplayer.sendChat(msg);
    } else {
      // Local chat for vs-computer or offline
      addChatMessage(playerName, msg);
      
      // Simulate opponent response
      if (mode === 'vs-computer') {
        setTimeout(() => {
          const responses = ["Thanks!", "You too!", "😊", "👍", "GG!"];
          const response = responses[Math.floor(Math.random() * responses.length)];
          addChatMessage(opponentName, response);
        }, 500 + Math.random() * 1500);
      }
    }
  };
  
  // Only show chat during gameplay
  if (mode !== 'playing' && mode !== 'vs-computer') {
    return null;
  }
  
  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setChatOpen(!chatOpen)}
        className={cn(
          "fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full shadow-lg",
          chatOpen && "bg-destructive hover:bg-destructive/90"
        )}
        size="icon"
      >
        {chatOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
        {!chatOpen && chatMessages.length > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {chatMessages.length > 9 ? '9+' : chatMessages.length}
          </span>
        )}
      </Button>
      
      {/* Chat Popup */}
      {chatOpen && (
        <div className="fixed bottom-36 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] bg-card border rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b bg-muted/50">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat
              {mode === 'playing' && multiplayer.isConnected && (
                <span className="text-xs text-green-500">• Live</span>
              )}
            </h3>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setChatOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Messages */}
          <ScrollArea className="h-60 p-3" ref={scrollRef}>
            <div className="space-y-2">
              {chatMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No messages yet. Say hello! 👋
                </p>
              ) : (
                chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "text-sm p-2 rounded-lg max-w-[85%]",
                      msg.sender === playerName
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted"
                    )}
                  >
                    <span className="font-medium text-xs opacity-70 block mb-0.5">{msg.sender}</span>
                    <p>{msg.content}</p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          
          {/* Quick messages */}
          <div className="flex flex-wrap gap-1 p-2 border-t">
            {QUICK_MESSAGES.slice(0, 4).map(msg => (
              <Button
                key={msg}
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => handleQuickMessage(msg)}
              >
                {msg}
              </Button>
            ))}
          </div>
          
          {/* Input */}
          <div className="flex gap-2 p-2 border-t">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="h-9 text-sm"
            />
            <Button size="sm" className="h-9 w-9 p-0" onClick={handleSend}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
