import { Navigate } from 'react-router-dom';
import { useSession } from '../lib/auth-client';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!session?.user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
} 