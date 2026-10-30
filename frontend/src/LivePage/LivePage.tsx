import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Users, Send, Settings, LogIn, Loader2 } from "lucide-react";
import Hls from "hls.js";
import HeaderHome from "../Home/Header";
import "./LivePage.css";

interface ChatMessage {
  ID: number;
  username: string;
  text: string;
  CreatedAt: string;
}

function HlsVideoPlayer({ streamKey }: { streamKey: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const videoSrc = `http://localhost:8888/live/${streamKey}/index.m3u8`;
    let hls: Hls | null = null;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSrc;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(e => console.log("Autoplay prevented:", e));
      });
    } else if (Hls.isSupported()) {
      hls = new Hls({
        liveSyncDurationCount: 2,
        liveMaxLatencyDurationCount: 4,
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => console.log("Autoplay prevented:", e));
      });
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [streamKey]);

  return (
    <video 
      ref={videoRef}
      controls 
      autoPlay 
      muted 
      playsInline
      style={{ width: '100%', height: '100%', maxHeight: '450px', objectFit: 'contain' }}
    />
  );
}

export default function LivePage() {
  const { username } = useParams<{ username: string }>();
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [isLive, setIsLive] = useState<boolean>(false);
  const [streamKey, setStreamKey] = useState<string>("");
  const [rtmpServer, setRtmpServer] = useState<string>("rtmp://localhost/live/");
  const [realUsername, setRealUsername] = useState<string>(username || "user");

  // Real-time chat states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserData(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Fetch messages every 2 seconds automatically
  useEffect(() => {
    if (!streamKey) return;

    const fetchMessages = () => {
      fetch(`http://localhost:8080/chat/${streamKey}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setMessages(data);
          }
        })
        .catch(err => console.error("Error fetching chat:", err));
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [streamKey]);

  // Auto scroll chat to bottom when new message arrives
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchUserData = (token: string) => {
    setIsLoading(true);
    fetch("http://localhost:8080/profile", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) throw new Error("Invalid token");
      return res.json();
    })
    .then(data => {
      setIsAuthenticated(true);
      if (data.name) {
        setRealUsername(data.name);
        localStorage.setItem("username", data.name);
      }
      if (data.stream_key) {
        setStreamKey(data.stream_key);
        setIsLive(data.is_live);
      }
      if (data.rtmp_server) setRtmpServer(data.rtmp_server);
      setIsLoading(false);
    })
    .catch(() => {
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      setIsLoading(false);
    });
  };

  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("token", data.token);
      if (data.name) localStorage.setItem("username", data.name);
      fetchUserData(data.token);
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleToggleLive = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please log in first");

    try {
      const response = await fetch("http://localhost:8080/live/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setIsLive(data.is_live);
        if (data.stream_key) setStreamKey(data.stream_key);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !streamKey) return;

    try {
      const response = await fetch("http://localhost:8080/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stream_key: streamKey,
          username: realUsername,
          text: inputMessage
        })
      });

      if (response.ok) {
        setInputMessage("");
      }
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  if (isLoading) {
    return (
      <div className="live-page-container">
        <HeaderHome />
        <div className="flex flex-1 items-center justify-center" style={{ minHeight: '80vh' }}>
          <Loader2 className="animate-spin text-[#22C55E]" size={40} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="live-page-container">
        <HeaderHome />
        <div className="flex flex-1 items-center justify-center p-6" style={{ minHeight: '80vh' }}>
          <div className="bg-white/85 backdrop-blur-md border border-white/50 rounded-2xl p-8 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Login Required to Participate in Chat</h2>
            {authError && <div className="bg-red-500/10 border border-red-200 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">{authError}</div>}
            <form onSubmit={handleDirectLogin} className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Email Address"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
                className="w-full bg-white/70 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 text-sm outline-none focus:border-[#22C55E]"
              />
              <input
                type="password"
                placeholder="Password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
                className="w-full bg-white/70 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 text-sm outline-none focus:border-[#22C55E]"
              />
              <button type="submit" className="w-full bg-[#22C55E] hover:bg-[#16a34a] text-black font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <LogIn size={18} /> Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="live-page-container">
      <HeaderHome />
      <div className="live-content-grid">
        <div className="live-main-section">
          <div className="video-player-box" style={{ position: 'relative', background: '#000', overflow: 'hidden', minHeight: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isLive && (
              <div className="live-badge-overlay" style={{ position: 'absolute', top: 12, left: 12, zIndex: 10 }}>
                <span className="live-badge-dot"></span> LIVE
              </div>
            )}
            {isLive ? (
              <HlsVideoPlayer streamKey={streamKey} />
            ) : (
              <div className="text-center p-6">
                <h3 className="text-lg font-semibold text-gray-600">Stream is currently offline</h3>
              </div>
            )}
          </div>

          <div className="stream-info-card">
            <h1>Live Stream Channel: <span className="text-[#22C55E]">{realUsername}</span></h1>
          </div>

          <div className="stream-control-card">
            <div className="control-card-title"><Settings size={18} style={{ color: '#22C55E' }} /> OBS Studio Settings</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" readOnly value={rtmpServer} className="stream-config-input" />
              <input type="text" readOnly value={streamKey} className="stream-config-input" />
            </div>
            <button onClick={handleToggleLive} className={`toggle-live-btn mt-4 ${isLive ? "active" : ""}`}>
              {isLive ? "End Stream" : "Go Live / Update Status"}
            </button>
          </div>
        </div>

        {/* Real Chat Section */}
        <div className="chat-section">
          <div className="chat-header flex items-center justify-between">
            <span>Live Chat</span>
            <Users size={16} className="text-gray-500" />
          </div>

          <div className="chat-messages-container" ref={chatContainerRef} style={{ overflowY: 'auto', maxHeight: '400px' }}>
            {messages.map((msg) => (
              <div key={msg.ID} className="chat-message" style={{ marginBottom: '8px' }}>
                <span className="username" style={{ color: '#16a34a', fontWeight: 'bold', marginRight: '6px' }}>{msg.username}:</span>
                <span className="text" style={{ color: '#1f2937' }}>{msg.text}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-form">
            <input
              type="text"
              placeholder="Send a message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="chat-input"
            />
            <button type="submit" className="chat-send-btn">
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}