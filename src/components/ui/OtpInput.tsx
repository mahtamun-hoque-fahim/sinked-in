"use client";

import { useRef } from "react";

const LENGTH = 6;

export default function OtpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.padEnd(LENGTH, " ").split("");

  function setDigit(index: number, digit: string) {
    const next = digits.slice();
    next[index] = digit || " ";
    const joined = next.join("").replace(/ /g, "");
    onChange(joined);
    if (digit && index < LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index].trim() && index > 0) {
      refs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, LENGTH);
    if (pasted) {
      e.preventDefault();
      onChange(pasted);
      refs.current[Math.min(pasted.length, LENGTH - 1)]?.focus();
    }
  }

  return (
    <div className="flex gap-2" role="group" aria-label="Verification code">
      {Array.from({ length: LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          value={digits[i].trim()}
          onChange={(e) => setDigit(i, e.target.value.replace(/[^0-9]/g, ""))}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="font-mono text-2xl text-center w-12 h-14 bg-surface border border-border rounded-sm text-text focus:border-accent focus:outline-none"
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}
