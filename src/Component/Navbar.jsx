import React, { useContext, useState, useEffect } from 'react';
import { LanguageContext } from '../LanguageContext';
import { HiMenu, HiX } from 'react-icons/hi';
import { HiGlobeAlt } from 'react-icons/hi2';

function Navbar() {
  const { lang, setLang, t } = useContext(LanguageContext);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const isAr = lang === 'AR';

  // مصفوفة الروابط لتسهيل تكرارها وتحديد حالتها النشطة
  const navLinks = [
    { id: 'home', label: isAr ? 'الرئيسية' : (t.home || 'Home') },
        { id: 'about', label: isAr ? 'من نحن' : (t.about || 'About') },

    { id: 'services', label: isAr ? 'الخدمات' : (t.services || 'Services') },
    { id: 'workshops', label: isAr ? 'ورش العمل' : 'Workshops' },
    { id: 'posts', label: isAr ? 'المنشورات' : 'Posts' },
  ];

  useEffect(() => {
    const sections = navLinks.map(link => document.getElementById(link.id)).filter(Boolean);
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 } // يتم تفعيل القسم عندما يظهر بنسبة 30% على الشاشة
    );

    sections.forEach(section => observer.observe(section));

    return () => {
      sections.forEach(section => observer.unobserve(section));
    };
  }, [isAr]);

  const linkStyle = (id) => `
    relative cursor-pointer transition-colors duration-300 font-medium pb-1
    ${activeSection === id ? 'text-orange-500 font-semibold' : 'text-white hover:text-orange-500'}
    after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-orange-500
    after:transition-transform after:duration-300
    ${activeSection === id ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'}
  `;

  return (
    <nav className="fixed top-4 left-0 right-0 w-[89%] mx-auto z-50 rounded-[50px] bg-[#1a1a2e]/50 backdrop-blur-md border border-white/10 shadow-lg">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center flex-row" dir="rtl">
        
        {/* 1. الشعار */}
        <div className="text-2xl font-bold cursor-pointer flex items-center">
          <img src='Logo.png' alt="Logo" className="h-10" />
        </div>

        {/* 2. روابط التنقل للشاشات الكبيرة */}
        <ul className="hidden md:flex gap-6 lg:gap-8 items-center" dir={isAr ? 'rtl' : 'ltr'}>
          {navLinks.map((link) => (
            <li key={link.id}>
              <a 
                href={`#${link.id}`} 
                onClick={() => setActiveSection(link.id)}
                className={linkStyle(link.id)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* 3. الأزرار */}
        <div className="flex gap-4 items-center" dir="ltr">
          <button 
            onClick={setLang}
            className="border border-white/30 px-3.5 py-1.5 rounded-lg text-white hover:bg-white hover:text-black hover:border-white active:scale-95 transition-all duration-200 text-sm font-medium flex items-center gap-2"
          >
            <HiGlobeAlt className="text-lg" />
            <span>{lang === 'AR' ? 'English' : 'العربية'}</span>
          </button>

          <a href="#contact" className="hidden md:block bg-orange-500 px-6 py-2 rounded-full font-bold hover:bg-orange-600 active:scale-95 transition-all duration-200 text-white">
            {t.contact || 'Contact Us'}
          </a>

          <button className="md:hidden text-3xl text-white hover:text-orange-500 transition-colors" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </div>

      {/* قائمة الموبايل */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-black/95 backdrop-blur-sm flex flex-col items-center gap-6 py-8 md:hidden border-t border-gray-900 z-40 rounded-b-2xl" dir={isAr ? 'rtl' : 'ltr'}>
          <ul className="flex flex-col gap-5 text-center">
            {navLinks.map((link) => (
              <li key={link.id}>
                <a 
                  href={`#${link.id}`} 
                  onClick={() => {
                    setActiveSection(link.id);
                    setIsOpen(false);
                  }}
                  className={linkStyle(link.id)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#contact" onClick={() => setIsOpen(false)} className="bg-orange-500 px-8 py-2 rounded-full font-bold text-white hover:bg-orange-600 w-4/5 max-w-xs transition-colors text-center">
            {t.contact || 'Contact Us'}
          </a>
        </div>
      )}
    </nav>
  );
}

export default Navbar;