import React from 'react';
import './Divider.css';

export interface DividerProps {
  /** نص اختياري يظهر في منتصف الخط */
  label?: string;
  /** لون الخط: أسود، أخضر، أو رمادي */
  color?: 'black' | 'green' | 'gray';
  /** سماكة الخط */
  thickness?: 'thin' | 'medium' | 'thick';
  /** هامش علوي وسفلي مخصص (مثال: '3rem') */
  margin?: string;
}

export const Divider: React.FC<DividerProps> = ({
  label,
  color = 'black',
  thickness = 'medium',
  margin,
}) => {
  const lineStyle = `divider-line divider-${color} divider-${thickness}`;

  return (
    <div 
      className="divider-container" 
      style={margin ? { margin: `${margin} 0` } : undefined}
    >
      <div className={lineStyle} />
      {label && <span className="divider-label">{label}</span>}
      {label && <div className={lineStyle} />}
    </div>
  );
};

export default Divider;