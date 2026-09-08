// Contact.jsx

import React, { useContext, useState, useEffect } from 'react';
import { LanguageContext } from '../LanguageContext';
import { FiMapPin, FiMail, FiPhone, FiSend } from 'react-icons/fi';
import { FaLinkedinIn, FaXTwitter, FaFacebookF, FaInstagram } from 'react-icons/fa6';
import { motion } from 'framer-motion';

function Contact() {
  const { lang, t } = useContext(LanguageContext);
  const isAr = lang === 'AR';

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(false);
        setErrorMessage(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage(false);
    setErrorMessage(false);

    const formData = new FormData(e.target);

    try {
      // تم استبدال الخطأ بـ fetch وتصحيحه هنا 👇
      const response = await fetch("https://formsubmit.co/ajax/manara.gaza.pal@gmail.com", {
        method: "POST",
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        setSuccessMessage(true);
        e.target.reset(); 
      } else {
        setErrorMessage(true);
      }
    } catch (error) {
      setErrorMessage(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id='contact' className="py-24 bg-gray-50/50 overflow-hidden">
      <div className="container mx-auto px-6 grid md:grid-cols-12 gap-12 items-start">
        
        <motion.div 
          initial={{ opacity: 0, x: isAr ? 50 : -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`md:col-span-7 bg-white p-8 md:p-12 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 relative ${isAr ? 'md:order-2' : 'md:order-1'}`} 
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-[#211551] text-[#f97316] rounded-xl">
              <FiMail className="text-xl" />
            </div>
            <h3 className="text-xl font-bold text-[#211551]">
              {t.sendMsgTitle || (isAr ? 'أرسل لنا رسالة' : 'Send us a message')}
            </h3>
          </div>

          <form onSubmit={handleSubmit}>
            <input type="hidden" name="_template" value="table" />

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-500">
                  {t.nameLabel || (isAr ? 'الاسم' : 'Name')}
                </label>
                <input 
                  name="name" 
                  type="text" 
                  placeholder={t.namePlaceholder || (isAr ? 'أدخل اسمك' : 'Enter your name')} 
                  className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 focus:border-[#f97316] focus:bg-white outline-none w-full text-gray-700 transition-all text-sm" 
                  required 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-500">
                  {t.emailLabel || (isAr ? 'البريد الإلكتروني' : 'Email')}
                </label>
                <input 
                  name="email" 
                  type="email" 
                  placeholder={t.emailPlaceholder || "example@mail.com"} 
                  className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 focus:border-[#f97316] focus:bg-white outline-none w-full text-gray-700 transition-all text-sm text-left" 
                  dir="ltr"
                  required 
                />
              </div>
              
            </div>

            <div className="flex flex-col gap-2 mb-8">
              <label className="text-xs font-semibold text-gray-500">
                {t.messageLabel || (isAr ? 'الرسالة' : 'Message')}
              </label>
              <textarea 
                name="message" 
                placeholder={t.messagePlaceholder || (isAr ? 'كيف يمكننا مساعدتك؟' : 'How can we help you?')} 
                className="w-full p-4 rounded-2xl bg-gray-50/80 border border-gray-100 focus:border-[#f97316] focus:bg-white outline-none h-44 text-gray-700 resize-none transition-all text-sm" 
                required
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="bg-[#f97316] text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-[#ea580c] shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
            >
              <FiSend className={isAr ? 'rotate-180' : ''} />
              {submitting ? (isAr ? 'جاري الإرسال...' : 'Sending...') : (t.sendBtn || (isAr ? 'إرسال' : 'Send'))}
            </button>

            {successMessage && (
              <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-2xl text-center text-sm font-medium">
                {isAr ? 'تم الإرسال بنجاح، شكراً لتواصلك معنا!' : 'Sent successfully, thank you!'}
              </div>
            )}

            {errorMessage && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-2xl text-center text-sm font-medium">
                {isAr ? 'حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى.' : 'An error occurred, please try again.'}
              </div>
            )}
          </form>
        </motion.div>

        {/* 2. قسم معلومات التواصل (تتحرك الصناديق بتسلسل حركي Staggered Animation) */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15
              }
            }
          }}
          className={`md:col-span-5 space-y-4 ${isAr ? 'text-right md:order-1' : 'text-left md:order-2'}`} 
          dir={isAr ? 'rtl' : 'ltr'}
        >
          
          <motion.div 
            variants={{ hidden: { opacity: 0, x: isAr ? -30 : 30 }, visible: { opacity: 1, x: 0 } }}
            className={`flex items-center gap-2 mb-2 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]"></span>
            <h2 className="text-lg font-bold text-[#211551]">
              {t.contactTitle || (isAr ? 'تواصل معنا' : 'Get in touch')}
            </h2>
          </motion.div>

          {/* بطاقة العنوان */}
          <motion.div 
            variants={{ hidden: { opacity: 0, x: isAr ? -30 : 30 }, visible: { opacity: 1, x: 0 } }}
            whileHover={{ scale: 1.02, x: isAr ? -5 : 5 }}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-shadow hover:shadow-md cursor-pointer"
          >
            <div className={`p-3.5 bg-[#211551] text-white rounded-xl shadow-sm ${isAr ? 'order-2' : 'order-1'}`}>
              <FiMapPin className="text-xl text-orange-400" />
            </div>
            <div className={`flex-1 ${isAr ? 'order-1 text-right' : 'order-2 text-left'}`}>
              <h4 className="font-bold text-[#211551] text-sm">{isAr ? 'العنوان' : 'Address'}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{t.address || (isAr ? 'غزة، فلسطين' : 'Palestine, Gaza Strip')}</p>
            </div>
          </motion.div>

          {/* بطاقة الهاتف */}
          <motion.div 
            variants={{ hidden: { opacity: 0, x: isAr ? -30 : 30 }, visible: { opacity: 1, x: 0 } }}
            whileHover={{ scale: 1.02, x: isAr ? -5 : 5 }}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-shadow hover:shadow-md cursor-pointer"
          >
            <div className={`p-3.5 bg-[#211551] text-white rounded-xl shadow-sm ${isAr ? 'order-2' : 'order-1'}`}>
              <FiPhone className="text-xl text-orange-400" />
            </div>
            <div className={`flex-1 ${isAr ? 'order-1 text-right' : 'order-2 text-left'}`}>
              <h4 className="font-bold text-[#211551] text-sm">{isAr ? 'الهاتف' : 'Phone'}</h4>
              <p className="text-xs text-gray-500 mt-0.5" dir="ltr">{t.phone || '+970 8 123 4567'}</p>
            </div>
          </motion.div>

          {/* بطاقة البريد الإلكتروني */}
          <motion.div 
            variants={{ hidden: { opacity: 0, x: isAr ? -30 : 30 }, visible: { opacity: 1, x: 0 } }}
            whileHover={{ scale: 1.02, x: isAr ? -5 : 5 }}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-shadow hover:shadow-md cursor-pointer"
          >
            <div className={`p-3.5 bg-[#211551] text-white rounded-xl shadow-sm ${isAr ? 'order-2' : 'order-1'}`}>
              <FiMail className="text-xl text-orange-400" />
            </div>
            <div className={`flex-1 ${isAr ? 'order-1 text-right' : 'order-2 text-left'}`}>
              <h4 className="font-bold text-[#211551] text-sm">{isAr ? 'البريد الإلكتروني' : 'Email'}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{t.email || 'manara.gaza.pal@gmail.com'}</p>
            </div>
          </motion.div>

          {/* بطاقة وسائل التواصل الاجتماعي */}
          <motion.div 
            variants={{ hidden: { opacity: 0, x: isAr ? -30 : 30 }, visible: { opacity: 1, x: 0 } }}
            whileHover={{ scale: 1.02, x: isAr ? -5 : 5 }}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-shadow hover:shadow-md"
          >
            <span className="text-xs font-bold text-[#211551]">
              {isAr ? 'تابعنا على' : 'Follow us on'}
            </span>
            <div className="flex gap-2">
              <a href="https://www.facebook.com/profile.php?id=61591327107257" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-[#211551] hover:text-white transition-all shadow-sm">
                <FaFacebookF className="text-xs" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-[#211551] hover:text-white transition-all shadow-sm">
                <FaXTwitter className="text-xs" />
              </a>
              <a href="https://www.linkedin.com/company/manara03/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-[#211551] hover:text-white transition-all shadow-sm">
                <FaLinkedinIn className="text-xs" />
              </a>
              <a href="https://www.instagram.com/manara.pal/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-[#211551] hover:text-white transition-all shadow-sm">
                <FaInstagram className="text-xs" />
              </a>
            </div>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}

export default Contact;