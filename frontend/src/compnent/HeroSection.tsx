import React from 'react';
import { ArrowRight, Play } from 'lucide-react';
import './HeroSection.css';

export interface HeroSectionProps {
  badgeText?: string;
  title?: string;
  highlightText?: string;
  description?: string;
  primaryBtnText?: string;
  secondaryBtnText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  badgeText = 'NEW: Live Streaming 2.0 Released',
  title = 'The next generation video platform for',
  highlightText = 'modern creators',
  description = 'Host high-quality live events, manage your video content, and engage your audience seamlessly with Vuora.',
  primaryBtnText = 'Get Started Free',
  secondaryBtnText = 'Watch Demo',
  onPrimaryClick,
  onSecondaryClick,
}) => {
  return (
    <section className="hero-container">
      {/* شارة التحديث العلوي */}
      {badgeText && (
        <div className="hero-badge">
          <span className="hero-badge-dot"></span>
          <span>{badgeText}</span>
        </div>
      )}

      {/* العنوان الرئيسي */}
      <h1 className="hero-title">
        {title}{' '}
        <span className="hero-title-highlight">{highlightText}</span>
      </h1>

      {/* الوصف الفرعي */}
      <p className="hero-description">{description}</p>

      {/* أزرار الدعوة للإجراء (CTA) */}
      <div className="hero-actions">
        <button className="hero-btn-primary" onClick={onPrimaryClick}>
          {primaryBtnText} <ArrowRight size={18} />
        </button>
        <button className="hero-btn-secondary" onClick={onSecondaryClick}>
          <Play size={18} /> {secondaryBtnText}
        </button>
      </div>

      {/* منطقة استعراض الفيديو / التطبيق (مع الصورة المعروضة بشكل صحيح) */}
      <div className="hero-preview">
        <img 
          src="https://storage.ghost.io/c/90/06/900668bd-2aa2-42dc-9f32-86a461fa3125/content/images/2021/07/how-to-repurpose-your-live-videos.jpg" 
          alt="Platform Preview" 
          className="w-full h-full object-cover block"
        />
      </div>
    </section>
  );
};

export default HeroSection;