"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import type { ChatSession, Message, UploadedFileRecord } from "./types";
import { C } from "./components/palette";
import { Sidebar } from "./components/Sidebar";
import { ChatHeader } from "./components/ChatHeader";
import { MessageList } from "./components/MessageList";
import { ChatInput } from "./components/ChatInput";
import { DeleteChatDialog } from "./components/DeleteChatDialog";
import { DeleteFileDialog } from "./components/DeleteFileDialog";

const API = "http://127.0.0.1:8000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? "";
const CHAT_HISTORY_KEY = "navya-chat-history";
const MAX_UPLOAD_SIZE = 25 * 1024 * 1024;
const ALLOWED_UPLOAD_EXTENSIONS = [".txt", ".pdf", ".docx", ".csv", ".json", ".md"];

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail ?? error.response?.data?.message;
    if (typeof detail === "string") return detail;
    if (error.message) return error.message;
  }
  return fallback;
}

export default function Home() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileRecord[]>([]);
  const [chatPendingDeletion, setChatPendingDeletion] = useState<ChatSession | null>(null);
  const [filePendingDeletion, setFilePendingDeletion] = useState<UploadedFileRecord | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [reindexing, setReindexing] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(CHAT_HISTORY_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as ChatSession[];
          if (Array.isArray(parsed)) setChats(parsed);
        }
      } catch (error) {
        console.error("Could not load chat history", error);
      } finally {
        setHistoryLoaded(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!historyLoaded) return;
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chats));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [chats, historyLoaded]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchUploadedFiles()
        .then(setUploadedFiles)
        .catch((error) => console.error("Could not load uploaded files", error));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function uploadFile() {
    if (!file) {
      toast.warning("Please select a file before uploading.");
      return;
    }
    const fileToUpload = file;
    const formData = new FormData();
    formData.append("file", fileToUpload);
    setUploadError(null);
    setFile(null);
    setUploading(true);
    try {
      await axios.post(`${API}/upload`, formData, {
        headers: { "X-API-Key": API_KEY },
      });

      const uploadedFile: UploadedFileRecord = {
        id: fileToUpload.name,
        name: fileToUpload.name,
        size: fileToUpload.size,
        type: fileToUpload.type,
        uploadedAt: new Date().toISOString(),
      };
      setUploadedFiles((previous) => [
        uploadedFile,
        ...previous.filter((item) => item.name !== uploadedFile.name),
      ]);
      toast.success("File uploaded successfully.");

      fetchUploadedFiles()
        .then(setUploadedFiles)
        .catch((error) => console.error("Could not refresh uploaded files", error));
    } catch (error) {
      console.error(error);
      setFile(fileToUpload);
      const message = getErrorMessage(error, "File upload failed. Please try again.");
      setUploadError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }

  function selectUploadFile(selectedFile: File) {
    const extensionIndex = selectedFile.name.lastIndexOf(".");
    const extension = extensionIndex >= 0
      ? selectedFile.name.slice(extensionIndex).toLowerCase()
      : "";

    if (!ALLOWED_UPLOAD_EXTENSIONS.includes(extension)) {
      setFile(null);
      setUploadError("Unsupported file type. Use TXT, PDF, DOCX, CSV, JSON, or MD.");
      return;
    }

    if (selectedFile.size > MAX_UPLOAD_SIZE) {
      setFile(null);
      setUploadError("File is too large. Maximum allowed size is 25 MB.");
      return;
    }

    setFile(selectedFile);
    setUploadError(null);
  }

  async function askQuestion() {
    if (!question.trim()) {
      toast.warning("Please enter a question.");
      return;
    }
    setLoading(true);
    const userQuestion = question;
    const sessionId = activeChatId ?? crypto.randomUUID();
    const now = new Date().toISOString();
    const pendingMessage: Message = { question: userQuestion, answer: "", citations: [] };

    if (!activeChatId) {
      setActiveChatId(sessionId);
      setChats((prev) => [{
        id: sessionId,
        title: createChatTitle(userQuestion),
        messages: [pendingMessage],
        createdAt: now,
        updatedAt: now,
      }, ...prev]);
    } else {
      setChats((prev) => updateChatMessages(prev, sessionId, (current) => [...current, pendingMessage]));
    }
    setQuestion("");
    setMessages((prev) => [...prev, pendingMessage]);
    try {
      const response = await axios.post(
        `${API}/ask`,
        { question: userQuestion },
        { headers: { "X-API-Key": API_KEY } },
      );
      const fullAnswer = response.data.answer;
      let current = "";
      for (const char of fullAnswer) {
        current += char;
        const completedMessage: Message = {
          question: userQuestion,
          answer: current,
          citations: response.data.citations,
        };
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = completedMessage;
          return updated;
        });
        setChats((chatList) => updateChatMessages(chatList, sessionId, (chatMessages) => {
          const updated = [...chatMessages];
          updated[updated.length - 1] = completedMessage;
          return updated;
        }));
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Could not get an answer."));
    } finally {
      setLoading(false);
    }
  }

  function startNewChat() {
    setActiveChatId(null);
    setMessages([]);
    setQuestion("");
  }

  function selectChat(chatId: string) {
    const chat = chats.find((item) => item.id === chatId);
    if (!chat) return;
    setActiveChatId(chat.id);
    setMessages(chat.messages);
    setQuestion("");
  }

  function deleteChat(chatId: string) {
    const chat = chats.find((item) => item.id === chatId);
    if (chat) setChatPendingDeletion(chat);
  }

  function confirmDeleteChat() {
    if (!chatPendingDeletion) return;

    const remaining = chats.filter((item) => item.id !== chatPendingDeletion.id);
    setChats(remaining);
    if (activeChatId === chatPendingDeletion.id) {
      setActiveChatId(null);
      setMessages([]);
      setQuestion("");
    }
    setChatPendingDeletion(null);
    toast.success("Chat deleted.");
  }

  function editResponse(messageIndex: number, answer: string) {
    const updatedMessages = messages.map((message, index) =>
      index === messageIndex ? { ...message, answer } : message,
    );
    setMessages(updatedMessages);
    if (activeChatId) {
      setChats((chatList) =>
        updateChatMessages(chatList, activeChatId, () => updatedMessages),
      );
    }
    toast.success("Response updated.");
  }

  async function confirmDeleteFile() {
    if (!filePendingDeletion) return;

    const fileToDelete = filePendingDeletion;
    const previousFiles = uploadedFiles;
    setDeletingFileId(fileToDelete.id);
    setUploadedFiles((files) => files.filter((item) => item.id !== fileToDelete.id));
    setFilePendingDeletion(null);

    try {
      await axios.delete(`${API}/files/${encodeURIComponent(fileToDelete.name)}`, {
        headers: { "X-API-Key": API_KEY },
      });
      toast.success("File deleted.");
    } catch (error) {
      console.error(error);
      setUploadedFiles(previousFiles);
      toast.error(getErrorMessage(error, "Could not delete the file."));
    } finally {
      setDeletingFileId(null);
    }
  }

  async function exportDocx() {
    if (!messages.length) {
      toast.warning("Ask a question before exporting.");
      return;
    }
    setExportingDocx(true);
    try {
      const response = await axios.post(
        `${API}/export/docx`,
        { messages },
        { responseType: "blob", headers: { "X-API-Key": API_KEY } },
      );
      triggerDownload(response.data, "response.docx");
      toast.success("DOCX exported successfully.");
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "DOCX export failed. Please try again."));
    } finally {
      setExportingDocx(false);
    }
  }

  async function exportExcel() {
    if (!messages.length) {
      toast.warning("Ask a question before exporting.");
      return;
    }
    setExportingExcel(true);
    try {
      const response = await axios.post(
        `${API}/export/excel`,
        { messages },
        { responseType: "blob", headers: { "X-API-Key": API_KEY } },
      );
      triggerDownload(response.data, "response.xlsx");
      toast.success("Excel exported successfully.");
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Excel export failed. Please try again."));
    } finally {
      setExportingExcel(false);
    }
  }

  async function reindex() {
    setReindexing(true);
    try {
      const response = await axios.post(
        `${API}/reindex`,
        {},
        { headers: { "X-API-Key": API_KEY } },
      );
      toast.success(`Re-indexed ${response.data.files_indexed} files successfully.`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Re-index failed."));
    } finally {
      setReindexing(false);
    }
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: C.pageBg, color: C.textPrimary, fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
    >
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      {chatPendingDeletion && (
        <DeleteChatDialog
          chatTitle={chatPendingDeletion.title}
          onCancel={() => setChatPendingDeletion(null)}
          onConfirm={confirmDeleteChat}
        />
      )}

      {filePendingDeletion && (
        <DeleteFileDialog
          filename={filePendingDeletion.name}
          deleting={deletingFileId !== null}
          onCancel={() => setFilePendingDeletion(null)}
          onConfirm={confirmDeleteFile}
        />
      )}

      <Sidebar
        file={file}
        onFileChange={selectUploadFile}
        uploading={uploading}
        onUpload={uploadFile}
        uploadError={uploadError}
        reindexing={reindexing}
        onReindex={reindex}
        exportingDocx={exportingDocx}
        onExportDocx={exportDocx}
        exportingExcel={exportingExcel}
        onExportExcel={exportExcel}
        hasMessages={messages.length > 0}
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={startNewChat}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
        chatActionsDisabled={loading}
        uploadedFiles={uploadedFiles}
        deletingFileId={deletingFileId}
        onDeleteFile={setFilePendingDeletion}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <ChatHeader
          loading={loading}
          title={chats.find((chat) => chat.id === activeChatId)?.title}
        />
        <MessageList
          messages={messages}
          loading={loading}
          messagesEndRef={messagesEndRef}
          onEditResponse={editResponse}
        />
        <ChatInput question={question} onChange={setQuestion} onAsk={askQuestion} loading={loading} />
      </main>
    </div>
  );
}

function createChatTitle(question: string) {
  const clean = question.replace(/\s+/g, " ").trim();
  return clean.length > 42 ? `${clean.slice(0, 42).trim()}…` : clean;
}

async function fetchUploadedFiles() {
  const response = await axios.get<{ files: UploadedFileRecord[] }>(`${API}/files`, {
    headers: { "X-API-Key": API_KEY },
  });
  return response.data.files;
}

function updateChatMessages(
  chats: ChatSession[],
  chatId: string,
  updater: (messages: Message[]) => Message[],
) {
  const updatedAt = new Date().toISOString();
  return chats
    .map((chat) => chat.id === chatId
      ? { ...chat, messages: updater(chat.messages), updatedAt }
      : chat)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function triggerDownload(data: BlobPart, filename: string) {
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
