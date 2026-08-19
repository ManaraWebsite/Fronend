// AdminLogin.jsx

import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';
import { FiLock, FiMail } from 'react-icons/fi';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await axiosClient.post('/login', {
        email: email.trim(),
        password: password
      });

      const data = response.data;

      if (data.token) {
        // تخزين التوكن بالاسم الصحيح المطابق لـ App.jsx (admin_token)
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('isAdminLoggedIn', 'true');
        
        // الانتقال المباشر للداشبورد
        window.location.href = '/admin';
      } else {
        setErrorMessage('لم يتم العثور على رمز المصادقة في الاستجابة.');
      }
    } catch (error) {
      console.error('Login error details:', error);
      if (error.response) {
        setErrorMessage(error.response.data.message || `خطأ من الخادم: ${error.response.status}`);
      } else if (error.request) {
        setErrorMessage('لم يتم استجابة من الخادم، تحقق من اتصال الإنترنت أو رابط الـ API.');
      } else {
        setErrorMessage('حدث خطأ غير متوقع.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 w-full" dir="rtl">
      <div className="bg-[#f9f9ff] p-8 md:p-12 rounded-[3rem] shadow-sm w-full max-w-md relative">
        
        <div className="text-center mb-8 space-y-2">
          <div className="w-12 h-1 bg-[#f97316] rounded-full mx-auto"></div>
          <h2 className="text-3xl font-bold text-[#211551]">لوحة التحكم</h2>
          <p className="text-gray-500 text-sm">قم بتسجيل الدخول للوصول إلى أدوات الإدارة</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#211551] text-right">البريد الإلكتروني</label>
            <div className="relative flex items-center">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com" 
                className="w-full p-4 pr-12 rounded-2xl bg-white border-none outline-none text-gray-700 shadow-xs text-right"
                required 
              />
              <FiMail className="absolute right-4 text-gray-400 text-lg" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#211551] text-right">كلمة المرور</label>
            <div className="relative flex items-center">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full p-4 pr-12 rounded-2xl bg-white border-none outline-none text-gray-700 shadow-xs text-right"
                required 
              />
              <FiLock className="absolute right-4 text-gray-400 text-lg" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#f97316] text-white py-4 rounded-2xl font-bold hover:bg-[#ea580c] transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </button>

          {errorMessage && (
            <div className="p-4 bg-red-100 text-red-700 rounded-2xl text-center font-medium text-sm">
              {errorMessage}
            </div>
          )}

        </form>

      </div>
    </div>
  );
}

export default AdminLogin;