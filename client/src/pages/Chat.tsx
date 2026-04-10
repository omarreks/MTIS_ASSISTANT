import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Send, MessageCircle, Phone, Mail } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/**
 * Message shape for the chat conversation.
 * - "user"      → sent by the student
 * - "assistant" → sent by the AI
 */
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ── Alternate channel options shown below the chat ──────────
const OTHER_CHANNELS = [
  { icon: MessageCircle, label: "WhatsApp" },
  { icon: Mail, label: "Email" },
  { icon: Phone, label: "Voice" },
] as const;

/**
 * MTIS Assistant — Chat Page
 *
 * Features:
 *  - Live AI integration using OpenAI GPT-4o
 *  - Real-time database access for student inquiries
 *  - Auto-scroll and responsive UI
 */
export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "assistant",
      content: "Hello! I'm your MTIS Assistant. How can I help you today? I can check your GPA, academic year, and other academic details.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // tRPC Mutation for AI Chat
  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    },
    onError: (error) => {
      console.error("AI Chat error:", error);
      toast.error("Failed to get response from AI assistant. Please check your connection.");
    }
  });

  const isLoading = chatMutation.isPending;

  // Scroll to the newest message whenever the list changes
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Send a message and call the real AI backend
  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isLoading) return;

      // Add the user message immediately
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };
      
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");

      // Call backend AI
      chatMutation.mutate({
        messages: newMessages.map(m => ({
          role: m.role,
          content: m.content
        }))
      });
    },
    [input, isLoading, messages, chatMutation]
  );

  // Allow Enter to send
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Navigation ─────────────────────────────────── */}
      <Navbar currentPage="chat" />

      {/* ── Main content: fills remaining screen height ── */}
      <main className="flex-1 container py-8 flex flex-col max-w-3xl">
        {/* Page header */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-1">
            Chat with AI Assistant
          </h1>
          <p className="text-foreground/70">
            Get instant answers to your academic questions
          </p>
        </header>

        {/* ── Message list (grows to fill space) ──────── */}
        <div
          className="flex-1 bg-white rounded-lg border border-border p-4 mb-4 overflow-y-auto min-h-0"
          style={{ maxHeight: "calc(100vh - 380px)", minHeight: "320px" }}
          role="log"
          aria-live="polite"
          aria-label="Chat conversation"
        >
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none"
                  }`}
                >
                  <p>{message.content}</p>
                  {/* Timestamp */}
                  <p
                    className={`text-xs mt-1.5 ${
                      message.role === "user"
                        ? "text-white/60"
                        : "text-foreground/50"
                    }`}
                    aria-label={`Sent at ${message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator — shown while AI is responding */}
            {isLoading && (
              <div className="flex justify-start" aria-label="AI is typing">
                <div className="bg-muted text-foreground px-4 py-3 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1.5 items-center h-4">
                    <span
                      className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ── Input form ──────────────────────────────── */}
        <form
          onSubmit={handleSendMessage}
          className="flex gap-3 mb-2"
          aria-label="Send a message"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            aria-label="Message input"
            className="flex-1 px-4 py-3 rounded-lg border border-border bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow"
            disabled={isLoading}
            autoComplete="off"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-primary hover:bg-primary/90 text-white px-5 shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </Button>
        </form>

        {/* Keyboard hint */}
        <p className="text-xs text-foreground/40 mb-6 text-right">
          Press <kbd className="px-1 py-0.5 rounded bg-muted text-foreground/60 text-xs font-mono">Enter</kbd> to send
        </p>

        {/* ── Other Channels ──────────────────────────── */}
        <div className="bg-white rounded-lg border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Prefer another channel?
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {OTHER_CHANNELS.map(({ icon: Icon, label }) => (
              <Button
                key={label}
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/5 h-auto py-3 flex flex-col items-center gap-1.5 transition-colors"
                aria-label={`Switch to ${label}`}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span className="text-xs font-semibold">{label}</span>
              </Button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
