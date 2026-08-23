// SuccessStories.jsx

import React, { useState, useEffect, useContext } from 'react';
import { LanguageContext } from '../LanguageContext';
import { motion } from 'framer-motion';
import axiosClient from '../Api/axiosClient';

function SuccessStories() {
  const { lang } = useContext(LanguageContext);
  const isAr = lang === 'AR';

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get('/field-voices');
        
        const data = response.data.data || response.data;
        setStories(data);
      } catch (err) {
        console.error('Error fetching success stories:', err);
        setError('فشل في جلب البيانات من الخادم');
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  if (loading) {
    return (
      <div className="py-20 bg-[#1a1a2e]/90 text-center text-white">
        <p className="text-xl">{isAr ? 'جاري تحميل القصص...' : 'Loading stories...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 bg-[#1a1a2e]/90 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <section id="stories" className="py-20 bg-[#0b0c16] text-white overflow-hidden">
      <div className="container mx-auto px-6 md:px-10">
        
        <div className="text-center mb-16 space-y-3">
          <div className="w-12 h-1 bg-orange-500 mx-auto rounded-full"></div>
          <h2 className="text-3xl md:text-4xl font-bold">
            {isAr ? "أصوات من الميدان" : "Voices from the Field"}
          </h2>
          <p className="text-gray-400 max-w-md mx-auto">
            {isAr ? "قصص نجاح كتبت بالتعب والأمل" : "Success stories written with hardship and hope"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story, index) => {
            const storyNumber = String(index + 1).padStart(2, '0');

            return (
              <motion.div
                key={story.id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative bg-[#16182e]/60 border border-gray-800/80 p-8 rounded-[2rem] flex flex-col justify-between backdrop-blur-sm hover:border-orange-500/50 transition-all group"
              >
                <span className="absolute top-6 left-6 text-4xl font-black text-gray-700/30 select-none group-hover:text-orange-500/20 transition-colors">
                  {storyNumber}
                </span>

                <p className="text-gray-300 leading-relaxed mb-8 relative z-10 text-left">
                  "{story.quote}"
                </p>

                <div className="flex items-center gap-4 pt-4 border-t border-gray-800/60 flex-row text-left">
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 font-bold text-lg shrink-0">
                    {story.image ? (
                      <img src={story.image} alt={story.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      story.name?.[0] || 'ع'
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-base">
                      {story.name}
                    </h4>
                    <span className="text-xs text-orange-400">
                      {story.role}
                    </span>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default SuccessStories;