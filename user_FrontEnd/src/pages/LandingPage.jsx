import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function LandingPage() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <div
      className="relative flex min-h-screen flex-col bg-[#10231c] overflow-x-hidden"
      style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
    >
      <div className="flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-[#214a3c] px-4 sm:px-6 md:px-10 py-3 text-white">
          <div className="flex items-center gap-4">
            <h2 className="text-base sm:text-lg font-bold tracking-tight">
              CampusVoice
            </h2>
          </div>
        </header>

        {/* Main Section */}
        <div className="px-4 sm:px-6 md:px-16 lg:px-40 flex flex-1 justify-center py-4 sm:py-6 md:py-8">
          <div className="flex flex-col max-w-[960px] w-full items-center">
            <div className="w-full">
              <div
                className="flex min-h-[300px] sm:min-h-[400px] md:min-h-[480px] flex-col items-center justify-center gap-4 sm:gap-6 bg-cover bg-center bg-no-repeat rounded-lg p-4 sm:p-6 md:p-8 text-white text-center"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.4)), url("/Landing.png")',
                }}
              >
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight px-2">
                  {isAuthenticated && user
                    ? "Welcome back!"
                    : "Moments of Change Start Here"}
                </h1>
                <h2 className="text-sm sm:text-base font-normal leading-normal max-w-[600px] px-4">
                  {isAuthenticated && user
                    ? `Welcome back, ${user.name}! Ready to make a difference?`
                    : "Your voice shapes our campus. Share your feedback and help us create a better environment for everyone."}
                </h2>

                {/* Conditional Button */}
                {isAuthenticated && user ? (
                  <Link to="/dashboard">
                    <button className="mt-4 h-10 sm:h-12 px-4 sm:px-6 bg-[#019863] hover:bg-[#017a4f] text-white font-bold text-sm sm:text-base rounded-lg transition-colors">
                      Go to Dashboard
                    </button>
                  </Link>
                ) : (
                  <Link to="/login">
                    <button className="mt-4 h-10 sm:h-12 px-4 sm:px-6 bg-[#019863] hover:bg-[#017a4f] text-white font-bold text-sm sm:text-base rounded-lg transition-colors">
                      Get Started
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
