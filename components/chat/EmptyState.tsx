import { SUGGESTIONS } from "@/lib/chat";

export function Greeting() {
  return (
    <h1 className="mb-7 px-4 text-center text-[28px] font-semibold tracking-tight sm:text-3xl">
      What can I help with?
    </h1>
  );
}

interface SuggestionsProps {
  onPick: (prompt: string) => void;
}

export function Suggestions({ onPick }: SuggestionsProps) {
  return (
    <ul className="mx-auto mt-3 flex w-full max-w-3xl flex-wrap justify-center gap-2 px-4">
      {SUGGESTIONS.map((prompt) => (
        <li key={prompt}>
          <button
            type="button"
            onClick={() => onPick(prompt)}
            className="rounded-full border border-line px-4 py-2 text-sm transition-colors hover:bg-hover"
          >
            {prompt}
          </button>
        </li>
      ))}
    </ul>
  );
}
