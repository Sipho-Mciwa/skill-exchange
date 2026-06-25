import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { NavBar } from './components/NavBar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { BrowsePage } from './pages/BrowsePage';
import { MyListingsPage } from './pages/MyListingsPage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { InboxPage } from './pages/InboxPage';
import { ConversationPage } from './pages/ConversationPage';
import { WalletPage } from './pages/WalletPage';
import { LandingPage } from './pages/LandingPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/*"
        element={
          <>
            <NavBar />
            <Routes>
              <Route path="/browse" element={<ProtectedRoute><BrowsePage /></ProtectedRoute>} />
              <Route path="/my-listings" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
              <Route path="/listings/:id" element={<ProtectedRoute><ListingDetailPage /></ProtectedRoute>} />
              <Route path="/inbox" element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />
              <Route path="/conversations/:id" element={<ProtectedRoute><ConversationPage /></ProtectedRoute>} />
              <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/browse" replace />} />
            </Routes>
          </>
        }
      />
    </Routes>
  );
}
