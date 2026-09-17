import React, { useContext, useState, useEffect } from 'react';
import { LanguageContext } from '../LanguageContext';
import { motion } from 'framer-motion';
import axiosClient from '../Api/axiosClient';

function LatestPostsSection() {
  const { lang } = useContext(LanguageContext);
  const isAr = lang === 'AR';

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestPosts = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get('/posts'); 
        const fetchedData = response.data.data || response.data;
        setPosts(fetchedData);
      } catch (error) {
        console.error('Error fetching latest posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPosts();
  }, []);

  const getImageUrl = (post) => {
    const rawImage = post.cover_image || post.image || post.image_url;
    const fallbackImage = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80';
    
    if (!rawImage) return fallbackImage;
    if (typeof rawImage === 'string' && rawImage.startsWith('http')) return rawImage;

    const baseServerUrl = axiosClient.defaults.baseURL 
      ? axiosClient.defaults.baseURL.replace(/\/api\/?$/, '') 
      : 'http://43.156.53.131';
    
    const cleanPath = String(rawImage).replace(/^\/+/, '').replace(/^storage\//, '');

    return `${baseServerUrl}/storage/${cleanPath}`;
  };

  return (
    <section id='posts' className="py-24 bg-[#1a1a2e]">
      <div className="container mx-auto px-6 md:px-10">
        
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: .8 }}
          className="text-center mb-16"
        >
          <div className="w-16 h-1 bg-orange-500 mx-auto mb-5 rounded-full"></div>

          <h2 className="text-4xl font-bold text-white">
            {isAr ? 'أحدث المنشورات والمقالات' : 'Latest Posts & Articles'}
          </h2>

          <p className="text-gray-300 mt-5 max-w-3xl mx-auto">
            {isAr ? 'تابع آخر الأخبار، النصائح الإدارية، والتحديثات التقنية لدينا' : 'Follow our latest news, management tips, and technical updates'}
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">
            {isAr ? 'جاري تحميل المقالات...' : 'Loading posts...'}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {isAr ? 'لا توجد منشورات متاحة حالياً.' : 'No posts available at the moment.'}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.slice(0, 3).map((post, index) => {
              const title = typeof post.title === 'object' 
                ? (isAr ? post.title?.ar || post.title?.en : post.title?.en || post.title?.ar)
                : post.title;

              const desc = typeof post.content === 'object'
                ? (isAr ? post.content?.ar || post.content?.en : post.content?.en || post.content?.ar)
                : (typeof post.desc === 'object' 
                    ? (isAr ? post.desc?.ar || post.desc?.en : post.desc?.en || post.desc?.ar) 
                    : post.desc || post.content);

              const postDate = post.created_at || post.published_at
                ? new Date(post.created_at || post.published_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) 
                : '';

              const categoryName = post.category 
                ? (typeof post.category === 'object' ? (isAr ? post.category?.ar || post.category?.en : post.category?.en) : post.category)
                : (isAr ? 'مقالات عامة' : 'General');

              const imageUrl = getImageUrl(post);

              return (
                <motion.div
                  key={post.id || post.slug}
                  initial={{ opacity: 0, y: 80 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: .6,
                    delay: index * .2,
                  }}
                  whileHover={{
                    y: -10,
                    scale: 1.03,
                  }}
                  className="bg-[#23233c] rounded-3xl overflow-hidden border border-orange-500/10 hover:border-orange-300 transition-all duration-300 flex flex-col group shadow-lg"
                >
                  <div className="relative overflow-hidden h-52 bg-gray-800">
                    <img 
                      src={imageUrl} 
                      alt={title || 'Post image'} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <span className="absolute top-4 right-4 bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow">
                      {categoryName}
                    </span>
                  </div>

                  <div className="p-8 flex flex-col flex-grow text-start" style={{ textAlign: isAr ? 'right' : 'left' }}>
                    <span className="text-gray-400 text-xs mb-3 block">{postDate}</span>
                    
                    <h3 className="text-2xl font-bold text-white mb-5 group-hover:text-orange-400 transition-colors line-clamp-2">
                      {title}
                    </h3>
                    
                    <p className="text-gray-300 leading-8 text-sm mb-6 line-clamp-3">
                      {desc}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-800 flex items-center justify-between">
                      <a 
                        href={`/posts/${post.slug}`} 
                        className="text-orange-400 font-semibold text-sm hover:text-orange-300 inline-flex items-center gap-2 transition-colors"
                      >
                        {isAr ? 'اقرأ المزيد' : 'Read More'}
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}

export default LatestPostsSection;