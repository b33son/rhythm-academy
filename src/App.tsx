import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Lessons from './components/Lessons';
import Instructor from './components/Instructor';
import Pricing from './components/Pricing';
import LessonStructure from './components/LessonStructure';
import BookingModal from './components/BookingModal';
import AuthModal from './components/AuthModal';
import CourseModal from './components/CourseModal';
import UserDashboard from './components/UserDashboard';
import { ModalProvider, useModal } from './contexts/ModalContext';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';

function MainContent() {
  const { isOpen, modalType, closeModal } = useModal();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <Header onShowAuth={() => {
        console.log('Opening auth modal');
        setShowAuthModal(true);
      }} />
      {user ? (
        <UserDashboard />
      ) : (
        <>
          <Hero />
          <Lessons />
          <LessonStructure />
          <Pricing />
          <Instructor />
        </>
      )}
      <CourseModal />
      {/* Always render AuthModal but control visibility with isOpen prop */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
      <BookingModal
        isOpen={isOpen}
        onClose={closeModal}
        lessonType={modalType || 'dj'}
      />
    </div>
  );
};

function App() {
  return (
    <ModalProvider>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </ModalProvider>
  );
}

export default App;
