import React, { useState, useEffect, useRef } from 'react';
import { Search, Zap, Mail, Bell, User, MoreVertical, LogIn, UserPlus, LogOut, Settings, Video, Shield, Wallet, Sliders, Radio } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

export const HeaderHome: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("user");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // التحقق من حالة تسجيل الدخول وجلب اسم المستخدم
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      // يمكنك جلب اسم المستخدم الفعلي من الـ Backend أو تخزينه في localStorage عند تسجيل الدخول
      const storedUsername = localStorage.getItem("username") || "mohamad1d23";
      setUsername(storedUsername);
    } else {
      setIsLoggedIn(false);
    }

    // إغلاق القائمة عند النقر خارجها
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setShowDropdown(false);
    navigate("/auth");
  };

  return (
    <header className="header-home" dir="rtl">
      <div className="header-home-container">
        
        {/* الجهة اليمنى: الشعار وأزرار التنقل */}
        <div className="header-home-section header-home-brand">
          <Link to="/" className="header-home-logo">
            <span>a</span>Vuor
          </Link>

          <a href="#following" className="header-home-nav-link">Following</a>
          <a href="#browse" className="header-home-nav-link">Browse</a>

          <button className="header-home-icon-btn" title="More">
            <MoreVertical size={18} />
          </button>
        </div>

        {/* المنتصف: شريط البحث */}
        <div className="header-home-section header-home-center">
          <form className="header-home-search-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Search..."
              className="header-home-search-input"
              dir="ltr"
            />
            <button type="submit" className="header-home-search-btn">
              <Search size={18} />
            </button>
          </form>
        </div>

        {/* الجهة اليسرى: الأيقونات والبروفايل أو أزرار الدخول */}
        <div className="header-home-section header-home-actions">
          
          <a href="#studio-pro" className="header-home-promo-badge">
            <Zap size={15} style={{ color: '#22C55E' }} />
            <span>Try Vuora Advanced Studio</span>
          </a>

          {isLoggedIn ? (
            <>
              {/* زر بدء البث المباشر السريع */}
              <button 
                onClick={() => navigate(`/${username}/live`)}
                className="header-home-icon-btn" 
                title="بدء البث المباشر"
                style={{ color: '#22C55E', display: 'flex', alignItems: 'center', gap: '6px', width: 'auto', padding: '0 10px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}
              >
                <Radio size={16} className="animate-pulse" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>بث مباشر</span>
              </button>

              <button className="header-home-icon-btn" title="Messages">
                <Mail size={18} />
              </button>

              <button className="header-home-icon-btn" title="Notifications">
                <Bell size={18} />
                <span className="header-home-badge-count">3</span>
              </button>

              {/* أيقونة المستخدم مع القائمة المنسدلة */}
              <div className="header-user-menu-container" ref={dropdownRef} style={{ position: 'relative' }}>
                <div 
                  className="header-home-user-avatar" 
                  title="User Profile" 
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{ cursor: 'pointer', background: '#22C55E', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', width: '36px', height: '36px' }}
                >
                  <User size={18} />
                </div>

                {/* القائمة المنسدلة */}
                {showDropdown && (
                  <div className="user-dropdown-menu" style={{
                    position: 'absolute',
                    top: '48px',
                    left: '0',
                    background: '#121212',
                    border: '1px solid #27272A',
                    borderRadius: '12px',
                    width: '260px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                    zIndex: 1000,
                    padding: '8px 0',
                    color: '#F3F4F6',
                    fontFamily: 'inherit'
                  }}>
                    {/* رأس القائمة: اسم المستخدم */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: '1px solid #1F1F23' }}>
                      <div style={{ background: '#22C55E', color: '#000', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        <User size={20} />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#FFFFFF' }}>{username}</div>
                        <div style={{ fontSize: '0.75rem', color: '#22C55E' }}>Online</div>
                      </div>
                    </div>

                    {/* خيارات القائمة مع توجيه القناة لصفحة البث */}
                    <div style={{ padding: '6px 0', borderBottom: '1px solid #1F1F23' }}>
                      <div onClick={() => { setShowDropdown(false); navigate(`/${username}/live`); }}>
                        <DropdownItem icon={<Video size={16} />} text="القناة / البث" />
                      </div>
                      <DropdownItem icon={<Sliders size={16} />} text="لوحة تحكم صانع المحتوى" />
                      <DropdownItem icon={<Shield size={16} />} text="مركز الخصوصية" />
                    </div>

                    <div style={{ padding: '6px 0', borderBottom: '1px solid #1F1F23' }}>
                      <DropdownItem icon={<Wallet size={16} />} text="المحفظة" />
                      <DropdownItem icon={<Settings size={16} />} text="الإعدادات" />
                    </div>

                    {/* زر تسجيل الخروج */}
                    <div style={{ padding: '6px 0' }}>
                      <button 
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          color: '#EF4444',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 16px',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                          textAlign: 'right'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#1F1F23'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <LogOut size={16} />
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Link 
                to="/auth" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'transparent',
                  border: '1px solid #27272A',
                  color: '#F3F4F6',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <LogIn size={16} />
                <span>Sign In</span>
              </Link>

              <Link 
                to="/auth" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#22C55E',
                  color: '#000000',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <UserPlus size={16} />
                <span>Register</span>
              </Link>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};

// مكون مساعد لعناصر القائمة المنسدلة
interface DropdownItemProps {
  icon: React.ReactNode;
  text: string;
}

const DropdownItem: React.FC<DropdownItemProps> = ({ icon, text }) => {
  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 16px',
        color: '#D1D5DB',
        fontSize: '0.9rem',
        cursor: 'pointer',
        transition: 'background 0.2s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = '#1F1F23'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <span style={{ color: '#9CA3AF' }}>{icon}</span>
      <span>{text}</span>
    </div>
  );
};

export default HeaderHome;