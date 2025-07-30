import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div
      className="relative flex min-h-screen flex-col bg-[#10231c] overflow-x-hidden"
      style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
    >
      <div className="flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-[#214a3c] px-10 py-3 text-white">
          <div className="flex items-center gap-4">
            <div className="size-4">
              {/* Logo */}
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.8261 30.5736C16.7203..." fill="currentColor"></path>
                <path d="M39.998 35.764C39.9944..." fill="currentColor"></path>
              </svg>
            </div>
            <h2 className="text-lg font-bold tracking-tight">CampusVoice</h2>
          </div>
        </header>

        {/* Main Section */}
        <div className="px-40 flex flex-1 justify-center py-8">
          <div className="flex flex-col max-w-[960px] w-full items-center">
            <div className="w-full">
              <div
                className="flex min-h-[480px] flex-col items-center justify-center gap-6 bg-cover bg-center bg-no-repeat rounded-lg p-4 text-white text-center"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.4)), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBmzuPPC40Sg1046S-lvbbACAqAnGx39zqInbC-kqEiwRooQ-SWppjX1Ye5iUr8B7CglPRl7SM1CseoS85PTGow43zXKkGFlMFMSBXy0L9CFSZ4-kr4CwQmoxZYzPr4f_LYnc_VW9O_np1Gl6osqcNkvrmEjXLq5iIKkGQAV9TUAtdv_U1DHPxcC9fxYK4r1d_9YdqO0U18xW8sUccEljCMAvBxJ1ToAaR7CJAID3w9M1lkJm-kFoh4lNunsoUdugRqAjTbij5gZpc")'
                }}
              >
                <h1 className="text-4xl font-black leading-tight tracking-tight">
                  Moments of Change Start Here
                </h1>
                <h2 className="text-base font-normal leading-normal max-w-[600px]">
                  Your voice shapes our campus. Share your feedback and help us create a better environment for everyone.
                </h2>

                {/* Centered Get Started Button */}
                <Link to="/login">
                  <button className="mt-4 h-12 px-6 bg-[#019863] hover:bg-[#017a4f] text-white font-bold text-base rounded-lg transition-colors">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
