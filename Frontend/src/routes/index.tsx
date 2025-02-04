import { Routes, Route } from 'react-router-dom';
import Layout from '@layouts/Layout';
import HomePage from '@pages/HomePage';
import FollowingPage from '@pages/FollowingPage';
import CategoryPage from '@pages/CategoryPage';
import CategoryDetailPage from '@pages/CategoryPage/CategoryDetailPage';
import LivePage from '@pages/LivePage';
import LivesPage from '@pages/LivesPage';
import StudioPage from '@pages/StudioPage';
import LoginPage from '@pages/LoginPage';
import MyPage from '@pages/MyPage';
import LoginCallback from '@pages/LoginPage/LoginCallback';
import ChatPopupPage from '@pages/ChatPopupPage';
import { ProtectedRoute, AuthRoute } from './ProtectedRoute';
import NotFound from '@components/error/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth/:provider/callback" element={<LoginCallback />} />

      <Route path="/chat-popup" element={<ChatPopupPage />} />

      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/category/:categoryId" element={<CategoryDetailPage />} />
        <Route path="/live/:id" element={<LivePage />} />
        <Route path="/lives" element={<LivesPage />} />
        <Route
          path="/login"
          element={
            <AuthRoute>
              <LoginPage />
            </AuthRoute>
          }
        />
        <Route path="*" element={<NotFound />} />

        <Route
          path="/following"
          element={
            <ProtectedRoute>
              <FollowingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/studio/:channelId"
          element={
            <ProtectedRoute>
              <StudioPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mypage/:userId"
          element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
