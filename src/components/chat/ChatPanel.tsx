'use client';

import { useState, useRef, useEffect } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { type ChatMessage } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function ChatPanel() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messages = useProjectStore((s) => s.chatMessages);
  const addMessage = useProjectStore((s) => s.addChatMessage);
  const apiKey = useProjectStore((s) => s.apiKey);
  const setApiKey = useProjectStore((s) => s.setApiKey);
  const [keyInput, setKeyInput] = useState('');

  useEffect(() => {
    // Load API key from localStorage
    const saved = localStorage.getItem('claude-api-key');
    if (saved) setApiKey(saved);
  }, [setApiKey]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const saveApiKey = () => {
    setApiKey(keyInput);
    localStorage.setItem('claude-api-key', keyInput);
    setKeyInput('');
  };

  const sendMessage = async () => {
    if (!input.trim() || !apiKey) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };
    addMessage(userMsg);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now()}_res`,
        role: 'assistant',
        content: data.content || 'No response',
        timestamp: Date.now(),
      };
      addMessage(assistantMsg);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: `msg_${Date.now()}_err`,
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now(),
      };
      addMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-[320px] border-l border-gray-200 bg-white flex flex-col">
      <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Agent Chat</h2>
        <Dialog>
          <DialogTrigger
            render={<Button variant="ghost" size="sm" className="text-xs" />}
          >
            {apiKey ? '🔑 Key Set' : '⚙️ Set API Key'}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Claude API Key</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Enter your Anthropic API key. It is stored only in your browser&apos;s localStorage.
              </p>
              <Input
                type="password"
                placeholder="sk-ant-..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
              />
              <Button onClick={saveApiKey} className="w-full">Save Key</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-3">
          {messages.length === 0 && (
            <p className="text-sm text-gray-400 text-center mt-8">
              Claude Code yapınız hakkında sorular sorun.
              Skill, command, agent oluşturmak için yardım alın.
            </p>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`text-sm rounded-lg p-2.5 ${
                msg.role === 'user'
                  ? 'bg-blue-50 text-blue-900 ml-4'
                  : 'bg-gray-50 text-gray-800 mr-4'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}
          {isLoading && (
            <div className="bg-gray-50 text-gray-500 text-sm rounded-lg p-2.5 mr-4 animate-pulse">
              Thinking...
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex gap-2">
          <Textarea
            placeholder={apiKey ? 'Ask about Claude Code...' : 'Set API key first'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!apiKey || isLoading}
            className="resize-none text-sm"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || !apiKey || isLoading}
            size="sm"
            className="self-end"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
