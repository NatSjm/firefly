import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './i18n';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';
import { AboutPage } from '@/pages/AboutPage';
import { AdminPage } from '@/pages/AdminPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { FeedPage } from '@/pages/FeedPage';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { LostDetailPage } from '@/pages/LostDetailPage';
import { LostNewPage } from '@/pages/LostNewPage';
import { LostPage } from '@/pages/LostPage';
import { MemoryDetailPage } from '@/pages/MemoryDetailPage';
import { MemoryFormPage } from '@/pages/MemoryFormPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { RegisterPage } from '@/pages/RegisterPage';
import { RulesPage } from '@/pages/RulesPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/lost" element={<LostPage />} />
            <Route path="/lost/new" element={<ProtectedRoute><LostNewPage /></ProtectedRoute>} />
            <Route path="/lost/:id" element={<LostDetailPage />} />
            <Route path="/memories/:id" element={<MemoryDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/memories/new" element={<ProtectedRoute><MemoryFormPage /></ProtectedRoute>} />
            <Route path="/memories/:id/edit" element={<ProtectedRoute><MemoryFormPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
