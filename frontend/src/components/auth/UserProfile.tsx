import { useSession, signOut } from '../../lib/auth-client';

export function UserProfile() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session?.user) return null;

  const user = session.user;

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = '/';
        }
      }
    });
  };

  return (
    <div className="flex items-center gap-4">
      <img
        src={user.image || '/default-avatar.png'}
        alt={user.name}
        className="w-10 h-10 rounded-full"
      />
      <div>
        <p className="font-medium">{user.name}</p>
        <p className="text-sm text-gray-600">{user.email}</p>
      </div>
      <button
        onClick={handleSignOut}
        className="text-sm text-red-600 hover:text-red-700"
      >
        Sign out
      </button>
    </div>
  );
} 