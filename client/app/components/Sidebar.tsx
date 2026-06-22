"use client";

import { useEffect, useRef } from "react";
import type { ChatSession, UploadedFileRecord } from "../types";
import { C } from "./palette";
import {
  IconBrain, IconUpload, IconFile, IconRefresh,
  IconDocx, IconExcel, IconPlus, IconChat, IconTrash, Spinner, SpinnerLight,
} from "./icons";

type SidebarProps = {
  file: File | null;
  onFileChange: (file: File) => void;
  uploading: boolean;
  onUpload: () => void;
  uploadError: string | null;
  reindexing: boolean;
  onReindex: () => void;
  exportingDocx: boolean;
  onExportDocx: () => void;
  exportingExcel: boolean;
  onExportExcel: () => void;
  hasMessages: boolean;
  chats: ChatSession[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  chatActionsDisabled: boolean;
  uploadedFiles: UploadedFileRecord[];
  deletingFileId: string | null;
  onDeleteFile: (file: UploadedFileRecord) => void;
};

export function Sidebar({
  file, onFileChange,
  uploading, onUpload, uploadError,
  reindexing, onReindex,
  exportingDocx, onExportDocx,
  exportingExcel, onExportExcel,
  hasMessages,
  chats, activeChatId,
  onNewChat, onSelectChat, onDeleteChat,
  chatActionsDisabled,
  uploadedFiles,
  deletingFileId,
  onDeleteFile,
}: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [file]);

  return (
    <aside
      className="flex flex-col shrink-0 overflow-y-auto"
      style={{ width: "272px", background: C.sidebarBg, borderRight: `1px solid ${C.sidebarBorder}` }}
    >
      {/* Brand */}
      <div className="px-6 pt-7 pb-5">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-xl text-white shrink-0"
            style={{ width: "36px", height: "36px", background: C.accent }}
          >
            <IconBrain />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight" style={{ color: C.cardBg, letterSpacing: "-0.01em" }}>
              AI Knowledge Assistant
            </p>
            <p className="text-xs" style={{ color: C.textMuted }}>
              RAG-powered assistant
            </p>
          </div>
        </div>
      </div>

      <div style={{ height: "1px", background: C.sidebarBorder, margin: "0 24px" }} />

      {/* Chat history */}
      <div className="px-4 pt-5">
        <div className="flex items-center justify-between px-2 mb-3">
          <p className="text-xs font-semibold uppercase" style={{ color: C.sidebarTextMuted, letterSpacing: "0.08em" }}>
            Chat History
          </p>
          <button
            onClick={onNewChat}
            disabled={chatActionsDisabled}
            aria-label="Start a new chat"
            title="New chat"
            className="flex items-center justify-center rounded-lg transition-colors"
            style={{
              width: "28px",
              height: "28px",
              color: C.sidebarTextSecond,
              background: "#252d40",
              opacity: chatActionsDisabled ? 0.5 : 1,
              cursor: chatActionsDisabled ? "not-allowed" : "pointer",
            }}
          >
            <IconPlus />
          </button>
        </div>

        <div
          className="flex flex-col gap-1 overflow-y-auto pr-1"
          style={{ maxHeight: "190px", scrollbarColor: `${C.sidebarBorder} transparent` }}
        >
          {chats.length === 0 ? (
            <p className="text-xs px-2 py-3" style={{ color: C.sidebarTextMuted }}>
              Your conversations will appear here.
            </p>
          ) : chats.map((chat) => {
            const active = chat.id === activeChatId;
            return (
              <div
                key={chat.id}
                className="group flex items-center rounded-xl transition-colors"
                style={{ background: active ? "#303951" : "transparent" }}
              >
                <button
                  onClick={() => onSelectChat(chat.id)}
                  disabled={chatActionsDisabled}
                  className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                  style={{
                    padding: "9px 8px",
                    color: active ? C.sidebarText : C.sidebarTextSecond,
                    cursor: chatActionsDisabled ? "not-allowed" : "pointer",
                  }}
                  title={chat.title}
                >
                  <span className="shrink-0" style={{ color: active ? "#aaa9ff" : C.sidebarTextMuted }}>
                    <IconChat />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium">{chat.title}</span>
                    <span className="block text-[10px] mt-0.5" style={{ color: C.sidebarTextMuted }}>
                      {formatChatDate(chat.updatedAt)}
                    </span>
                  </span>
                </button>
                <button
                  onClick={() => onDeleteChat(chat.id)}
                  disabled={chatActionsDisabled}
                  aria-label={`Delete ${chat.title}`}
                  title="Delete chat"
                  className="mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors"
                  style={{
                    color: C.sidebarTextMuted,
                    cursor: chatActionsDisabled ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#ff9b9b";
                    e.currentTarget.style.background = "#3b2c39";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = C.sidebarTextMuted;
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <IconTrash />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ height: "1px", background: C.sidebarBorder, margin: "16px 24px 0" }} />

      {/* Documents */}
      <div className="px-6 pt-5">
        <p className="text-xs font-semibold uppercase mb-3" style={{ color: C.labelText, letterSpacing: "0.08em" }}>
          Documents
        </p>

        {/* Drop zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="rounded-xl cursor-pointer transition-all mb-3 flex flex-col items-center justify-center"
          style={{
            border: `1.5px dashed ${C.inputBorder}`,
            padding: "18px 12px",
            background: file ? "#f0ebe0" : "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = C.accent;
            e.currentTarget.style.background = C.accentLight;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = C.inputBorder;
            e.currentTarget.style.background = file ? "#f0ebe0" : "transparent";
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf,.docx,.csv,.json,.md"
            className="hidden"
            onChange={(e) => { if (e.target.files) onFileChange(e.target.files[0]); }}
          />
          {file ? (
            <div className="flex items-center gap-2" style={{ color: C.accent }}>
              <IconFile />
              <span
                className="text-xs font-medium"
                style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {file.name}
              </span>
            </div>
          ) : (
            <>
              <div className="mb-1.5" style={{ color: C.textMuted }}><IconUpload /></div>
              <p className="text-xs" style={{ color: C.textMuted }}>Click to select a file</p>
            </>
          )}
        </div>

        {file && !uploadError && (
          <p className="mb-3 text-xs" style={{ color: C.sidebarTextSecond }}>
            Ready to upload · {formatFileSize(file.size)}
          </p>
        )}

        {uploadError && (
          <div
            role="alert"
            className="mb-3 rounded-lg text-xs leading-5"
            style={{
              padding: "8px 10px",
              color: "#ffb4b4",
              background: "#3b2c39",
              border: "1px solid #573746",
            }}
          >
            {uploadError}
          </div>
        )}

        {/* Upload button */}
        <button
          onClick={onUpload}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 rounded-xl text-sm font-medium text-white transition-all"
          style={{
            padding: "10px 16px",
            background: uploading ? C.accentHover : C.accent,
            opacity: uploading ? 0.75 : 1,
            cursor: uploading ? "not-allowed" : "pointer",
            letterSpacing: "-0.01em",
          }}
          onMouseEnter={(e) => { if (!uploading) e.currentTarget.style.background = C.accentHover; }}
          onMouseLeave={(e) => { if (!uploading) e.currentTarget.style.background = C.accent; }}
        >
          {uploading ? <><SpinnerLight /> Uploading...</> : <><IconUpload /> Upload Document</>}
        </button>

        {/* Re-index button */}
        <button
          onClick={onReindex}
          disabled={reindexing}
          className="w-full flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all"
          style={{
            padding: "10px 16px",
            marginTop: "8px",
            background: "transparent",
            border: `1.5px solid ${C.inputBorder}`,
            color: C.textSecondary,
            opacity: reindexing ? 0.65 : 1,
            cursor: reindexing ? "not-allowed" : "pointer",
            letterSpacing: "-0.01em",
          }}
          onMouseEnter={(e) => {
            if (!reindexing) {
              e.currentTarget.style.borderColor = C.accent;
              e.currentTarget.style.color = C.accent;
              e.currentTarget.style.background = C.accentLight;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = C.inputBorder;
            e.currentTarget.style.color = C.textSecondary;
            e.currentTarget.style.background = "transparent";
          }}
        >
          {reindexing ? <><Spinner /> Re-indexing...</> : <><IconRefresh /> Re-index Documents</>}
        </button>

        {/* Uploaded file history */}
        <div className="mt-5">
          <div className="mb-2.5 flex items-center justify-between">
            <p
              className="text-[11px] font-semibold uppercase"
              style={{ color: C.sidebarTextMuted, letterSpacing: "0.08em" }}
            >
              Uploaded Files
            </p>
            {uploadedFiles.length > 0 && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ color: C.sidebarTextSecond, background: "#252d40" }}
              >
                {uploadedFiles.length}
              </span>
            )}
          </div>

          <div
            className="flex flex-col gap-1.5 overflow-y-auto pr-1"
            style={{ maxHeight: "180px", scrollbarColor: `${C.sidebarBorder} transparent` }}
          >
            {uploadedFiles.length === 0 ? (
              <p className="py-2 text-xs leading-5" style={{ color: C.sidebarTextMuted }}>
                Successfully uploaded files will appear here.
              </p>
            ) : uploadedFiles.map((uploadedFile) => (
              <div
                key={uploadedFile.id}
                className="flex min-w-0 items-center gap-2.5 rounded-xl"
                style={{ padding: "9px 10px", background: "#252d40" }}
                title={uploadedFile.name}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                  style={{ color: "#aaa9ff", background: "#303951" }}
                >
                  <IconFile />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className="block truncate text-xs font-medium"
                    style={{ color: C.sidebarText }}
                  >
                    {uploadedFile.name}
                  </span>
                  <span
                    className="mt-0.5 block text-[10px]"
                    style={{ color: C.sidebarTextMuted }}
                  >
                    {formatFileSize(uploadedFile.size)} · {formatChatDate(uploadedFile.uploadedAt)}
                  </span>
                </span>
                <button
                  onClick={() => onDeleteFile(uploadedFile)}
                  disabled={deletingFileId !== null}
                  aria-label={`Delete ${uploadedFile.name}`}
                  title="Delete file"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors"
                  style={{
                    color: C.sidebarTextMuted,
                    opacity: deletingFileId === uploadedFile.id ? 0.45 : 1,
                    cursor: deletingFileId ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={(event) => {
                    if (!deletingFileId) {
                      event.currentTarget.style.color = "#ff9b9b";
                      event.currentTarget.style.background = "#3b2c39";
                    }
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.color = C.sidebarTextMuted;
                    event.currentTarget.style.background = "transparent";
                  }}
                >
                  <IconTrash />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="px-6 pb-5 pt-5 mt-4" style={{ borderTop: `1px solid ${C.sidebarBorder}` }}>
        <p className="text-xs font-semibold uppercase mb-3" style={{ color: C.labelText, letterSpacing: "0.08em" }}>
          Export Conversation
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={onExportDocx}
            disabled={exportingDocx || !hasMessages}
            className="flex items-center gap-2 rounded-xl text-sm font-medium text-white transition-all"
            style={{
              padding: "9px 14px",
              background: C.docxBg,
              opacity: exportingDocx || !hasMessages ? 0.4 : 1,
              cursor: exportingDocx || !hasMessages ? "not-allowed" : "pointer",
              letterSpacing: "-0.01em",
            }}
            onMouseEnter={(e) => { if (!exportingDocx && hasMessages) e.currentTarget.style.background = C.docxHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.docxBg; }}
          >
            {exportingDocx ? <><SpinnerLight size="xs" /> Exporting...</> : <><IconDocx /> Export as DOCX</>}
          </button>

          <button
            onClick={onExportExcel}
            disabled={exportingExcel || !hasMessages}
            className="flex items-center gap-2 rounded-xl text-sm font-medium text-white transition-all"
            style={{
              padding: "9px 14px",
              background: C.excelBg,
              opacity: exportingExcel || !hasMessages ? 0.4 : 1,
              cursor: exportingExcel || !hasMessages ? "not-allowed" : "pointer",
              letterSpacing: "-0.01em",
            }}
            onMouseEnter={(e) => { if (!exportingExcel && hasMessages) e.currentTarget.style.background = C.excelHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.excelBg; }}
          >
            {exportingExcel ? <><SpinnerLight size="xs" /> Exporting...</> : <><IconExcel /> Export as Excel</>}
          </button>
        </div>
      </div>

      {/* Ethical AI */}
      <div className="px-6 pb-5 pt-4" style={{ borderTop: `1px solid ${C.sidebarBorder}` }}>
        <p className="text-xs font-semibold uppercase mb-2" style={{ color: C.labelText, letterSpacing: "0.08em" }}>
          Ethical AI
        </p>
        <p className="text-xs leading-relaxed" style={{ color: C.textMuted }}>
          This assistant answers only from uploaded documents. Always verify critical information with authoritative sources. Do not upload confidential or personal data.
        </p>
      </div>
    </aside>
  );
}

function formatChatDate(value: string) {
  const date = new Date(value);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
