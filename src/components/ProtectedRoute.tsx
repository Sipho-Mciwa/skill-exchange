import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { firebaseUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!firebaseUser) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
