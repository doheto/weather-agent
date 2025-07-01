import { UserProfile } from '../components/auth/UserProfile';

export function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Weather Agent</h1>
            </div>
            <div className="flex items-center">
              <UserProfile />
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Weather Agent</h2>
            <p className="text-gray-700">
              Your authentication is working! Next steps:
            </p>
            <ul className="mt-4 list-disc list-inside text-gray-600">
              <li>Connect your Google Calendar</li>
              <li>View weather insights for your events</li>
              <li>Get weather-based recommendations</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
} 