import { useChat } from "@ai-sdk/react";
import type { ToolUIPart, UIMessage } from "ai";
import { RotateCcw, X } from "lucide-react";
import { useEffect, useRef } from "react";

import conciergeMark from "@/assets/concierge-mark.png";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai-elements/reasoning";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/components/ai-elements/tool";
import { Button } from "@/components/ui/button";
import type { ShopifyProduct } from "@/lib/shopify";

import { getAssistantChat, saveMessages } from "./assistant-chat";
import { ChatProductCard } from "./ChatProductCard";

const SUGGESTIONS = [
  "Help me build a minimal desk setup",
  "Which stand is best for a laptop-only desk?",
  "What pairs well with what's in my cart?",
];

type ShowProductsOutput = { products: ShopifyProduct[]; notFound: string[] };

function ProductsTool({ part }: { part: ToolUIPart }) {
  const output = part.state === "output-available" ? (part.output as ShowProductsOutput) : undefined;
  return (
    <div className="flex flex-col gap-2">
      <Tool defaultOpen={false} className="mb-0 bg-card">
        <ToolHeader type={part.type} state={part.state} title="Catalog lookup" />
        <ToolContent>
          <ToolInput input={part.input} />
          <ToolOutput
            output={output ? { products: output.products.map((p) => p.node.title) } : undefined}
            errorText={part.errorText}
          />
        </ToolContent>
      </Tool>
      {output?.products.map((p) => <ChatProductCard key={p.node.id} product={p} />)}
    </div>
  );
}

function MessageParts({ message, isLastStreaming }: { message: UIMessage; isLastStreaming: boolean }) {
  return (
    <>
      {message.parts.map((part, i) => {
        const key = `${message.id}-${i}`;
        if (part.type === "text") {
          return message.role === "user" ? (
            <p key={key} className="whitespace-pre-wrap">
              {part.text}
            </p>
          ) : (
            <MessageResponse key={key}>{part.text}</MessageResponse>
          );
        }
        if (part.type === "reasoning") {
          if (!part.text.trim()) return null;
          return (
            <Reasoning
              key={key}
              isStreaming={isLastStreaming && part.state === "streaming"}
              defaultOpen={false}
              className="mb-0"
            >
              <ReasoningTrigger />
              <ReasoningContent>{part.text}</ReasoningContent>
            </Reasoning>
          );
        }
        if (part.type === "tool-show_products") {
          return <ProductsTool key={key} part={part as ToolUIPart} />;
        }
        return null;
      })}
    </>
  );
}

export function AssistantPanel({ onClose }: { onClose: () => void }) {
  const { messages, sendMessage, status, stop, setMessages } = useChat({ chat: getAssistantChat() });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (status === "ready" || status === "error") saveMessages(messages);
  }, [messages, status]);

  useEffect(() => {
    if (!busy) textareaRef.current?.focus();
  }, [busy]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    void sendMessage({ text: trimmed });
    textareaRef.current?.focus();
  };

  const handleSubmit = (msg: PromptInputMessage) => send(msg.text);

  const clear = () => {
    if (busy) void stop();
    setMessages([]);
    saveMessages([]);
    textareaRef.current?.focus();
  };

  const last = messages.at(-1);
  const waiting = status === "submitted" || (status === "streaming" && last?.role === "assistant" && last.parts.length === 0);

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <div className="flex shrink-0 items-center gap-3 border-b px-4 py-3">
        <img src={conciergeMark} alt="" width={28} height={28} className="size-7" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-tight">Ordo Concierge</p>
          <p className="label-mono mt-0.5 !text-[0.625rem]">Desk advice · from our catalog</p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="icon-sm" aria-label="Start over" onClick={clear}>
            <RotateCcw />
          </Button>
        )}
        <Button variant="ghost" size="icon-sm" aria-label="Close concierge" onClick={onClose}>
          <X />
        </Button>
      </div>

      <Conversation className="min-h-0">
        <ConversationContent className="gap-6 px-4 py-5">
          {messages.length === 0 ? (
            <div className="flex flex-col gap-6 pt-6">
              <div className="flex flex-col items-start gap-4">
                <img src={conciergeMark} alt="" width={44} height={44} className="size-11" />
                <div>
                  <h2 className="font-display-tight text-3xl">How can I help you work better?</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Ask about materials, ergonomics or what fits your space. I'll suggest pieces from the
                    collection you can add straight to your cart.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-md border bg-background px-3 py-2.5 text-left text-sm transition-colors hover:border-foreground/40"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, idx) => (
              <Message key={m.id} from={m.role}>
                <MessageContent className="group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground leading-relaxed">
                  <MessageParts message={m} isLastStreaming={status === "streaming" && idx === messages.length - 1} />
                </MessageContent>
              </Message>
            ))
          )}
          {waiting && (
            <Message from="assistant">
              <MessageContent>
                <Shimmer className="text-sm">Looking through the collection…</Shimmer>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="shrink-0 border-t p-3">
        <PromptInput onSubmit={handleSubmit} className="bg-background">
          <PromptInputTextarea
            ref={textareaRef}
            autoFocus
            placeholder="Ask about stands, organizers, keyboards…"
            className="min-h-12 text-sm"
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} onStop={() => void stop()} />
          </PromptInputFooter>
        </PromptInput>
        <p className="mt-2 px-1 text-[11px] text-muted-foreground">AI-powered suggestions. Double-check details before you buy.</p>
      </div>
    </div>
  );
}
