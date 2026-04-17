import { useState, useEffect, useRef } from "react";
import { sendChatStream } from "../services/api";
import "./Chatbot.css";

const suggestions = [
    "Today's sales",
    "Low stock products",
    "Top selling products",
    "Business insights",
    "How to increase sales?",
    "Give me store performance"
];

const Chatbot = () => {

    const [open, setOpen] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [messages, setMessages] = useState([
        { sender: "bot", text: "Hello 👋 I'm your AI Retail Assistant" }
    ]);

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [listening, setListening] = useState(false);

    const recognitionRef = useRef(null);
    const bottomRef = useRef();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Voice Setup
    useEffect(() => {

        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.lang = "en-US";

            recognitionRef.current.onresult = (e) => {
                setInput(e.results[0][0].transcript);
                setListening(false);
            };

            recognitionRef.current.onend = () => setListening(false);
        }

    }, []);

    const startVoice = () => {
        recognitionRef.current?.start();
        setListening(true);
    };

    const sendMessage = async (msg = input) => {

        if (!msg.trim()) return;

        const userMessage = {
            sender: "user",
            text: msg
        };

        const updatedMessages = [...messages, userMessage];

        setMessages(updatedMessages);
        setInput("");
        setLoading(true);

        setMessages(prev => [
            ...prev,
            { sender: "bot", text: "" }
        ]);

        await sendChatStream({
            message: msg,
            conversationHistory: updatedMessages,
            onChunk: (chunk, fullText) => {

                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1].text = fullText;
                    return updated;
                });

            }
        });

        setLoading(false);
    };

    const clearChat = () => {
        setMessages([
            { sender: "bot", text: "Chat cleared. How can I help?" }
        ]);
    };

    // Format Message
    const formatMessage = (text) => {
        return text.split("\n").map((line, i) => {

            if (line.includes(":")) {
                return <strong key={i}>{line}</strong>;
            }

            if (line.startsWith("-")) {
                return <li key={i}>{line.replace("-", "")}</li>;
            }

            return <p key={i}>{line}</p>;
        });
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                className="chatbot-toggle"
                onClick={() => setOpen(!open)}
            >
                💬
            </button>

            {open && (
                <div className={`chatbot-container ${minimized ? "minimized" : ""}`}>

                    {/* Header */}
                    <div className="chatbot-header">

                        <div>
                            <h3>AI Retail Assistant</h3>
                            <span>Online</span>
                        </div>

                        <div className="chat-actions">

                            <button onClick={clearChat}>🗑️</button>

                            <button onClick={() => setMinimized(!minimized)}>
                                {minimized ? "🔼" : "➖"}
                            </button>

                            <button onClick={() => setOpen(false)}>❌</button>

                        </div>

                    </div>

                    {!minimized && (
                        <>
                            {/* Messages */}
                            <div className="chatbot-messages">

                                {messages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`message ${msg.sender}`}
                                    >
                                        <div className="message-content">
                                            {formatMessage(msg.text)}
                                        </div>
                                    </div>
                                ))}

                                {loading && (
                                    <div className="message bot">
                                        Typing...
                                    </div>
                                )}

                                <div ref={bottomRef} />

                            </div>

                            {/* Suggestions */}
                            <div className="chatbot-suggestions">
                                {suggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(s)}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>

                            {/* Input */}
                            <div className="chatbot-input">

                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask anything about your shop..."
                                    onKeyDown={(e) =>
                                        e.key === "Enter" && sendMessage()
                                    }
                                />

                                <button
                                    onClick={startVoice}
                                    className={listening ? "voice active" : "voice"}
                                >
                                    🎤
                                </button>

                                <button onClick={() => sendMessage()}>
                                    ➤
                                </button>

                            </div>
                        </>
                    )}

                </div>
            )}
        </>
    );
};

export default Chatbot;