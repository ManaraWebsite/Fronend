import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// استيراد المكونات العامة
import Home from './Component/Home'; 

// استيراد صفحة الآدمن والـ Forms
import AdminLogin from './Api/AdminLogin';
import AdminDashboard from './Api/AdminDashboard';
import FormsList from './Api/FormsList'; 
import CreateForm from './Api/CreateForm';
import FormSubmissions from './Api/FormSubmissions';

// استيراد مكونات الـ Posts الجديدة
import PostsList from './Api/PostsList';
import CreatePost from './Api/CreatePost';

// مكون حماية المسارات
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  return token ? children : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* مسار الصفحة الرئيسية */}
        <Route path="/" element={<Home />} />
        
        {/* مسار تسجيل دخول الأدمن */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* مسارات الأدمن المحمية */}
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }>
          {/* مسارات النماذج (Forms) */}
          <Route path="forms" element={<FormsList />} />
          <Route path="forms/create" element={<CreateForm />} />
          <Route path="forms/:slug/submissions" element={<FormSubmissions />} />

          {/* مسارات المنشورات (Posts) بناءً على Postman */}
          <Route path="posts" element={<PostsList />} />
          <Route path="posts/create" element={<CreatePost />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;