import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Users, Send, Loader2, Square } from "lucide-react";
import Hls from "hls.js";
import HeaderHome from "../Home/Header";
import "../LivePage/LivePage.css";

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
      style={{ width: '100%', height: '100%', maxHeight: '500px', objectFit: 'contain' }}
    />
  );
}

export default function ViewerPage() {
  const { username } = useParams<{ username: string }>();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [streamerData, setStreamerData] = useState<{ stream_key: string; is_live: boolean; name: string } | null>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [viewerName, setViewerName] = useState<string>("");

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // تعيين اسم المستخدم تلقائياً (من التوكن إن وجد، أو اسم زائر عشوائي)
  useEffect(() => {
    const savedName = localStorage.getItem("username");
    if (savedName) {
      setViewerName(savedName);
    } else {
      setViewerName(`زائر_${Math.floor(Math.random() * 1000)}`);
    }
  }, []);

  // جلب معلومات البث والمالك الحقيقي دورياً
  useEffect(() => {
    if (!username) return;

    const fetchStreamerInfo = () => {
      fetch(`http://localhost:8080/user/${username}`)
        .then(res => {
          if (!res.ok) throw new Error("المستخدم غير موجود");
          return res.json();
        })
        .then(data => {
          setStreamerData({
            stream_key: data.stream_key,
            is_live: data.is_live,
            name: data.name
          });
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Error fetching streamer:", err);
          setIsLoading(false);
        });
    };

    fetchStreamerInfo();
    const interval = setInterval(fetchStreamerInfo, 2000);
    return () => clearInterval(interval);
  }, [username]);

  // جلب رسائل الشات دورياً
  useEffect(() => {
    if (!streamerData?.stream_key) return;

    const fetchMessages = () => {
      fetch(`http://localhost:8080/chat/${streamerData.stream_key}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setMessages(data);
        })
        .catch(err => console.error("Error fetching chat:", err));
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [streamerData?.stream_key]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // إرسال رسالة مباشرة بدون الحاجة لتسجيل دخول
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !streamerData?.stream_key) return;

    try {
      const res = await fetch("http://localhost:8080/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stream_key: streamerData.stream_key,
          username: viewerName,
          text: inputMessage
        })
      });

      if (res.ok) {
        setInputMessage("");
      }
    } catch (err) {
      console.error("فشل إرسال الرسالة", err);
    }
  };

  if (isLoading) {
    return (
      <div className="live-page-container" dir="rtl">
        <HeaderHome />
        <div className="flex flex-1 items-center justify-center" style={{ minHeight: '80vh' }}>
          <Loader2 className="animate-spin text-[#22C55E]" size={40} />
        </div>
      </div>
    );
  }

  return (
    <div className="live-page-container" dir="rtl">
      <HeaderHome />

      <div className="live-content-grid">
        <div className="live-main-section">
          <div className="video-player-box" style={{ position: 'relative', background: '#000', overflow: 'hidden', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {streamerData?.is_live ? (
              <>
                <div className="live-badge-overlay" style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
                  <span className="live-badge-dot"></span> LIVE
                </div>
                <HlsVideoPlayer streamKey={streamerData.stream_key} />
              </>
            ) : (
              <div className="text-center p-6">
                <Square size={48} className="text-gray-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-300">البث غير متوفر حالياً</h3>
                <p className="text-gray-500 text-sm mt-1">المالك {streamerData?.name || username} ليس مباشرًا حالياً. ابدأ البث من OBS.</p>
              </div>
            )}
          </div>

          <div className="stream-info-card">
            <h1>غرفة البث المباشر الخاصة بـ: <span className="text-[#22C55E]">{streamerData?.name}</span></h1>
            <p className="text-gray-400 text-sm mt-1">استمتع بالمشاهدة وشارك في الدردشة الحية.</p>
          </div>
        </div>

        <div className="chat-section">
          <div className="chat-header flex items-center justify-between">
            <span>دردشة البث المباشر</span>
            <Users size={16} className="text-gray-400" />
          </div>

          <div className="chat-messages-container" ref={chatContainerRef} style={{ overflowY: 'auto', maxHeight: '420px' }}>
            {messages.map((msg) => (
              <div key={msg.ID} className="chat-message" style={{ marginBottom: '8px' }}>
                <span className="username" style={{ color: '#22C55E', fontWeight: 'bold', marginLeft: '6px' }}>{msg.username}:</span>
                <span className="text" style={{ color: '#fff' }}>{msg.text}</span>
              </div>
            ))}
          </div>

          {/* حقل إرسال الرسائل مباشرة دون طلب تسجيل دخول */}
          <div className="p-3 bg-[#121212] border-t border-[#27272A]">
            <p className="text-xs text-gray-400 mb-2">تشارك في الشات باسم: <span className="text-[#22C55E] font-bold">{viewerName}</span></p>
            <form onSubmit={handleSendMessage} className="chat-input-form mt-1" style={{ padding: 0, border: 'none' }}>
              <input
                type="text"
                placeholder="اكتب رسالة في الدردشة..."
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
    </div>
  );
}