import React, { useState, useEffect } from 'react';
import './Banner.css';

export interface BannerProps {
  /** نص العرض الرئيسي */
  title?: string;
  /** الوصف الفرعي */
  description?: string;
  /** النص داخل الزر */
  buttonText?: string;
  /** رابط الزر عند النقر */
  buttonHref?: string;
  /** الوقت بالثواني للعداد التنازلي (الافتراضي: 24 ساعة) */
  initialSeconds?: number;
  /** دالة تعمل عند النقر على الزر */
  onApply?: () => void;
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

export const Banner: React.FC<BannerProps> = ({
  title = 'Funding',
  description = 'Seed Investment Speed Dating — Pitch your MVP to verified European Funds',
  buttonText = 'Apply Now',
  buttonHref,
  initialSeconds = 86384, // 23h 59m 44s
  onApply,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []); // 👈 تم تصحيح مصفوفة التبعيات لتصبح فارغة لمنع إعادة تشغيل الـ Interval مع كل ثانية

  // تحويل الثواني إلى ساعات ودقائق وثواني
  const getTimeParts = (totalSeconds: number): TimeLeft => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { hours, minutes, seconds };
  };

  const formatTwoDigits = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  const { hours, minutes, seconds } = getTimeParts(secondsLeft);

  const handleButtonClick = () => {
    if (onApply) {
      onApply();
    } else if (buttonHref) {
      window.location.href = buttonHref;
    }
  };

  return (
    <div className="banner-container">
      <div className="banner-content">
        {/* عنوان العرض */}
        <span className="banner-title">{title}</span>

        {/* كتل الوقت التنازلي */}
        <div className="banner-timer">
          <span className="banner-timer-badge">
            {formatTwoDigits(hours)}h
          </span>
          <span className="banner-timer-colon">:</span>
          <span className="banner-timer-badge">
            {formatTwoDigits(minutes)}m
          </span>
          <span className="banner-timer-colon">:</span>
          <span className="banner-timer-badge">
            {formatTwoDigits(seconds)}s
          </span>
        </div>

        {/* النص الوصفي كاملًا */}
        <span className="banner-description">
          {description}
        </span>

        {/* زر الإجراء Action Button */}
        <button
          type="button"
          onClick={handleButtonClick}
          className="banner-button"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default Banner;