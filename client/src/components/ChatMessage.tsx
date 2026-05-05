import { useEffect, useState, useRef } from "react";
import { Send, MessageCircle } from "lucide-react";
import { io, Socket } from "socket.io-client";

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
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* ================= RESET STATES ON CLOSE ================= */
  useEffect(() => {
    if (!isOpen) {
      setIsTyping(false); // 🔥 reset typing when chat closes
      setInput("");
    }
  }, [isOpen]);

  const existingConvoId = localStorage.getItem("conversationId");
  console.log("🔑 Existing convoId:", existingConvoId);

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

    if (socket.connected) {
      setIsConnected(true);
    }

    /* ✅ CONNECTION EVENTS */
    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleError = (err: Error) => {
      console.error("❌ Socket error:", err.message);
      setIsConnected(false);
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

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleError);
    socket.on("message-error", handleMessageError);

    // ✅ Listen for messages from server
    const handleReceive = (data: { msg: string }) => {
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
    socket.on("receive-message", handleReceive);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("receive-message", handleReceive);
      socket.off("connect_error", handleError);
      socket.off("message-error", handleMessageError);
    };
  }, []);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= SEND MESSAGE ================= */
  const sendMessage = () => {
    const socket = socketRef.current;
    if (!socket || !input.trim()) return;

    const payload = { text: input };
    const id = crypto.randomUUID();

    // show user message instantly
    setMessages((prev) => [
      ...prev,
      {
        id: id,
        msg: input,
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
    setIsTyping(true);
  };

  /* ================= RETRY ================= */
  const retryMessage = (msg: Message) => {
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
  };

  /* ================= ENTER KEY ================= */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

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
        <div className="fixed bottom-34 right-20 flex flex-col w-[550px] h-[500px] bg-white rounded-[20px] shadow-[0_40px_80px_rgba(0,0,0,0.5),0_0_0_1px_var(--border)] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple via-purple to-purple p-4 text-white flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">AI Assistant</h2>
              <p className="text-xs opacity-80">
                {isConnected ? "Online" : "Reconnecting..."}
              </p>
            </div>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface overflow-hidden">
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
                      ? "bg-purple text-white border-none rounded-[14px_14px_4px_14px]"
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
                      {msg.status === "sent" && "✓✓"}
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

            {isTyping && (
              <div className="text-sm text-gray-400 italic">
                AI is typing...
              </div>
            )}

            {/* auto scroll target */}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-border flex gap-2 bg-surface items-center ">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 text-sm border border-border outline-none rounded-full hover:border-purple/50"
            />
            <button
              onClick={sendMessage}
              className=" text-white bg-purple p-2 rounded-full transition"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
