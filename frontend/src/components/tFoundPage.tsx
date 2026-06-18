// frontend/src/components/NotFoundPage.tsx
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-red-600">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mt-4">Page Not Found</h2>
        <p className="text-gray-500 mt-2">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="inline-block mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}