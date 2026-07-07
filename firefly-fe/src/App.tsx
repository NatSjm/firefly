import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './i18n';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthProvider';

const AboutPage = lazy(() => import('@/pages/AboutPage').then((module) => ({ default: module.AboutPage })));
const AdminPage = lazy(() => import('@/pages/AdminPage').then((module) => ({ default: module.AdminPage })));
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const FeedPage = lazy(() => import('@/pages/FeedPage').then((module) => ({ default: module.FeedPage })));
const HomePage = lazy(() => import('@/pages/HomePage').then((module) => ({ default: module.HomePage })));
const LoginPage = lazy(() => import('@/pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const LostDetailPage = lazy(() => import('@/pages/LostDetailPage').then((module) => ({ default: module.LostDetailPage })));
const LostNewPage = lazy(() => import('@/pages/LostNewPage').then((module) => ({ default: module.LostNewPage })));
const LostPage = lazy(() => import('@/pages/LostPage').then((module) => ({ default: module.LostPage })));
const MemoryDetailPage = lazy(() => import('@/pages/MemoryDetailPage').then((module) => ({ default: module.MemoryDetailPage })));
const MemoryFormPage = lazy(() => import('@/pages/MemoryFormPage').then((module) => ({ default: module.MemoryFormPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((module) => ({ default: module.ProfilePage })));
const RegisterPage = lazy(() => import('@/pages/RegisterPage').then((module) => ({ default: module.RegisterPage })));
const RulesPage = lazy(() => import('@/pages/RulesPage').then((module) => ({ default: module.RulesPage })));

const pageFallback = <div style={{ padding: 'var(--space-10)', textAlign: 'center' }}>Завантаження…</div>;

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Suspense fallback={pageFallback}>
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
          </Suspense>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
