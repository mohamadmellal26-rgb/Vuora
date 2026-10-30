import React from 'react';
import { ArrowRight } from 'lucide-react';
import './IntegrationsSection.css';

export interface IntegrationApp {
  id: number;
  name: string;
  iconUrl: string;
}

const defaultApps: IntegrationApp[] = [
  { id: 1, name: 'Meta', iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg' },
  { id: 2, name: 'Asana', iconUrl: 'https://logos-world.net/wp-content/uploads/2021/03/Asana-Logo.png' },
  { id: 3, name: 'Slack', iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg' },
  { id: 4, name: 'Dropbox', iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Dropbox_logo_2017.svg' },
  { id: 5, name: 'Zoom', iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Zoom-Logo.png?utm_source=fr.wikipedia.org&utm_campaign=index&utm_content=original' },
  { id: 6, name: 'Google Meet', iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Google_Meet_icon_%282020%29.svg' },
  { id: 7, name: 'WordPress', iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/98/WordPress_blue_logo.svg' },
  { id: 8, name: 'Nike', iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg' },
];

export interface IntegrationsSectionProps {
  titlePrefix?: string;
  greenWord?: string;
  titleSuffix?: string;
  btnText?: string;
  onBtnClick?: () => void;
  apps?: IntegrationApp[];
}

export const IntegrationsSection: React.FC<IntegrationsSectionProps> = ({
  titlePrefix = 'Integrated with ',
  greenWord = 'every',
  titleSuffix = ' tool you already use',
  btnText = 'Browse Integrations',
  onBtnClick,
  apps = defaultApps,
}) => {
  // تقسيم التطبيقات إلى 4 أعمدة لتعمل حركة الـ Marquee بسلاسة
  const col1 = apps.slice(0, 2);
  const col2 = apps.slice(2, 4);
  const col3 = apps.slice(4, 6);
  const col4 = apps.slice(6, 8);

  const columns = [col1, col2, col3, col4];

  return (
    <section className="integrations-container">
      <div className="integrations-card">
        {/* جانب النص */}
        <div className="integrations-content">
          <h2 className="integrations-title">
            {titlePrefix}
            <span className="highlight-green">{greenWord}</span>
            {titleSuffix}
          </h2>
          <button className="integrations-btn" onClick={onBtnClick}>
            {btnText} <ArrowRight size={18} />
          </button>
        </div>

        {/* جانب شبكة الأيقونات المتحركة */}
        <div className="integrations-grid-preview">
          {columns.map((colApps, colIndex) => (
            <div key={colIndex} className="integration-column">
              {/* نكرر القائمة مرتين لضمان استمرار اللوب الحركي بدون انقطاع */}
              {[...colApps, ...colApps].map((app, index) => (
                <div key={`${app.id}-${index}`} className="integration-icon-box" title={app.name}>
                  <img src={app.iconUrl} alt={app.name} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IntegrationsSection;