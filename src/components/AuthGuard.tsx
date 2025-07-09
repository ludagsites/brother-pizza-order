
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuard = ({ children, requireAuth = false }: AuthGuardProps) => {
  const { user, loading } = useSupabaseAuth();
  const navigate = useNavigate();

  // Debug logs
  console.log('AuthGuard - user:', user);
  console.log('AuthGuard - loading:', loading);
  console.log('AuthGuard - requireAuth:', requireAuth);

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        console.log('AuthGuard - redirecting to /auth');
        navigate('/auth');
      } else if (!requireAuth && user) {
        console.log('AuthGuard - redirecting to /');
        navigate('/');
      }
    }
  }, [user, loading, requireAuth, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
