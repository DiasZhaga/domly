import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../components/AuthContext";
import "../assets/css/style.css";

export default function Messages() {
  const [activeTab, setActiveTab] = useState("chats");
  const { user } = useAuth();
  const currentUserId = user?.id;

  const [dialogs, setDialogs] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [activeDeveloper, setActiveDeveloper] = useState(null);
  const [formData, setFormData] = useState({ message: "", contact_info: "" });
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);
  const [searchParams] = useSearchParams();
  const user2FromUrl = searchParams.get("user2");

  useEffect(() => {
    if (!currentUserId) return;
    const ws = new WebSocket(`ws://localhost:8080/api/v1/talk/ws?user_id=${currentUserId}`);
    socketRef.current = ws;

    ws.onopen = () => console.log("WebSocket connected");
    ws.onclose = () => console.log("WebSocket disconnected");
    ws.onerror = (err) => console.error("WebSocket error:", err);

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "message") {
          if (msg.from === activeConv || msg.to === activeConv) {
            setMessages((prev) => [
              ...prev,
              {
                fromMe: msg.from === currentUserId,
                text: msg.content,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              },
            ]);
          }
        }
      } catch (err) {
        console.error("Invalid WebSocket message:", e.data);
      }
    };

    return () => ws.close();
  }, [currentUserId, activeConv]);

  useEffect(() => {
    fetch("/api/v1/talk/dialogs", { credentials: "include" })
      .then((res) => res.text())
      .then((text) => {
        try {
          const data = JSON.parse(text);
          const list = Array.isArray(data) ? data : data.dialogs || [];
          setDialogs(list);
        } catch (err) {
          console.error("Invalid JSON from /api/v1/talk/dialogs:", text);
          setDialogs([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load dialogs:", err);
        setDialogs([]);
      });
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    fetch("/api/v1/developers", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDevelopers(data);
        else setDevelopers([]);
      })
      .catch((err) => {
        console.error("Failed to load developers:", err);
        setDevelopers([]);
      });
  }, [currentUserId]);

  useEffect(() => {
    if (user2FromUrl) {
      const user2Id = Number(user2FromUrl);
      if (!activeConv || activeConv !== user2Id) {
        setActiveConv(user2Id);
        fetch(`/api/v1/talk/messages/history?user2=${user2Id}`, {
          credentials: "include",
        })
          .then((res) => res.json())
          .then((data) => {
            const formatted = (Array.isArray(data) ? data : []).map((m) => ({
              fromMe: m.sender_id === currentUserId,
              text: m.content,
              time: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""
            }));
            setMessages(formatted);
          })
          .catch(() => {
            console.error("No prior conversation. Starting new chat.");
            setMessages([]);
          });
      }
    }
  }, [user2FromUrl, currentUserId, activeConv]);

  const selectChat = async (user2) => {
    setActiveConv(user2);
    setActiveDeveloper(null);
    try {
      const res = await fetch(`/api/v1/talk/messages/history?user2=${user2}`, {
        credentials: "include",
      });
      const data = await res.json();
      const formatted = (Array.isArray(data) ? data : []).map((m) => ({
        fromMe: m.sender_id === currentUserId,
        text: m.content,
        time: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""
      }));
      setMessages(formatted);
    } catch (err) {
      console.error("Failed to load messages:", err);
      setMessages([]);
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !activeConv || !socketRef.current) return;
    socketRef.current.send(JSON.stringify({ to: activeConv, content: input }));
    setInput("");
  };

  const submitDeveloperMessage = async () => {
    if (!activeDeveloper || !formData.message.trim() || !formData.contact_info.trim()) {
      alert("Please fill out both message and contact info.");
      return;
    }
    setActiveConv(null);

    const form = new URLSearchParams();
    form.append("message", formData.message);
    form.append("contact_info", formData.contact_info);

    try {
      const res = await fetch(`/api/v1/developers/message/${activeDeveloper}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        credentials: "include",
        body: form.toString(),
      });

      if (res.ok) {
        alert("Message sent successfully");
        setFormData({ message: "", contact_info: "" });
      } else {
        const err = await res.json();
        alert("Failed to send message: " + err.error);
      }
    } catch (err) {
      console.error("Send error:", err);
      alert("Request failed");
    }
  };

  const activeList = activeTab === "developers"
    ? developers.map((dev) => ({ id: dev.id, title: dev.name }))
    : dialogs.map((d) => ({ id: d.user_id, title: d.name, last_message: d.last_message }));

  if (!currentUserId) return <div className="text-center p-5">Loading user...</div>;

  return (
    <Layout>
      <div className="container-fluid p-0 bg-light">
        <div className="page-content">
          <div className="container py-5 mt-5">
            <div className="row gx-0">
              <div className="col-md-4 pe-3">
                <ul className="nav nav-tabs mb-3">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === "chats" ? "active" : ""}`}
                      onClick={() => {
                        setActiveTab("chats");
                        setActiveConv(null);
                        setMessages([]);
                      }}
                    >Chats</button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === "developers" ? "active" : ""}`}
                      onClick={() => {
                        setActiveTab("developers");
                        setActiveDeveloper(null);
                      }}
                    >Developers</button>
                  </li>
                </ul>
                <ul className="list-group" style={{ maxHeight: "65vh", overflowY: "auto" }}>
                  {activeList.map((conv) => (
                    <li
                      key={conv.id}
                      className={`list-group-item ${
                        (activeTab === "chats" && activeConv === conv.id) ||
                        (activeTab === "developers" && activeDeveloper === conv.id)
                          ? "active text-white" : ""
                      }`}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        if (activeTab === "chats") selectChat(conv.id);
                        if (activeTab === "developers") {
                          setActiveDeveloper(conv.id);
                          setActiveConv(null);
                        }
                      }}
                    >
                      <div className="fw-semibold">{conv.title}</div>
                      {conv.last_message && <div className="text-muted small">{conv.last_message}</div>}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-md-8 d-flex flex-column" style={{ height: "75vh" }}>
                {activeTab === "chats" && activeConv ? (
                  <>
                    <div className="flex-grow-1 p-3 overflow-auto bg-white" style={{ borderRadius: "0.5rem 0.5rem 0 0" }}>
                      {messages.map((m, i) => (
                        <div key={i} className={`mb-2 d-flex ${m.fromMe ? "justify-content-end" : ""}`}>
                          <div
                            className={`p-2 rounded ${m.fromMe ? "bg-primary text-white" : "bg-light"}`}
                            style={{ maxWidth: "70%", position: "relative" }}
                          >
                            {m.text}
                            {m.time && (
                              <small
                                className="position-absolute text-muted"
                                style={{ fontSize: "0.7rem", bottom: "-1.2rem", right: m.fromMe ? "0" : "auto", left: m.fromMe ? "auto" : "0" }}
                              >
                                {m.time}
                              </small>
                            )}
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
                      <button className="btn btn-primary" onClick={sendMessage}>Send</button>
                    </div>
                  </>
                ) : activeTab === "developers" && activeDeveloper ? (
                  <div className="p-3">
                    <h5>Send Message to Developer</h5>

                    {(() => {
                      const selectedDev = developers.find(d => d.id === activeDeveloper);
                      return selectedDev ? (
                        <div className="mb-4">
                          {selectedDev.description && <p><strong>Description:</strong> {selectedDev.description}</p>}
                          {selectedDev.phone && <p><strong>Phone:</strong> {selectedDev.phone}</p>}
                          {selectedDev.email && <p><strong>Email:</strong> {selectedDev.email}</p>}
                        </div>
                      ) : null;
                    })()}

                    <div className="mb-3">
                      <label className="form-label">Message</label>
                      <textarea
                        className="form-control"
                        required
                        rows="4"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Contact Info</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        value={formData.contact_info}
                        onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                      />
                    </div>
                    <button className="btn btn-primary" onClick={submitDeveloperMessage}>
                      Send
                    </button>
                  </div>
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                    {activeTab === "developers" ? "Select a developer" : "Select a conversation"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}