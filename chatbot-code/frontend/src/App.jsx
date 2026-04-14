import { useEffect, useRef, useState } from "react";
import "./App.css";
import ParticlesBackground from "./ParticlesBackground";
import Snow from "./Snow"; 

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userText },
      { role: "bot", text: "" },
    ]);

    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userText }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let botText = "";
      let started = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (let line of lines) {
          if (!line) continue;

          try {
            const data = JSON.parse(line);

            botText += data.token;

            if (!started) {
              setLoading(false); // hide dots when first token arrives
              started = true;
            }

            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "bot",
                text: botText,
              };
              return updated;
            });
          } catch (e) {}
        }
      }
    } catch (error) {
      setLoading(false);

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "bot",
          text: "⚠️ Server error",
        };
        return updated;
      });
    }
  };

  return (
    <div className="page">
      <ParticlesBackground />
      <Snow/>

      <div className="chat-container">
        <div className="header">🧑‍💻 Mr.SahaayaBot</div>

        <div className="chat-box">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`msg ${msg.role === "user" ? "user" : "bot"}`}
            >
              {msg.text}
            </div>
          ))}

          {/* CHATGPT STYLE TYPING DOTS */}
          {loading && (
            <div className="msg bot">
              <div className="typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          <div ref={chatEndRef}></div>
        </div>

        <div className="input-box">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}
