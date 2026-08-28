import { ArrowUp } from "lucide-react";
import { FormEvent, KeyboardEvent, useRef, useState } from "react";

interface ComposerProps {
  busy: boolean;
  onSend: (queryText: string) => void;
}

const MAX_TEXTAREA_HEIGHT = 170;

export function Composer({ busy, onSend }: ComposerProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  function submit(event: FormEvent) {
    event.preventDefault();
    const queryText = text.trim();
    if (!queryText || busy) return;
    onSend(queryText);
    setText("");
    requestAnimationFrame(() => {
      if (!inputRef.current) return;
      resizeTextarea(inputRef.current);
      inputRef.current.focus();
    });
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const nativeEvent = event.nativeEvent as KeyboardEvent<HTMLTextAreaElement>["nativeEvent"] & {
      isComposing?: boolean;
    };
    if (nativeEvent.isComposing || nativeEvent.keyCode === 229) return;
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  function onTextChange(value: string, textarea: HTMLTextAreaElement) {
    setText(value);
    resizeTextarea(textarea);
  }

  return (
    <form className="composer" onSubmit={submit}>
      <textarea
        ref={inputRef}
        aria-label="Ask anything about your business"
        placeholder="Ask about your business..."
        value={text}
        rows={1}
        onChange={(event) => onTextChange(event.target.value, event.currentTarget)}
        onKeyDown={onKeyDown}
      />
      <button type="submit" className="send-button" disabled={busy || !text.trim()} aria-label="Send message" title="Send">
        <ArrowUp size={20} />
      </button>
    </form>
  );
}

function resizeTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  const nextHeight = Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT);
  textarea.style.height = `${nextHeight}px`;
  textarea.style.overflowY = textarea.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
}
