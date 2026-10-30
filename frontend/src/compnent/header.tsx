import { Link } from "react-router-dom";
import { ChevronDown, Upload, Video, User, ArrowRight } from 'lucide-react';
import './header.css';

export interface HeaderProps {
  onNavClick?: (section: string) => void;
  onJoinClick?: () => void;
  onContactSales?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavClick,
  onContactSales,
}) => {
  return (
    <header className="header-container">
      {/* القسم الأيسر: الشعار وقائمة التنقل */}
      <div className="header-left">
        <a href="/" className="header-logo">
          Vuora
        </a>

        <nav className="header-nav">
          <button className="nav-item" onClick={() => onNavClick?.('features')}>
            Features <ChevronDown className="nav-arrow" size={16} />
          </button>
          <button className="nav-item" onClick={() => onNavClick?.('use-cases')}>
            Use cases <ChevronDown className="nav-arrow" size={16} />
          </button>
          <button className="nav-item" onClick={() => onNavClick?.('enterprise')}>
            Enterprise <ChevronDown className="nav-arrow" size={16} />
          </button>
          <button className="nav-item" onClick={() => onNavClick?.('learn')}>
            Learn <ChevronDown className="nav-arrow" size={16} />
          </button>
          <button className="nav-item" onClick={() => onNavClick?.('pricing')}>
            Pricing
          </button>
          <button className="nav-item" onClick={() => onNavClick?.('whats-new')}>
            What's new
          </button>
        </nav>
      </div>

      {/* القسم الأيمن: أزرار التواصل، الانضمام، والأيقونات */}
      <div className="header-right">
        <button className="contact-sales-btn" onClick={onContactSales}>
          Contact sales
        </button>

        <Link to="/home" className="join-btn">
        Join <ArrowRight size={16} />
        </Link>

        <div className="header-icons">
          <button className="icon-btn" title="Upload" aria-label="Upload">
            <Upload size={20} />
          </button>
          <button className="icon-btn" title="Watch" aria-label="Watch">
            <Video size={20} />
          </button>
          <button className="icon-btn" title="Account" aria-label="Account">
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;