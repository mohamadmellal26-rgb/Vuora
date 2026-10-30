import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LiveStreams.module.css';

interface StreamItem {
  id: string | number;
  title: string;
  streamerName: string;
  category: string;
  viewersOrViews: string;
  thumbnailUrl: string;
  avatarUrl: string;
  tags: string[];
  isLive?: boolean;
}

export const LiveStreams: React.FC = () => {
  const navigate = useNavigate();
  const [liveStreams, setLiveStreams] = useState<StreamItem[]>([]);

  // جلب البثوث الحية تلقائياً كل 3 ثوانٍ
  useEffect(() => {
    const fetchLiveStreams = () => {
      fetch('http://localhost:8080/lives')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const activeStreams: StreamItem[] = data.map((user: any) => ({
              id: user.ID || user.id,
              title: `${user.name}'s Live Stream`,
              streamerName: user.name,
              category: 'General Live',
              viewersOrViews: 'LIVE NOW',
              thumbnailUrl: 'https://placehold.co/400x225/121212/22C55E?text=LIVE+STREAM',
              avatarUrl: 'https://placehold.co/40',
              tags: ['Live', 'English'],
              isLive: true,
            }));
            setLiveStreams(activeStreams);
          }
        })
        .catch((err) => console.error('Failed to fetch active channels:', err));
    };

    fetchLiveStreams();
    const interval = setInterval(fetchLiveStreams, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStreamClick = (streamerName: string) => {
    navigate(`/live/${streamerName}`);
  };

  return (
    <div className={styles.container}>
      {/* قسم البثوث الحية الحالية */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Live Channels ({liveStreams.length})</h2>

        {liveStreams.length === 0 ? (
          <section className={styles.centeredSection}>
          <h2 className={styles.centeredTitle}>Latest Videos & Clips</h2>
          <div className={styles.emptyStateContent}>
            <span className={styles.sadIcon}>😔</span>
            <p>No recorded clips available at the moment.</p>
          </div>
        </section>
        ) : (
          <div className={styles.grid}>
            {liveStreams.map((stream) => (
              <div
                key={stream.id}
                className={styles.card}
                onClick={() => handleStreamClick(stream.streamerName)}
              >
                {/* الصورة المصغرة مع شارة المباشر والمشاهدين */}
                <div className={styles.thumbnailWrapper}>
                  <img
                    src={stream.thumbnailUrl}
                    alt={stream.title}
                    className={styles.thumbnail}
                  />
                  <span className={styles.liveBadge}>LIVE</span>
                  <span className={styles.viewersBadge}>{stream.viewersOrViews}</span>
                </div>

                {/* تفاصيل القناة (الصورة الشخصية والنصوص) */}
                <div className={styles.details}>
                  <img
                    src={stream.avatarUrl}
                    alt={stream.streamerName}
                    className={styles.avatar}
                  />
                  <div className={styles.meta}>
                    <h3 className={styles.streamTitle}>{stream.title}</h3>
                    <p className={styles.channelName}>{stream.streamerName}</p>
                    <p className={styles.gameName}>{stream.category}</p>
                    
                    {/* الوسوم */}
                    <div className={styles.tags}>
                      {stream.tags.map((tag, idx) => (
                        <span key={idx} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default LiveStreams;