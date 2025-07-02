import { useSession } from '../../lib/auth-client';

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export function UserProfile() {
  const { user, isAuthenticated, loading, signOut } = useSession();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const typedUser = user as User;

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className="flex items-center gap-4">
      <img 
        src={typedUser.picture} 
        alt={typedUser.name} 
        className="w-8 h-8 rounded-full"
      />
      <span>{typedUser.name}</span>
      <button 
        onClick={handleSignOut}
        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
      >
        Sign Out
      </button>
    </div>
  );
} 