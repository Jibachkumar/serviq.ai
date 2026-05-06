import { useEffect, useState, useRef, useCallback, memo } from "react";
import { Send, MessageCircle } from "lucide-react";
import { io, Socket } from "socket.io-client";

const ChatInput = memo(
  ({
    input,
    setInput,
    sendMessage,
    handleKeyDown,
    inputRef,
  }: {
    input: string;
    setInput: (v: string) => void;
    sendMessage: () => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    inputRef: React.MutableRefObject<string>;
  }) => {
    return (
      <div className="px-4 py-3 border-t border-border flex gap-2 bg-surface items-center">
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            inputRef.current = e.target.value; // ✅ sync ref
          }}
          onKeyDown={handleKeyDown}
          type="text"
          placeholder="Type your message..."
          className="flex-1 px-3 py-2 text-sm border border-border outline-none rounded-full"
        />
        <button
          onClick={sendMessage}
          className="text-white bg-purple p-2 rounded-full"
        >
          <Send size={18} />
        </button>
      </div>
    );
  },
);

const MessageList = memo(function MessageList({
  messages,
  retryMessage,
}: {
  messages: any[];
  retryMessage: (msg: any) => void;
}) {
  return (
    <>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${
            msg.sender === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`px-[14px] py-[10px] text-[13px] leading-[1.5] ${
              msg.sender === "user"
                ? "bg-purple text-white rounded-[14px_14px_4px_14px]"
                : "bg-surface text-text border border-border rounded-[14px_14px_14px_4px]"
            }`}
          >
            <div className="text-xs opacity-70 font-semibold">
              {msg.sender === "user" ? "You" : "AI"}
            </div>
            <div>{msg.msg}</div>
            {/* status */}
            {msg.sender === "user" && (
              <div className="text-xs mt-1 text-right">
                {msg.status === "sending" && "Sending..."}
                {msg.status === "sent" && ""}
                {msg.status === "failed" && (
                  <span
                    className="text-red-500 cursor-pointer"
                    onClick={() => retryMessage(msg)}
                  >
                    Failed. Retry
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
});

export default function ChatSupport() {
  type Status = "sending" | "sent" | "failed";

  interface Message {
    id: string;
    msg: string;
    sender: "user" | "ai";
    time: string;
    status?: Status;
  }
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<string>("");

  /* ================= RESET STATES ON CLOSE ================= */
  useEffect(() => {
    if (!isOpen) {
      setIsTyping(false); // 🔥 reset typing when chat closes
      setInput("");
    }
  }, [isOpen]);

  // SOCKET INIT
  useEffect(() => {
    const existingConvoId = localStorage.getItem("conversationId");
    console.log("🔑 Existing convoId:", existingConvoId);

    // create a brand-new socket connection every time the component re-renders or mounts.
    const socket = io(import.meta.env.VITE_API_URL as string, {
      withCredentials: true, // 🔥 IMPORTANT for session cookies,
      autoConnect: true, // connect immediately on mount
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      query: {
        conversationId: existingConvoId ?? "", // ← is this being sent?
      },
    });
    socketRef.current = socket;

    socket.on("session", (data: { conversationId: string }) => {
      localStorage.setItem("conversationId", data.conversationId);
    });

    socket.on("upgrade-session", () => {
      localStorage.removeItem("conversationId"); // ✅ remove when booking starts
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  /* ================= CONNECT / EVENTS ================= */
  useEffect(() => {
    // Only connect socket once
    const socket = socketRef.current;
    if (!socket) return;

    // ✅ Listen for messages from server
    const handleReceive = (data: { msg: string; isWelcome?: boolean }) => {
      setIsTyping(false);

      setMessages((prev) => {
        // ❌ prevent duplicate welcome
        if (data.isWelcome && prev.length > 0) return prev;

        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            msg: data.msg,
            sender: "ai",
            time: new Date().toISOString(),
          },
        ];
      });
    };

    const handleError = (err: Error) => {
      console.error("❌ Socket error:", err.message);
      // setIsConnected(false);
      setIsTyping(false);
    };

    const handleMessageError = (data: { msg: string }) => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          msg: data.msg,
          sender: "ai",
          time: new Date().toISOString(),
        },
      ]);
    };

    const handleHistory = (data: {
      messages: { sender: "user" | "ai"; content: string }[];
    }) => {
      const formatted = data.messages.map((m) => ({
        id: crypto.randomUUID(),
        msg: m.content,
        sender: m.sender,
        time: new Date().toISOString(),
      }));

      setMessages(formatted);
    };

    socket.on("receive-message", handleReceive);
    socket.on("connect_error", handleError);
    socket.on("message-error", handleMessageError);
    socket.on("message-history", handleHistory);

    return () => {
      socket.off("receive-message", handleReceive);
      socket.off("connect_error", handleError);
      socket.off("message-error", handleMessageError);
      socket.off("message-history", handleHistory);
    };
  }, []);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= SEND MESSAGE ================= */
  const sendMessage = useCallback(() => {
    const socket = socketRef.current;
    const value = inputRef.current;
    if (!socket || !value.trim()) return;

    const payload = { text: value };
    const id = crypto.randomUUID();

    // show user message instantly
    setMessages((prev) => [
      ...prev,
      {
        id: id,
        msg: value,
        sender: "user",
        time: new Date().toISOString(),
        status: "sending",
      },
    ]);

    // send to server
    console.log(payload);
    socket
      .timeout(30000)
      .emit(
        "send-message",
        payload,
        (err: any, response: { success: boolean }) => {
          if (err || !response?.success) {
            // mark failed
            setMessages((prev) =>
              prev.map((m) => (m.id === id ? { ...m, status: "failed" } : m)),
            );
            setIsTyping(false);
            return;
          }

          // mark sent
          setMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, status: "sent" } : m)),
          );
        },
      );
    setInput("");
    inputRef.current = "";
    setIsTyping(true);
  }, []);

  /* ================= RETRY ================= */
  const retryMessage = useCallback((msg: Message) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, status: "sending" } : m)),
    );

    const socket = socketRef.current;
    if (!socket) return;

    setIsTyping(true);

    socket
      .timeout(3000)
      .emit(
        "send-message",
        { text: msg.msg },
        (err: any, response: { success: boolean }) => {
          if (err || !response?.success) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === msg.id ? { ...m, status: "failed" } : m,
              ),
            );
            setIsTyping(false);
            return;
          }

          setMessages((prev) =>
            prev.map((m) => (m.id === msg.id ? { ...m, status: "sent" } : m)),
          );
        },
      );
  }, []);

  /* ================= ENTER KEY ================= */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") sendMessage();
    },
    [sendMessage],
  );

  return (
    <div className="relative">
      {/* Chat Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-20 z-50 bg-purple/90 text-white p-4 rounded-full shadow-xl hover:bg-purple transition"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-34 right-20 flex flex-col w-[525px] h-[452px] bg-ink-light border border-border rounded-[20px] shadow-[0_40px_80px_rgba(0,0,0,0.5),0_0_0_1px_var(--border)] overflow-hidden">
          {/* Header */}
          <div className="bg-surface border-b border-border px-[18px] py-[18px] text-white flex items-center justify-between">
            <div>
              <div className="font-['Syne',sans-serif] text-[13px] font-semibold text-text">
                Serviq AI
              </div>
              <div className="flex items-center gap-1 text-[11px] text-teal">
                <div className="h-[5px] w-[5px] rounded-full bg-teal animate-[pulse_2s_infinite]" />
                Always online
              </div>
            </div>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface">
            <MessageList messages={messages} retryMessage={retryMessage} />

            {isTyping && (
              <div className="text-sm text-gray-400 italic">
                AI is typing...
              </div>
            )}

            {/* auto scroll target */}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <ChatInput
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
            handleKeyDown={handleKeyDown}
            inputRef={inputRef}
          />
        </div>
      )}
    </div>
  );
}
