import React from 'react';
import './LogoCloud.css';

export interface LogoItem {
  id: string | number;
  name: string;
  imageUrl: string;
}

export interface LogoCloudProps {
  title?: string;
  logos?: LogoItem[];
}

const defaultLogos: LogoItem[] = [
  { id: 1, name: 'Sundance Institute', imageUrl: 'https://vimeo.com/icons/icon-brands-wb.svg#icon-brands-wb' },
  { id: 2, name: 'Dropout', imageUrl: 'https://vimeo.com/icons/icon-brands-wpp.svg#icon-brands-wpp' },
  { id: 3, name: 'American Airlines', imageUrl: 'https://vimeo.com/icons/icon-brands-american-airlines.svg#icon-brands-american-airlines' },
  { id: 4, name: 'Warner Bros', imageUrl: 'https://vimeo.com/icons/icon-brands-omnicom.svg#icon-brands-omnicom' },
  { id: 5, name: 'Xfinity', imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Xfinity_2025.svg/250px-Xfinity_2025.svg.png?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail' },
  { id: 6, name: 'Seismic', imageUrl: 'https://vimeo.com/icons/icon-brands-seismic.svg#icon-brands-seismic' },
  { id: 7, name: 'Nike', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg' },
];

export const LogoCloud: React.FC<LogoCloudProps> = ({
  title = "You're in great company",
  logos = defaultLogos,
}) => {
  return (
    <section className="logo-cloud-container">
      <h3 className="logo-cloud-title">{title}</h3>

      <div className="logo-cloud-grid">
        {logos.map((logo) => (
          <div key={logo.id} className="logo-item" title={logo.name}>
            <img src={logo.imageUrl} alt={logo.name} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default LogoCloud;