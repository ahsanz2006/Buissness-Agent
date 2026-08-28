import { useState } from "react";
import { Composer } from "../components/copilot/Composer";
import { MessageCard } from "../components/copilot/MessageCard";
import { OrbHero } from "../components/copilot/OrbHero";
import { sendChat } from "../lib/api";
import type { ChatResponse } from "../types/contracts";

interface LocalMessage {
  role: "user" | "assistant";
  text?: string;
  response?: ChatResponse;
}

export function CopilotPage() {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function onSend(queryText: string) {
    setBusy(true);
    setStatus(null);
    setMessages((items) => [...items, { role: "user", text: queryText }]);

    try {
      const response = await sendChat({
        conversation_id: conversationId,
        query_text: queryText,
        attachment_ids: [],
        voice_mode: false,
      });
      setConversationId(response.conversation_id);
      setMessages((items) => [...items, { role: "assistant", response }]);
      if (response.error) setStatus("I could not complete that request. Please try again.");
    } catch {
      setStatus("I could not complete that request. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const hasChat = messages.length > 0;

  return (
    <main className={`copilot-page ${hasChat ? "chat-mode" : ""}`}>
      {!hasChat && (
        <section className="landing-hero" aria-label="AI Business Intelligence Copilot">
          <h1 className="hero-heading">
            <span>Insight in Sight.</span>
            <strong>Decisions Done Right.</strong>
          </h1>
          <OrbHero />
        </section>
      )}

      {hasChat && (
        <section className="messages" aria-live="polite">
          {messages.map((message, index) =>
            message.role === "user" ? (
              <div className="user-message" key={`${message.role}-${index}`}>
                {message.text}
              </div>
            ) : message.response ? (
              <MessageCard message={message.response} key={message.response.message_id} />
            ) : null,
          )}
        </section>
      )}

      <section className="command-dock" aria-label="Business copilot prompt">
        <Composer busy={busy} onSend={onSend} />
        {status && <p className="status">{status}</p>}
      </section>
    </main>
  );
}
