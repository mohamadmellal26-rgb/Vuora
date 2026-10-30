import React from 'react';
import styles from './Sidebar.module.css';

interface Channel {
  id: string;
  name: string;
  game: string;
  viewers: string;
  avatarUrl: string;
}

interface Category {
  id: string;
  name: string;
  subtext?: string;
  viewers: string;
  imageUrl: string;
}

const CHANNELS_DATA: Channel[] = [
  { id: '1', name: 'Jynxzi', game: 'Fortnite', viewers: '28.3 ألف', avatarUrl: 'https://static-cdn.jtvnw.net/jtv_user_pictures/7c71fa7c-3582-4a22-b8e5-e10ef00d498f-profile_image-70x70.png' },
  { id: '2', name: 'Caedrel', game: 'League of Legends', viewers: '240.2 ألف', avatarUrl: 'https://static-cdn.jtvnw.net/jtv_user_pictures/41263278-9819-4b00-ba22-1a8e86ec656c-profile_image-70x70.png' },
  { id: '3', name: 'faxuty', game: 'Fortnite', viewers: '3.3 ألف', avatarUrl: 'https://static-cdn.jtvnw.net/jtv_user_pictures/e4176650-72de-4ab6-afd8-9696d9e2683d-profile_image-70x70.png' },
  { id: '4', name: 'Clix', game: 'Fortnite', viewers: '6.3 ألف', avatarUrl: 'https://static-cdn.jtvnw.net/jtv_user_pictures/43703545-7bd5-4fc5-a609-fa4de563091e-profile_image-70x70.png' },
  { id: '5', name: 'pollofn6', game: 'Fortnite', viewers: '1.9 ألف', avatarUrl: 'https://static-cdn.jtvnw.net/jtv_user_pictures/a996e890-6f17-4bcb-96dc-7d5c7dac24ef-profile_image-70x70.png' },
  { id: '6', name: 'AussieAntics', game: 'Fortnite', viewers: '9.5 ألف', avatarUrl: 'https://static-cdn.jtvnw.net/jtv_user_pictures/08449999-2e34-47c8-8a31-908cf3c31297-profile_image-70x70.png' },
];

const CATEGORIES_DATA: Category[] = [
  { id: '1', name: 'minecraft', viewers: '134.6 ألف', imageUrl: 'https://static-cdn.jtvnw.net/ttv-boxart/27471_IGDB-144x192.jpg' },
  { id: '2', name: 'Fc 27', viewers: '494.1 ألف', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwMEqBXzUxMrudUUShty3mIcj2GdIf-RoFtNN6MGxRhA&s=10' },
  { id: '3', name: 'gta v', viewers: '733.1 ألف', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMnvdDBCWfo5hAsIzRctJCRe6nlZchiYvRyQrkn_eIqA&s=10' },
  { id: '4', name: 'EA Sports FC 27', subtext: 'المحاكاة', viewers: '29.8 ألف', imageUrl: 'https://static-cdn.jtvnw.net/ttv-boxart/33214-30x42.jpg' },
  { id: '5', name: 'god of war', viewers: '65.3 ألف', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRy-MktC8zS_iLO4uStoUSz-KXkG54VzyqTLFutBDPNxw&s=10' },
];

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <h3 className={styles.sectionTitle}>{title}</h3>
);

const LiveBadge: React.FC<{ viewers: string }> = ({ viewers }) => (
  <div className={styles.liveInfo}>
    <span className={styles.liveDot} />
    <span className={styles.viewersCount}>{viewers}</span>
  </div>
);

const ChannelItem: React.FC<{ channel: Channel }> = ({ channel }) => (
  <div className={styles.item}>
    <div className={styles.itemLeft}>
      <img src={channel.avatarUrl} alt={channel.name} className={styles.avatar} />
      <div className={styles.info}>
        <p className={styles.itemName}>{channel.name}</p>
        <p className={styles.itemSub}>{channel.game}</p>
      </div>
    </div>
    <LiveBadge viewers={channel.viewers} />
  </div>
);

const CategoryItem: React.FC<{ category: Category }> = ({ category }) => (
  <div className={styles.item}>
    <div className={styles.itemLeft}>
      <img src={category.imageUrl} alt={category.name} className={styles.categoryImage} />
      <div className={styles.info}>
        <p className={styles.itemName}>{category.name}</p>
        {category.subtext && <p className={styles.itemSub}>{category.subtext}</p>}
      </div>
    </div>
    <LiveBadge viewers={category.viewers} />
  </div>
);

export const Sidebar: React.FC = () => {
  return (
    <aside className={styles.sidebar}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>من أجلك</h2>
        <button className={styles.collapseBtn} title="تصغير القائمة">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>

      {/* Live Channels */}
      <div className={styles.section}>
        <SectionHeader title="قنوات تبث الآن" />
        <div className={styles.itemList}>
          {CHANNELS_DATA.map((channel) => (
            <ChannelItem key={channel.id} channel={channel} />
          ))}
        </div>
        <button className={styles.showMoreBtn}>عرض المزيد</button>
      </div>

      {/* Recommended Categories */}
      <div className={styles.section}>
        <SectionHeader title="التصنيفات الموصى بها" />
        <div className={styles.itemList}>
          {CATEGORIES_DATA.map((category) => (
            <CategoryItem key={category.id} category={category} />
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;