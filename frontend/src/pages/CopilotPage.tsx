import { FileText, MessageSquare } from "lucide-react";
import type { RefObject } from "react";
import type { AppView } from "../App";
import { Composer } from "../components/copilot/Composer";
import { MessageCard } from "../components/copilot/MessageCard";
import type { ChatResponse } from "../types/contracts";

export interface LocalMessage {
  role: "user" | "assistant";
  text?: string;
  response?: ChatResponse;
}

interface ConversationSummary {
  id: string;
  title: string;
  updatedAt: Date;
}

interface CopilotPageProps {
  busy: boolean;
  composerKey: number;
  conversationHistory: ConversationSummary[];
  hasActiveConversation: boolean;
  heroOrbTargetRef: RefObject<HTMLDivElement | null>;
  messages: LocalMessage[];
  onSend: (queryText: string) => void;
  status: string | null;
  view: AppView;
}

export function CopilotPage({ busy, composerKey, conversationHistory, hasActiveConversation, heroOrbTargetRef, messages, onSend, status, view }: CopilotPageProps) {
  const showLanding = view === "copilot" && !hasActiveConversation;
  const showChat = view === "copilot" && hasActiveConversation;

  return (
    <main className={`copilot-page ${showChat ? "chat-mode" : ""} ${view !== "copilot" ? "section-mode" : ""}`}>
      <section className={`landing-hero ${showLanding ? "is-visible" : "is-hidden"}`} aria-label="AI Business Intelligence Copilot">
        <h1 className="hero-heading"><span>Insight in Sight.</span><strong>Decisions Done Right.</strong></h1>
        <div ref={heroOrbTargetRef} className="hero-orb-target" aria-hidden="true" />
      </section>

      {showChat && (
        <section className="messages" aria-live="polite">
          {messages.map((message, index) => message.role === "user" ? (
            <div className="user-message" key={`${message.role}-${index}`}>{message.text}</div>
          ) : message.response ? <MessageCard message={message.response} key={message.response.message_id} /> : null)}
          {busy && <div className="thinking-message">Thinking…</div>}
        </section>
      )}

      {view === "history" && (
        <section className="content-panel" aria-labelledby="history-title">
          <div className="panel-heading"><MessageSquare /><div><p>Workspace</p><h1 id="history-title">Chat History</h1></div></div>
          {conversationHistory.length ? <div className="history-list">{conversationHistory.map((conversation) => (
            <article className="history-item" key={conversation.id}><span>{conversation.title}</span><time>{conversation.updatedAt.toLocaleDateString()}</time></article>
          ))}</div> : <p className="empty-copy">Your previous conversations will appear here.</p>}
        </section>
      )}

      {view === "documents" && (
        <section className="content-panel" aria-labelledby="documents-title">
          <div className="panel-heading"><FileText /><div><p>Knowledge base</p><h1 id="documents-title">Documents</h1></div></div>
          <div className="document-dropzone"><FileText /><h2>Your business documents</h2><p>Documents connected to the copilot will appear here.</p></div>
        </section>
      )}

      {view === "copilot" && (
        <section className="command-dock" aria-label="Business copilot prompt">
          <Composer key={composerKey} busy={busy} onSend={onSend} />
          {status && <p className="status">{status}</p>}
        </section>
      )}
    </main>
  );
}
