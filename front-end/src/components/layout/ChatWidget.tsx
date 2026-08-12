"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, getErrorMessage } from "@/lib/utils";
import { chatService, type ChatRole } from "@/services/chat.service";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  isError?: boolean;
}

function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: trimmed,
    };

    // History dikirim berdasarkan pesan-pesan sebelumnya (sebelum pesan baru ini)
    const history = messages
      .filter((m) => !m.isError)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { reply } = await chatService.sendMessage({
        message: trimmed,
        history,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId(),
          role: "model",
          content: reply,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId(),
          role: "model",
          content: getErrorMessage(
            err,
            "Maaf, terjadi kendala saat menghubungi asisten. Silakan coba lagi."
          ),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {/* Panel Chat */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Tanya WMG Assistant"
        aria-hidden={!isOpen}
        className={cn(
          "flex w-[calc(100vw-2rem)] max-w-[360px] flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl origin-bottom-right transition-all duration-300 ease-out",
          "h-[70vh] max-h-[500px] sm:h-[500px]",
          isOpen
            ? "pointer-events-auto scale-100 opacity-100 translate-y-0"
            : "pointer-events-none scale-95 opacity-0 translate-y-4"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <MessageCircle className="h-4 w-4" />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="font-heading text-sm font-semibold">
                Tanya WMG Assistant
              </span>
              <span className="font-body text-[11px] opacity-70">
                Siap membantu pertanyaanmu
              </span>
            </div>
          </div>
          <button
            type="button"
            aria-label="Tutup chat"
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1.5 transition-colors hover:bg-primary-foreground/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Area Pesan */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-3 overflow-y-auto bg-background px-4 py-4"
        >
          {messages.length === 0 && (
            <div className="font-body text-sm text-muted-foreground">
              Halo! Ada yang bisa dibantu seputar produk atau pesanan WMG
              hari ini?
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex w-full",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3.5 py-2 font-body text-sm leading-relaxed",
                  msg.role === "user"
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : msg.isError
                    ? "rounded-bl-sm bg-destructive/10 text-destructive"
                    : "rounded-bl-sm bg-batik-cream text-batik-brown"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex w-full justify-start">
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-batik-cream px-4 py-3 text-batik-brown">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-batik-brown/60 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-batik-brown/60 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-batik-brown/60" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 border-t border-border bg-card px-3 py-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tulis pertanyaanmu..."
            aria-label="Tulis pesan untuk WMG Assistant"
            disabled={isLoading}
            className="h-9 flex-1"
          />
          <Button
            type="button"
            size="icon"
            aria-label="Kirim pesan"
            onClick={handleSend}
            disabled={isLoading || input.trim().length === 0}
            className="h-9 w-9 shrink-0 rounded-full"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Floating Button */}
      <button
        type="button"
        aria-label={isOpen ? "Tutup WMG Assistant" : "Buka WMG Assistant"}
        aria-expanded={isOpen}
        onClick={handleToggle}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-all duration-300 hover:bg-primary/90 hover:scale-105 active:scale-95"
      >
        <span className="relative flex h-6 w-6 items-center justify-center">
          <MessageCircle
            className={cn(
              "absolute h-6 w-6 transition-all duration-300",
              isOpen
                ? "scale-0 opacity-0 rotate-45"
                : "scale-100 opacity-100 rotate-0"
            )}
          />
          <X
            className={cn(
              "absolute h-6 w-6 transition-all duration-300",
              isOpen
                ? "scale-100 opacity-100 rotate-0"
                : "scale-0 opacity-0 -rotate-45"
            )}
          />
        </span>
      </button>
    </div>
  );
}
