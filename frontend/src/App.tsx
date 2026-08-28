import { useEffect, useMemo, useRef, useState } from "react";
import { OrbHero } from "./components/copilot/OrbHero";
import { Sidebar } from "./components/layout/Sidebar";
import { sendChat } from "./lib/api";
import { CopilotPage, type LocalMessage } from "./pages/CopilotPage";

export type AppView = "copilot" | "history" | "documents";

interface ConversationSummary {
  id: string;
  title: string;
  updatedAt: Date;
}

function viewFromPath(): AppView {
  if (window.location.pathname === "/history") return "history";
  if (window.location.pathname === "/documents") return "documents";
  return "copilot";
}

export function App() {
  const [view, setView] = useState<AppView>(viewFromPath);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [history, setHistory] = useState<ConversationSummary[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [composerKey, setComposerKey] = useState(0);
  const requestEpoch = useRef(0);
  const heroOrbTargetRef = useRef<HTMLDivElement | null>(null);
  const sidebarOrbTargetRef = useRef<HTMLDivElement | null>(null);

  const hasActiveConversation = Boolean(conversationId) || messages.length > 0;
  const orbIsParked = hasActiveConversation || view !== "copilot";

  const conversationHistory = useMemo(() => {
    if (!hasActiveConversation) return history;
    const firstQuestion = messages.find((message) => message.role === "user")?.text;
    const current: ConversationSummary = {
      id: conversationId ?? "current-conversation",
      title: firstQuestion ?? "Current conversation",
      updatedAt: new Date(),
    };
    return [current, ...history.filter((item) => item.id !== current.id)];
  }, [conversationId, hasActiveConversation, history, messages]);

  useEffect(() => {
    const onPopState = () => setView(viewFromPath());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function navigate(nextView: AppView, replace = false) {
    const path = nextView === "copilot" ? "/" : `/${nextView}`;
    if (window.location.pathname !== path) {
      window.history[replace ? "replaceState" : "pushState"]({}, "", path);
    }
    setView(nextView);
  }

  function startNewChat() {
    requestEpoch.current += 1;
    const firstQuestion = messages.find((message) => message.role === "user")?.text;
    if (hasActiveConversation && firstQuestion) {
      setHistory((items) => [
        {
          id: conversationId ?? `local-${Date.now()}`,
          title: firstQuestion,
          updatedAt: new Date(),
        },
        ...items.filter((item) => item.id !== conversationId),
      ]);
    }
    setMessages([]);
    setConversationId(null);
    setBusy(false);
    setStatus(null);
    setComposerKey((key) => key + 1);
    navigate("copilot");
  }

  async function onSend(queryText: string) {
    const epoch = requestEpoch.current;
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
      if (requestEpoch.current !== epoch) return;
      setConversationId(response.conversation_id);
      setMessages((items) => [...items, { role: "assistant", response }]);
      if (response.error) setStatus("I could not complete that request. Please try again.");
    } catch {
      if (requestEpoch.current === epoch) {
        setStatus("I could not complete that request. Please try again.");
      }
    } finally {
      if (requestEpoch.current === epoch) setBusy(false);
    }
  }

  return (
    <div className="app-shell">
      <Sidebar
        activeView={view}
        hasActiveConversation={hasActiveConversation}
        orbTargetRef={sidebarOrbTargetRef}
        onNewChat={startNewChat}
        onNavigate={navigate}
      />
      <OrbHero busy={busy} destinationRef={orbIsParked ? sidebarOrbTargetRef : heroOrbTargetRef} parked={orbIsParked} />
      <CopilotPage
        busy={busy}
        composerKey={composerKey}
        conversationHistory={conversationHistory}
        hasActiveConversation={hasActiveConversation}
        heroOrbTargetRef={heroOrbTargetRef}
        messages={messages}
        onSend={onSend}
        status={status}
        view={view}
      />
    </div>
  );
}
