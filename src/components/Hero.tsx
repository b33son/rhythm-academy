import { ArrowRight } from 'lucide-react';
import { useModal } from '../contexts/ModalContext';

export default function Hero() {
  const { openModal } = useModal();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1598653222000-6b7b7a552625?q=80&w=2070"
          alt="DJ Equipment"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gray-900/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Master the Art of Music
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Professional DJ and music production lessons tailored to your goals.
          Learn from industry experts and take your skills to the next level.
        </p>
        <button
          onClick={() => openModal('dj', 'details')}
          className="inline-flex items-center btn-primary text-lg"
        >
          Start Your Journey
          <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </section>
  );
}