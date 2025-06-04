// src/pages/Messages.js
import React, { useState } from "react";
import Layout from "../components/Layout";
import "../assets/css/style.css";

export default function Messages() {
  // две вкладки: обычные чаты и девелоперы
  const [activeTab, setActiveTab] = useState("chats");

  // список разговоров
  const mockConversations = {
    chats: [
      { id: 1, title: "Abylai" },
      { id: 2, title: "Bekzat" },
      { id: 3, title: "Saule" },
    ],
    developers: [
      { id: 101, title: "BI Group" },
      { id: 102, title: "BAZIS" },
      { id: 103, title: "Ulytau Group" },
    ],
  };

  // история сообщений по каждому чату (с полем time)
  const mockMessages = {
    1: [
      {
        fromMe: false,
        text: "Hi, I'm interested in buying the apartment at Kayim M., 12/3, apt 4.",
        time: "10:00",
      },
      {
        fromMe: true,
        text: "Hello Abylai, it’s still available. Would you like to proceed with the purchase?",
        time: "10:02",
      },
      {
        fromMe: false,
        text: "Yes, I’d like to complete the purchase. What are the next steps?",
        time: "10:05",
      },
      {
        fromMe: true,
        text: "Great! I’ll send you the contract details and payment link shortly.",
        time: "10:07",
      },
    ],
    102: [
      // пример для BAZIS
      {
        fromMe: true,
        text: "Hello BAZIS — do you have units available in Alatau?",
        time: "09:30",
      },
      {
        fromMe: false,
        text: "Yes, we have 2- and 3-room apartments. Would you like floor plans?",
        time: "09:32",
      },
    ],
    // остальные можно добавить по аналогии...
  };

  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const selectChat = (id) => {
    setActiveConv(id);
    setMessages(mockMessages[id] || []);
  };

  const sendMessage = () => {
    if (!input.trim() || !activeConv) return;
    const newMsg = { fromMe: true, text: input.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages((msgs) => [...msgs, newMsg]);
    setInput("");
  };

  return (
    <Layout>
      <div className="header-section bg-white">
        <div className="container-fluid p-0 bg-light">
          <div className="page-content">
            <div className="container py-5 mt-5">
              <div className="row gx-0">
                {/* Sidebar с вкладками и списком чатов */}
                <div className="col-md-4 pe-3">
                  <ul className="nav nav-tabs mb-3">
                    <li className="nav-item">
                      <button
                        className={`nav-link ${activeTab === "chats" ? "active" : ""}`}
                        onClick={() => {
                          setActiveTab("chats");
                          setActiveConv(null);
                        }}
                      >
                        Chats
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        className={`nav-link ${activeTab === "developers" ? "active" : ""}`}
                        onClick={() => {
                          setActiveTab("developers");
                          setActiveConv(null);
                        }}
                      >
                        Developers
                      </button>
                    </li>
                  </ul>

                  <ul className="list-group" style={{ maxHeight: "65vh", overflowY: "auto" }}>
                    {mockConversations[activeTab].map((conv) => (
                      <li
                        key={conv.id}
                        className={`list-group-item ${
                          activeConv === conv.id ? "active text-white" : ""
                        }`}
                        style={{ cursor: "pointer" }}
                        onClick={() => selectChat(conv.id)}
                      >
                        {conv.title}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Панель сообщений */}
                <div className="col-md-8 d-flex flex-column" style={{ height: "75vh" }}>
                  {activeConv ? (
                    <>
                      <div
                        className="flex-grow-1 p-3 overflow-auto bg-white"
                        style={{ borderRadius: "0.5rem 0.5rem 0 0" }}
                      >
                        {messages.map((m, i) => (
                          <div
                            key={i}
                            className={`mb-2 d-flex ${m.fromMe ? "justify-content-end" : ""}`}
                          >
                            <div
                              className={`p-2 rounded ${
                                m.fromMe ? "bg-primary text-white" : "bg-light"
                              }`}
                              style={{ maxWidth: "70%", position: "relative" }}
                            >
                              {m.text}
                              <small
                                className={`position-absolute text-muted`}
                                style={{
                                  fontSize: "0.7rem",
                                  bottom: "-1.2rem",
                                  right: m.fromMe ? "0" : "auto",
                                  left: m.fromMe ? "auto" : "0",
                                }}
                              >
                                {m.time}
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="input-group mt-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Type a message..."
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <button className="btn btn-primary" onClick={sendMessage}>
                          Send
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                      Select a conversation
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
