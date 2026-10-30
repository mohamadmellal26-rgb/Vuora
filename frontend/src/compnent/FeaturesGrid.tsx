import React from 'react';
import { ArrowRight } from 'lucide-react';
import './FeaturesGrid.css';

export interface FeatureItem {
  id: number;
  titlePrefix: string;
  greenLetter: string;
  titleSuffix: string;
  description: string;
  buttonText: string;
  imageUrl: string;
  onButtonClick?: () => void;
}

const defaultFeatures: FeatureItem[] = [
  {
    id: 1,
    titlePrefix: 'Use ',
    greenLetter: 'V',
    titleSuffix: 'uora studio or bring your own',
    description:
      'Go live from your browser with everything you need to pre-build and customize your branded event. Our advanced studio includes sound mixing, multi-camera inputs, and color correction.',
    buttonText: 'Try it now',
    imageUrl: 'https://vimeo.bynder.com/transform/eb87ce57-e4e8-4c67-b549-28249652113d/43-Live-Streaming-General?io=transform:fill,width:1920&quality=80',
  },
  {
    id: 2,
    titlePrefix: 'Fail-proof live ',
    greenLetter: 'V',
    titleSuffix: 'ideo streaming',
    description:
      'Enjoy smooth streaming at any scale on Vuora with high-quality resolution (720p, 1080p, or 4K), adaptive bitrate, and backup streams.',
    buttonText: 'Learn more',
    imageUrl: 'https://vimeo.bynder.com/transform/5166efb0-0688-4bda-8acb-bced09b7f41d/43-Live-Streaming-Teleprompter?io=transform:fill,width:1920&quality=80',
  },
  {
    id: 3,
    titlePrefix: 'AI-script generator & teleprompt',
    greenLetter: 'e',
    titleSuffix: 'r',
    description:
      'Let Vuora AI help you refine and perfect your video scripts. Then, use our built-in teleprompter tool to deliver flawless performances.',
    buttonText: 'Learn more',
    imageUrl: 'https://vimeo.bynder.com/transform/28732faf-33df-45ce-a171-a08f90f8d5f0/Fail-proof-streaming?io=transform:fill,width:1920&quality=80',
  },
  
];

export const FeaturesGrid: React.FC = () => {
  return (
    <section className="features-container">
      {/* عنوان القسم الرئيسي */}
      <div className="features-header">
        <h2 className="features-main-title">
          Live streaming services for e<span className="highlight-green">v</span>eryone
        </h2>
      </div>

      {/* تنظيم الكروت */}
      <div className="features-bento">
        {defaultFeatures.map((feature, index) => {
          const isLarge = index === 0;
          return (
            <div
              key={feature.id}
              className={`feature-card ${isLarge ? 'feature-card-large' : ''}`}
            >
              {/* تفاصيل الميزة (ستكون في اليسار للكارت الأول، وفي الأعلى لباقي الكروت) */}
              <div className="feature-content">
                <h3 className="feature-title">
                  {feature.titlePrefix}
                  <span className="highlight-green">{feature.greenLetter}</span>
                  {feature.titleSuffix}
                </h3>
                <p className="feature-description">{feature.description}</p>
                <button
                  className="feature-btn"
                  onClick={feature.onButtonClick}
                >
                  {feature.buttonText} <ArrowRight size={16} />
                </button>
              </div>

              {/* المعاينة البصرية (ستكون في اليمين للكارت الأول، وفي الأسفل لباقي الكروت) */}
              <div className="feature-preview">
                <img src={feature.imageUrl} alt="Feature Preview" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturesGrid;