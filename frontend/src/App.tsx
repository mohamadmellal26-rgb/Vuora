import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
// استيراد المكونات مع التأكد من مطابقة حالة الأحرف تماماً
import { FeaturesGrid } from './compnent/FeaturesGrid';
import { IntegrationsSection } from './compnent/IntegrationsSection';
import { Footer } from './compnent/Footer';
import Banner from './compnent/Banner';
import Header from './compnent/header';
import HeaderHome from './Home/Header';
import HeroSection from './compnent/HeroSection';
import LogoCloud from './compnent/LogoCloud';
import Divider from './compnent/Divider';
import Sidebar from './Home/Sidebar';
import LiveStreams from './Home/LiveStreams';

import AuthPage from './auth/auth';
import LivePage from './LivePage/LivePage';

import ViewerPage from './ViewerPage/ViewerPage';

// مكون صفحة الهوم الرئيسية مع تثبيت الـ Sidebar في جهة اليمين بدقة وعرض البثوث
const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-full bg-[#0e0e10] overflow-hidden" dir="rtl">
      {/* الشريط العلوي - ثابت في الأعلى ولا ينكمش */}
      <div className="shrink-0">
        <HeaderHome />
      </div>

      {/* الحاوية السفلية - flex-nowrap تمنع نزول العناصر تحت بعضها نهائياً */}
      <div className="flex flex-1 min-h-0 overflow-hidden flex-row flex-nowrap">
        {/* الشريط الجانبي في اليمين - عريض وثابت ولا ينكمش */}
        <div className="shrink-0 h-full">
          <Sidebar />
        </div>

        {/* محتوى البثوث في اليسار - يأخذ باقي المساحة مع التمرير المستقل */}
        <main className="flex-1 min-h-0 overflow-y-auto bg-[#0e0e10]">
          <LiveStreams />
        </main>
      </div>
    </div>
  );
};

// مكون مخصص لصفحة Startpage يجمع بقية القطع
const StartPage: React.FC = () => {
  return (
    <div>
      <Banner />       
      <Header />       
      <HeroSection />       
      <LogoCloud />       
      <Divider />       
      <FeaturesGrid />       
      <IntegrationsSection />       
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* صفحة الهوم في المسار الرئيسي */}
        <Route path="/home" element={<HomePage />} />
        
        {/* صفحة البداية في المسار الافتراضي */}
        <Route path="/" element={<StartPage />} />

        {/* صفحة تسجيل الدخول وإنشاء الحساب */}
        <Route path="/auth" element={<AuthPage />} />

        {/* صفحة البث المباشر الخاصة بالمستخدم */}
        <Route path="/:username/live" element={<LivePage />} />
        <Route path="/watch/:username" element={<ViewerPage />} />
      </Routes>
    </Router>
  );
};

export default App;