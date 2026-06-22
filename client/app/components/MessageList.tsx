"use client";

import { useState, type RefObject } from "react";
import type { Message } from "../types";
import { C } from "./palette";
import { IconBrain, IconEdit } from "./icons";
import { MarkdownContent } from "./MarkdownContent";

type MessageListProps = {
  messages: Message[];
  loading: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  onEditResponse: (messageIndex: number, answer: string) => void;
};

export function MessageList({
  messages,
  loading,
  messagesEndRef,
  onEditResponse,
}: MessageListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draftAnswer, setDraftAnswer] = useState("");

  function beginEditing(index: number, answer: string) {
    setEditingIndex(index);
    setDraftAnswer(answer);
  }

  function cancelEditing() {
    setEditingIndex(null);
    setDraftAnswer("");
  }

  function saveResponse(index: number) {
    if (!draftAnswer.trim()) return;
    onEditResponse(index, draftAnswer.trim());
    cancelEditing();
  }

  return (
    <div
      className="flex-1 overflow-y-auto px-8 py-8"
      style={{ scrollbarWidth: "thin", scrollbarColor: `${C.divider} ${C.pageBg}` }}
    >
      {messages.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center h-full text-center select-none">
          <div
            className="flex items-center justify-center rounded-2xl mb-4"
            style={{ width: "56px", height: "56px", background: C.cardBg, border: `1px solid ${C.cardBorder}`, color: C.accent }}
          >
            <IconBrain />
          </div>
          <p className="text-sm font-medium" style={{ color: C.textSecondary }}>
            No conversation yet
          </p>
          <p className="text-xs mt-1" style={{ color: C.textMuted }}>
            Upload a document, then ask a question to get started.
          </p>
        </div>
      )}

      <div className="space-y-6 max-w-3xl mx-auto">
        {messages.map((message, index) => (
          <div key={index} className="space-y-3">
            {/* User bubble */}
            <div className="flex justify-end">
              <div
                className="rounded-2xl text-sm leading-relaxed"
                style={{
                  background: C.userBubble,
                  color: "#ffffff",
                  padding: "11px 16px",
                  maxWidth: "520px",
                  borderBottomRightRadius: "5px",
                  letterSpacing: "-0.01em",
                }}
              >
                {message.question}
              </div>
            </div>

            {/* AI bubble */}
            <div className="flex gap-3">
              <div
                className="flex items-center justify-center rounded-xl shrink-0 mt-0.5"
                style={{ width: "30px", height: "30px", background: C.accentLight, border: `1px solid ${C.cardBorder}`, color: C.accent }}
              >
                <IconBrain />
              </div>

              <div
                className="flex-1 rounded-2xl"
                style={{
                  background: C.cardBg,
                  border: `1px solid ${C.cardBorder}`,
                  padding: "16px 20px",
                  borderTopLeftRadius: "5px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                {editingIndex === index ? (
                  <div>
                    <textarea
                      value={draftAnswer}
                      onChange={(event) => setDraftAnswer(event.target.value)}
                      aria-label="Edit assistant response"
                      autoFocus
                      rows={8}
                      className="w-full resize-y rounded-xl text-sm leading-6"
                      style={{
                        minHeight: "150px",
                        padding: "12px 14px",
                        color: C.textPrimary,
                        background: C.inputBg,
                        border: `1.5px solid ${C.inputFocus}`,
                        outline: "none",
                        boxShadow: "0 0 0 3px rgba(84, 83, 214, 0.1)",
                        fontFamily: "inherit",
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") cancelEditing();
                        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                          saveResponse(index);
                        }
                      }}
                    />
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-xs" style={{ color: C.textMuted }}>
                        Ctrl/⌘ + Enter to save
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={cancelEditing}
                          className="rounded-lg text-xs font-medium"
                          style={{
                            padding: "7px 12px",
                            color: C.textSecondary,
                            border: `1px solid ${C.inputBorder}`,
                            background: C.pageBg,
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveResponse(index)}
                          disabled={!draftAnswer.trim()}
                          className="rounded-lg text-xs font-semibold text-white"
                          style={{
                            padding: "7px 12px",
                            background: C.accent,
                            opacity: draftAnswer.trim() ? 1 : 0.45,
                            cursor: draftAnswer.trim() ? "pointer" : "not-allowed",
                          }}
                        >
                          Save changes
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1 text-sm leading-7" style={{ color: C.textPrimary }}>
                        <MarkdownContent>{message.answer}</MarkdownContent>
                        {loading && index === messages.length - 1 && (
                          <span className="animate-pulse inline-block ml-0.5" style={{ color: C.accent }}>▊</span>
                        )}
                      </div>
                      {!loading && message.answer && (
                        <button
                          onClick={() => beginEditing(index, message.answer)}
                          aria-label="Edit assistant response"
                          title="Edit response"
                          className="flex shrink-0 items-center gap-1.5 rounded-lg text-xs font-medium transition-colors"
                          style={{
                            padding: "6px 8px",
                            color: C.textMuted,
                            background: C.pageBg,
                            border: `1px solid ${C.divider}`,
                          }}
                          onMouseEnter={(event) => {
                            event.currentTarget.style.color = C.accent;
                            event.currentTarget.style.borderColor = C.pillBorder;
                            event.currentTarget.style.background = C.accentLight;
                          }}
                          onMouseLeave={(event) => {
                            event.currentTarget.style.color = C.textMuted;
                            event.currentTarget.style.borderColor = C.divider;
                            event.currentTarget.style.background = C.pageBg;
                          }}
                        >
                          <IconEdit />
                          Edit
                        </button>
                      )}
                    </div>

                    {message.citations.length > 0 && (
                      <>
                        <div style={{ height: "1px", background: C.divider, margin: "12px 0" }} />
                        <div>
                          <p className="text-xs font-semibold uppercase mb-2" style={{ color: C.labelText, letterSpacing: "0.08em" }}>
                            Sources
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {message.citations.map((citation, i) => (
                              <span
                                key={i}
                                className="rounded-full text-xs px-2.5 py-1"
                                style={{ background: C.pillBg, border: `1px solid ${C.pillBorder}`, color: C.pillText }}
                              >
                                {citation}
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
