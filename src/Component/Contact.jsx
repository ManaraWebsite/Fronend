// Contact.jsx

import React, { useContext, useState, useEffect } from 'react';
import { LanguageContext } from '../LanguageContext';
import { FiMapPin, FiMail, FiPhone } from 'react-icons/fi';

function Contact() {
  const { lang, t } = useContext(LanguageContext);
  const isAr = lang === 'AR';

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);

  // جعل الرسائل تختفي تلقائياً بعد 6 ثوانٍ
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(false);
        setErrorMessage(false);
      }, 6000); // 6000 ملي ثانية = 6 ثوانٍ
      
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
      const response = await fetch("https://formsubmit.co/ajax/manara.gaza.pal@gmail.com", {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
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
    <section id='contact' className="py-20 bg-white">
      <div className={`container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center ${isAr ? '' : 'md:grid-flow-dense'}`}>
        
        <form 
          onSubmit={handleSubmit}
          className={`bg-[#f9f9ff] p-8 md:p-12 rounded-[3rem] shadow-sm relative ${isAr ? '' : 'md:order-2'}`}
        >
          <input type="hidden" name="_template" value="table" />

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            
            {/* حقل الاسم */}
            <input 
              name="name" 
              type="text" 
              placeholder={t.namePlaceholder || "الاسم"} 
              className={`p-4 rounded-2xl bg-[white] border-none outline-none w-full ${isAr ? 'text-right order-1 md:order-1' : 'text-left order-2 md:order-1'}`} 
              required 
            />

            {/* حقل البريد الإلكتروني */}
            <input 
              name="email" 
              type="email" 
              placeholder={t.emailPlaceholder || "البريد الإلكتروني"} 
              className={`p-4 rounded-2xl bg-[white] border-none outline-none w-full ${isAr ? 'text-right order-2 md:order-2' : 'text-left order-1 md:order-2'}`} 
              required 
            />
            
          </div>

          <textarea 
            name="message" 
            placeholder={t.messagePlaceholder || "رسالتك"} 
            className={`w-full p-4 rounded-2xl bg-[white] border-none outline-none mb-6 h-40 ${isAr ? 'text-right' : 'text-left'}`} 
            required
          ></textarea>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-[#f97316] text-white py-4 rounded-2xl font-bold hover:bg-[#ea580c] transition-all disabled:opacity-50"
          >
            {submitting ? (isAr ? 'جاري الإرسال...' : 'Sending...') : (t.sendBtn || 'إرسال')}
          </button>

          {successMessage && (
            <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-2xl text-center font-medium animate-fadeIn">
              {isAr ? 'تم الإرسال بنجاح، شكراً لتواصلك معنا!' : 'Sent successfully, thank you!'}
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-2xl text-center font-medium animate-fadeIn">
              {isAr ? 'حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى.' : 'An error occurred, please try again.'}
            </div>
          )}
        </form>

        <div className={`space-y-8 ${isAr ? 'text-right' : 'text-left'} ${isAr ? '' : 'md:order-1'}`}>
          <h2 className="text-3xl font-bold text-[#211551]">{t.contactTitle}</h2>
          <p className="text-gray-500 leading-relaxed">{t.contactDesc}</p>
          
          <div className="space-y-6">
            <div className={`flex items-center gap-4 ${isAr ? 'justify-end' : 'justify-start'}`}>
              <span>{t.address}</span>
              <div className="p-3 bg-gray-50 rounded-full"><FiMapPin className="text-[#f97316]" /></div>
            </div>
            <div className={`flex items-center gap-4 ${isAr ? 'justify-end' : 'justify-start'}`}>
              <span>{t.email}</span>
              <div className="p-3 bg-gray-50 rounded-full"><FiMail className="text-[#f97316]" /></div>
            </div>
            <div className={`flex items-center gap-4 ${isAr ? 'justify-end' : 'justify-start'}`}>
              <span>{t.phone}</span>
              <div className="p-3 bg-gray-50 rounded-full"><FiPhone className="text-[#f97316]" /></div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export class ContactSection {}
export default Contact;