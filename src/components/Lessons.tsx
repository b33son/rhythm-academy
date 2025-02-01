import { Headphones, Music, Laptop, Layers, Clock, Users } from 'lucide-react';
import { useModal } from '../contexts/ModalContext';

export default function Lessons() {
  const { openModal } = useModal();

  return (
    <section id="lessons" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Professional Music Education
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Choose between DJ lessons and Music Production courses, tailored to your skill level and goals.
          </p>
        </div>

        {/* Course Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* DJ Lessons */}
          <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-700">
            <div className="aspect-video w-full relative">
              <img 
                src="https://images.unsplash.com/photo-1583906326458-5eb89bf0f911?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="DJ Equipment"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-indigo-900/30" />
            </div>
            <div className="p-8">
              <div className="flex items-center mb-4">
                <Headphones className="w-6 h-6 text-indigo-400 mr-2" />
                <h3 className="text-2xl font-bold text-white">DJ Lessons</h3>
              </div>
              <p className="text-gray-300 mb-6">
                Master the art of DJing with hands-on training on professional equipment. 
                Learn beatmatching, mixing techniques, harmonic mixing, and more.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-300">
                  <Music className="w-5 h-5 text-indigo-400 mr-3" />
                  <span>Professional DJ equipment training</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <Clock className="w-5 h-5 text-indigo-400 mr-3" />
                  <span>Flexible scheduling options</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <Users className="w-5 h-5 text-indigo-400 mr-3" />
                  <span>One-on-one personalized instruction</span>
                </li>
              </ul>
              <button 
                className="w-full"
                onClick={() => openModal('dj', 'details')}
              >
                <span className="btn-base text-base bg-accent text-black px-8 py-2 rounded-full hover:bg-white hover:text-accent">
                  Learn More About DJ Lessons
                </span>
              </button>
            </div>
          </div>

          {/* Music Production */}
          <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-700">
            <div className="aspect-video w-full relative">
              <img 
                src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070" 
                alt="Music Production Studio"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-indigo-900/30" />
            </div>
            <div className="p-8">
              <div className="flex items-center mb-4">
                <Laptop className="w-6 h-6 text-indigo-400 mr-2" />
                <h3 className="text-2xl font-bold text-white">Music Production</h3>
              </div>
              <p className="text-gray-300 mb-6">
                Learn music production in Ableton Live 11/12. From basic concepts to 
                advanced techniques, create professional-quality tracks from scratch.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-300">
                  <Layers className="w-5 h-5 text-indigo-400 mr-3" />
                  <span>Comprehensive Ableton Live training</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <Clock className="w-5 h-5 text-indigo-400 mr-3" />
                  <span>Project-based learning approach</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <Users className="w-5 h-5 text-indigo-400 mr-3" />
                  <span>Individual feedback and guidance</span>
                </li>
              </ul>
              <button 
                className="w-full"
                onClick={() => openModal('production', 'details')}
              >
                <span className="btn-base text-base bg-accent text-black px-8 py-2 rounded-full hover:bg-white hover:text-accent">
                  Explore Music Production
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}