"use client";

import { useEffect, useRef } from "react";
import { C } from "./palette";
import { IconTrash } from "./icons";

type DeleteFileDialogProps = {
  filename: string;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteFileDialog({ filename, deleting, onCancel, onConfirm }: DeleteFileDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelButtonRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !deleting) onCancel();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleting, onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(15, 20, 32, 0.58)", backdropFilter: "blur(3px)" }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !deleting) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-file-title"
        aria-describedby="delete-file-description"
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
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: "#fff0f0", color: "#d14343" }}>
            <IconTrash />
          </div>
          <div className="min-w-0">
            <h2 id="delete-file-title" className="text-base font-semibold" style={{ color: C.textPrimary }}>
              Delete this file?
            </h2>
            <p id="delete-file-description" className="mt-1.5 text-sm leading-6" style={{ color: C.textSecondary }}>
              <span className="font-medium break-all" style={{ color: C.textPrimary }}>“{filename}”</span>{" "}
              will be permanently removed from uploaded files and the knowledge index.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2.5">
          <button
            ref={cancelButtonRef}
            onClick={onCancel}
            disabled={deleting}
            className="rounded-xl text-sm font-medium"
            style={{ padding: "10px 17px", color: C.textSecondary, background: C.pageBg, border: `1px solid ${C.inputBorder}`, opacity: deleting ? 0.5 : 1 }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="rounded-xl text-sm font-semibold text-white"
            style={{ padding: "10px 17px", background: "#d14343", opacity: deleting ? 0.7 : 1, cursor: deleting ? "wait" : "pointer" }}
          >
            {deleting ? "Deleting…" : "Delete file"}
          </button>
        </div>
      </div>
    </div>
  );
}
