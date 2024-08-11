import { Button } from '@/components/ui/button';
import Link from 'next/link';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-900">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold mb-4">
          Welcome to Our Service
        </h1>
        <p className="text-base md:text-lg font-light">
          Discover our features and join us today.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <Link href="/sign-in">
          <Button className="bg-gray-800 text-white hover:bg-gray-700 transition-colors">
            Login
          </Button>
        </Link>

        <Link href="/sign-up">
          <Button className="bg-gray-300 text-gray-800 hover:bg-gray-200 transition-colors">
            Register
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
