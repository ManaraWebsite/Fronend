import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// استيراد المكونات العامة
import Home from './Component/Home'; 

// استيراد صفحة الآدمن والـ Forms والـ Posts
import AdminLogin from './Api/AdminLogin';
import AdminDashboard from './Api/AdminDashboard';
import FormsList from './Api/FormsList'; 
import CreateForm from './Api/CreateForm';
import EditForm from './Api/EditForm';
import FormSubmissions from './Api/FormSubmissions';
import PostsList from './Api/PostsList';
import CreatePost from './Api/CreatePost';
import PublicFormView from './Api/PublicFormView';

// استيراد مكونات أصوات من الميدان (Field Voices)
import FieldVoicesAdmin from './Api/FieldVoicesAdmin';
import FieldVoiceForm from './Api/FieldVoiceForm'; // إذا أنشأتِ نموذج الإضافة والتعديل

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
        
        {/* مسار المعاينة العامة للنموذج (خارج قسم الأدمن) */}
        <Route path="/forms/:slug" element={<PublicFormView />} />
        
        {/* مسارات الأدمن المحمية */}
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }>
          {/* مسارات النماذج (Forms) */}
          <Route path="forms" element={<FormsList />} />
          <Route path="forms/create" element={<CreateForm />} />
          <Route path="forms/edit/:slug" element={<EditForm />} />
          <Route path="forms/:slug/submissions" element={<FormSubmissions />} />

          {/* مسارات المنشورات (Posts) */}
          <Route path="posts" element={<PostsList />} />
          <Route path="posts/create" element={<CreatePost />} />

          {/* مسارات أصوات من الميدان (Field Voices) */}
          <Route path="field-voices" element={<FieldVoicesAdmin />} />
          <Route path="field-voices/create" element={<FieldVoiceForm />} />
          <Route path="field-voices/edit/:id" element={<FieldVoiceForm />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;