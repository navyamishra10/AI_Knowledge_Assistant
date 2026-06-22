"use client";

import { useEffect, useRef } from "react";
import { C } from "./palette";
import { IconTrash } from "./icons";

type DeleteChatDialogProps = {
  chatTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteChatDialog({
  chatTitle,
  onCancel,
  onConfirm,
}: DeleteChatDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(15, 20, 32, 0.58)", backdropFilter: "blur(3px)" }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-chat-title"
        aria-describedby="delete-chat-description"
        className="w-full rounded-2xl"
        style={{
          maxWidth: "420px",
          padding: "24px",
          background: C.cardBg,
          border: `1px solid ${C.cardBorder}`,
          boxShadow: "0 24px 70px rgba(15, 20, 32, 0.24)",
        }}
      >
        <div className="flex gap-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "#fff0f0", color: "#d14343" }}
          >
            <IconTrash />
          </div>

          <div className="min-w-0">
            <h2
              id="delete-chat-title"
              className="text-base font-semibold"
              style={{ color: C.textPrimary, letterSpacing: "-0.01em" }}
            >
              Delete this chat?
            </h2>
            <p
              id="delete-chat-description"
              className="mt-1.5 text-sm leading-6"
              style={{ color: C.textSecondary }}
            >
              <span className="font-medium" style={{ color: C.textPrimary }}>
                “{chatTitle}”
              </span>{" "}
              will be permanently removed from your chat history.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2.5">
          <button
            ref={cancelButtonRef}
            onClick={onCancel}
            className="rounded-xl text-sm font-medium transition-colors"
            style={{
              padding: "10px 17px",
              color: C.textSecondary,
              background: C.pageBg,
              border: `1px solid ${C.inputBorder}`,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl text-sm font-semibold text-white transition-colors"
            style={{
              padding: "10px 17px",
              background: "#d14343",
              boxShadow: "0 2px 8px rgba(209, 67, 67, 0.24)",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = "#b93636";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = "#d14343";
            }}
          >
            Delete chat
          </button>
        </div>
      </div>
    </div>
  );
}
