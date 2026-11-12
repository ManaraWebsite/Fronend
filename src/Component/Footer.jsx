// Footer.jsx

import React, { useContext } from 'react';
import { FiMail } from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa6';
import { LanguageContext } from '../LanguageContext';
import { announceIntent } from '../lib/contactIntent';
import { TAGLINE } from '../lib/tagline';
import SectionLink from './SectionLink';

// التذييل يقول من هي منارة ولماذا وُجدت وماذا تقدّم، ثم كيف يستكشفها الزائر أو يشارك فيها.
// النصوص من محتوى الموقع نفسه: عبارة الإيمان من «حكاية منارة» (نص معتمد من الفريق)،
// والخدمات الأربع من قسم الخدمات، وأزرار المشاركة نفسها التي تفتح نموذج التواصل بموضوع محدد.
const COPY = {
  AR: {
    belief: <>نؤمن أن الموهبة موجودة، وما ينقصها أحيانًا هو <em>الفرصة</em>.</>,
    offer: ['ورش عمل تقنية', 'تدريب ميداني', 'مشاريع برمجية', 'أنشطة لا منهجية'],
    offerLabel: 'ما تقدّمه منارة',
    explore: 'استكشف',
    involve: 'كن جزءًا من الأثر',
  },
  EN: {
    belief: <>We believe talent is there; what it sometimes lacks is the <em>opportunity</em>.</>,
    offer: ['Technical workshops', 'Field training', 'Software projects', 'Extracurricular activities'],
    offerLabel: 'What Manara offers',
    explore: 'Explore',
    involve: 'Be part of the impact',
  },
};

const EXPLORE = [
  { id: 'about', AR: 'حكاية منارة', EN: 'Our story' },
  { id: 'workshops', AR: 'ورش العمل', EN: 'Workshops' },
  { id: 'activities', AR: 'لحظات حقيقية', EN: 'Real moments' },
  { id: 'posts', AR: 'المنشورات', EN: 'Posts' },
];

// intent يحدد موضوع رسالة التواصل ونصها المقترح (Contact)
const INVOLVE = [
  { intent: 'support', AR: 'ادعم منارة', EN: 'Support Manara' },
  { intent: 'volunteer', AR: 'تطوّع معنا', EN: 'Volunteer with us' },
  { intent: 'general', AR: 'تواصل معنا', EN: 'Contact us' },
];

// نفس حسابات قسم التواصل
const SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/manara.pal/', icon: FaInstagram },
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61591327107257', icon: FaFacebookF },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/manara03/posts/?feedView=all', icon: FaLinkedinIn },
];

const DEVELOPERS = [
  { name: 'Basma ALSayad', linkedin: 'https://www.linkedin.com/in/basma-alsayed-84497333b/' },
  { name: 'ALBaraa Raed ALSaiqali', linkedin: 'https://www.linkedin.com/in/albaraa-r-alsaiqali/' },
];

function LinkList({ title, children }) {
  return (
    <nav aria-label={title}>
      <h2 className="footer-label">{title}</h2>
      <ul className="footer-list">{children}</ul>
    </nav>
  );
}

function Footer() {
  const { lang, t } = useContext(LanguageContext);
  const isAr = lang === 'AR';
  const copy = COPY[lang];
  const newTab = isAr ? 'يفتح في نافذة جديدة' : 'opens in a new tab';

  return (
    <footer className="site-footer bg-brand-purple-dark text-white" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-6 md:px-10">
        <div className="footer-main">
          <div className="footer-identity">
            {/* توقيع الهوية: الشعار بجانب الشعار الرسمي بلغة الصفحة */}
            <div className="footer-signature">
              <img src="/Logo.png" alt={isAr ? 'منارة' : 'Manara'} className="footer-logo" loading="lazy" decoding="async" />
              <p className="footer-tagline" lang={isAr ? 'ar' : 'en'}>{TAGLINE[lang]}</p>
            </div>
            <p className="footer-belief">{copy.belief}</p>
            <p className="footer-offer">
              <span className="sr-only">{copy.offerLabel}: </span>
              {copy.offer.map((item) => <span key={item} className="footer-offer-item">{item}</span>)}
            </p>
            <ul className="footer-icons">
              <li>
                <a href={`mailto:${t.email}`} className="footer-icon" aria-label={`${isAr ? 'البريد الإلكتروني' : 'Email'}: ${t.email}`}>
                  <FiMail aria-hidden="true" />
                </a>
              </li>
              {SOCIALS.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="footer-icon" aria-label={`${label} (${newTab})`}>
                    <Icon aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-links">
            <LinkList title={copy.explore}>
              {EXPLORE.map((link) => (
                <li key={link.id}><SectionLink id={link.id} className="footer-link">{link[lang]}</SectionLink></li>
              ))}
            </LinkList>
            <LinkList title={copy.involve}>
              {INVOLVE.map((link) => (
                <li key={link.intent}>
                  <SectionLink id="contact" onClick={() => announceIntent(link.intent)} className="footer-link">{link[lang]}</SectionLink>
                </li>
              ))}
            </LinkList>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-rights">{t.footerRights}</p>
          <p className="footer-credits">
            <span>{t.footerDevelopedBy}</span>
            {DEVELOPERS.map((dev) => (
              <a
                key={dev.linkedin}
                href={dev.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-dev"
                aria-label={isAr ? `${dev.name} على LinkedIn (${newTab})` : `${dev.name} on LinkedIn (${newTab})`}
              >
                <FaLinkedinIn aria-hidden="true" />
                <bdi>{dev.name}</bdi>
              </a>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
