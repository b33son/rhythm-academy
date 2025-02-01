import { Music2, Menu, X, LogIn, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useModal } from '../contexts/ModalContext';
import { Headphones, Laptop } from 'lucide-react';
import type { ModalType } from '../contexts/ModalContext';
import { useAuth } from '../contexts/AuthContext';
import UserMenu from './UserMenu';

interface HeaderProps {
  onShowAuth: () => void;
}

export default function Header({ onShowAuth }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBookingOptions, setShowBookingOptions] = useState(false);
  const { openModal } = useModal();
  const { user, signOut } = useAuth();

  const handleBookLesson = (courseType: 'dj' | 'production', modalType: ModalType = 'booking') => {
    openModal(courseType, modalType);
    setShowBookingOptions(false);
  };

  const handleSignIn = () => {
    onShowAuth();
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/70 backdrop-blur-xl border-b border-gray-800/50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Music2 className="w-8 h-8 text-primary" />
            <span className="text-[1.5rem] text-accent uppercase font-alfa" style={{ lineHeight: '1.1' }}>Rhythm Academy</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!user && (
              <>
                <a href="#lessons" className="text-indigo-400 hover:text-white transition-colors">
                  Lessons
                </a>
                <a href="#instructor" className="text-indigo-400 hover:text-white transition-colors">
                  Instructor
                </a>
                <a href="#pricing" className="text-indigo-400 hover:text-white transition-colors">
                  Pricing
                </a>
              </>
            )}
            <div className="flex items-center space-x-4">
              <div className="relative">
                {!user && (
                  <button 
                    className="btn-primary"
                    onClick={() => handleBookLesson('dj', 'booking')}
                    onBlur={() => setTimeout(() => setShowBookingOptions(false), 200)}
                  >
                    Let's Start
                  </button>
                )}
              </div>
              {user ? (
                <UserMenu />
              ) : (
                <button
                  onClick={handleSignIn}
                  className="flex items-center text-indigo-400 hover:text-white transition-colors"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-400 hover:text-indigo-400"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2">
            <div className="flex flex-col space-y-4">
              {!user && (
                <>
                  <a 
                    href="#lessons" 
                    className="text-indigo-400 hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Lessons
                  </a>
                  <a 
                    href="#instructor" 
                    className="text-indigo-400 hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Instructor
                  </a>
                  <a 
                    href="#pricing" 
                    className="text-indigo-400 hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Pricing
                  </a>
                </>
              )}
              {user ? (
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-400 hover:text-indigo-400 transition-colors flex items-center"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="text-indigo-400 hover:text-white transition-colors flex items-center"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </button>
              )}
              {!user && (
                <button
                  className="btn-primary"
                  onClick={() => {
                    handleBookLesson('dj', 'booking');
                    setIsMenuOpen(false);
                  }}
                >
                  Book Now
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}