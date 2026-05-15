import { useEffect, useState, useRef, useCallback, memo } from "react";
import { Send, MessageCircle } from "lucide-react";
import { io, Socket } from "socket.io-client";
import MessageRenderer from "./MessageRenderer";

const ChatInput = memo(
  ({
    input,
    setInput,
    sendMessage,
    handleKeyDown,
    inputRef,
    isSending,
    onFocusScroll,
  }: {
    input: string;
    isSending: boolean;
    setInput: (v: string) => void;
    sendMessage: () => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    inputRef: React.MutableRefObject<string>;
    onFocusScroll: () => void;
  }) => {
    return (
      <div className="px-4 py-3 border-t border-border flex gap-2 bg-surface items-center">
        <input
          value={input}
          disabled={isSending}
          onChange={(e) => {
            setInput(e.target.value);
            inputRef.current = e.target.value; // ✅ sync ref
          }}
          onKeyDown={handleKeyDown}
          onFocus={onFocusScroll}
          type="text"
          placeholder="Type your message..."
          className="flex-1 px-3 py-2 text-sm border border-border outline-none rounded-full"
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || isSending}
          className="text-white bg-purple p-2 rounded-full disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    );
  },
);

const MessageList = memo(function MessageList({
  messages,
  sendMessage,
  retryMessage,
}: {
  messages: any[];
  sendMessage: (text?: string) => void;
  retryMessage: (msg: any) => void;
}) {
  return (
    <>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${
            msg.sender === "user"
              ? "justify-end px-4 pt-4"
              : "justify-start pl-4"
          }`}
        >
          <div className={` text-[13px] leading-[1.5]`}>
            {/* <div className="text-xs opacity-70 font-semibold">
              {msg.sender === "user" ? "You" : "AI"}
            </div> */}
            <MessageRenderer
              payload={msg.payload}
              sendMessage={sendMessage}
              sender={msg.sender}
            />
            {/* <div>{msg.msg}</div> */}
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

  interface ChatPayload {
    type:
      | "text"
      | "error"
      | "greeting"
      | "providers"
      | "categories"
      | "businessTypes";
    message?: string;
    items?: any[];
  }

  interface Message {
    id: string;
    payload: ChatPayload;
    sender: "user" | "ai";
    time: string;
    status?: Status;
  }
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<string>("");
  const [windowHeight, setWindowHeight] = useState(
    "min(480px, calc(100dvh - 120px))",
  );
  const chatRef = useRef<HTMLDivElement>(null);

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
    const handleReceive = (data: {
      payload: ChatPayload;
      isWelcome?: boolean;
    }) => {
      setIsTyping(false);
      setIsSending(false);

      setMessages((prev) => {
        // ❌ prevent duplicate welcome
        if (data.isWelcome && prev.length > 0) return prev;

        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            payload: data.payload,
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
      setIsSending(false);
    };

    const handleMessageError = (data: { payload: ChatPayload }) => {
      setIsTyping(false);
      setIsSending(false);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          payload: data.payload,
          sender: "ai",
          time: new Date().toISOString(),
        },
      ]);
    };

    const handleHistory = (data: {
      messages: { sender: "user" | "ai"; content: ChatPayload }[];
    }) => {
      const formatted = data.messages.map((m) => ({
        id: crypto.randomUUID(),
        payload: m.content,
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
  const sendMessage = useCallback(
    (text?: string) => {
      if (isSending) return; // 🚫 BLOCK DOUBLE SEND
      const socket = socketRef.current;
      const value = text ?? inputRef.current;
      if (!socket || !value.trim()) return;

      setIsSending(true); // 🔒 LOCK CHAT

      const payload = { text: value };
      const id = crypto.randomUUID();

      // show user message instantly
      setMessages((prev) => [
        ...prev,
        {
          id: id,
          payload: { type: "text", message: value },
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
    },
    [isSending],
  );

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
        { text: msg.payload.message },
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

  // phone chat keyword
  useEffect(() => {
    if (!isOpen) {
      setIsTyping(false);
      setInput("");
      setWindowHeight("min(480px, calc(100dvh - 120px))");
      if (chatRef.current) {
        chatRef.current.style.bottom = "";
      }
      return;
    }

    const vv = window.visualViewport; // ✅ declare vv here
    if (!vv) return;

    const onResize = () => {
      const vv = window.visualViewport!;
      const kbHeight = window.innerHeight - vv.height;

      // subtract browser toolbar (~56px on Android Chrome) + some breathing room
      const browserToolbar =
        window.innerHeight - document.documentElement.clientHeight;
      const totalHeight = vv.height - browserToolbar - 8;

      setWindowHeight(`${Math.min(480, totalHeight)}px`);

      if (chatRef.current) {
        chatRef.current.style.bottom = `${kbHeight}px`;
      }
    };

    onResize(); // ✅ call immediately on open

    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, [isOpen]); // ✅ re-run when chat opens/closes

  const handleFocusScroll = useCallback(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }, []);

  return (
    <div className="relative">
      {/* Chat Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed lg:bottom-20 lg:right-20 bottom-7 right-6 z-20 bg-purple/90 text-white p-4 rounded-full shadow-xl hover:bg-purple transition"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatRef}
          style={{ height: windowHeight }}
          className=" fixed bottom-[84px] right-[8px] lg:bottom-[137px] lg:right-[80px] w-[345px] lg:w-[525px] flex flex-col bg-ink-light border border-border rounded-[20px] shadow-[0_40px_80px_rgba(0,0,0,0.5),0_0_0_1px_var(--border)] overflow-hidden transition-[bottom,height] duration-200 ease-out"
        >
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
          <div className="flex-1 min-h-0 overflow-y-auto space-y-3 bg-surface">
            <MessageList
              messages={messages}
              sendMessage={sendMessage}
              retryMessage={retryMessage}
            />

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
            isSending={isSending}
            setInput={setInput}
            sendMessage={sendMessage}
            handleKeyDown={handleKeyDown}
            inputRef={inputRef}
            onFocusScroll={handleFocusScroll}
          />
        </div>
      )}
    </div>
  );
}
