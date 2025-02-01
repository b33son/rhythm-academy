import { Award, Music2, Star, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useModal } from '../contexts/ModalContext';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Instructor as InstructorType } from '../types';

export default function Instructor() {
  const { openModal } = useModal();
  const [instructors, setInstructors] = useState<InstructorType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchInstructors() {
      try {
        const { data, error } = await supabase
          .from('instructors')
          .select('*');

        if (error) {
          console.error('Error fetching instructors:', error);
          return;
        }

        if (data) {
          setInstructors(data);
        }
      } catch (err) {
        console.error('Failed to fetch instructors:', err);
      }
    }
    fetchInstructors();
  }, []);

  const nextInstructor = () => {
    setCurrentIndex((prev) => (prev + 1) % instructors.length);
  };

  const prevInstructor = () => {
    setCurrentIndex((prev) => (prev - 1 + instructors.length) % instructors.length);
  };

  if (!instructors.length) return null;

  const currentInstructor = instructors[currentIndex];

  return (
    <section id="instructor" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Meet Our Expert Instructors
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Learn from industry professionals with years of experience in DJing and music production.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Instructor Image */}
          <div className="relative group">
            <button 
              onClick={prevInstructor}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-gray-800 rounded-full p-2 shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-6 h-6 text-gray-300" />
            </button>
            <div className="aspect-square rounded-2xl overflow-hidden">
              <img 
                src={currentInstructor.image_url || "https://images.unsplash.com/photo-1559386484-97dfc0e15539?q=80&w=1974"}
                alt={`${currentInstructor.name} - Music Instructor`}
                className="w-full h-full object-cover"
              />
            </div>
            <button 
              onClick={nextInstructor}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-gray-800 rounded-full p-2 shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-6 h-6 text-gray-300" />
            </button>
            {/* Stats Overlay */}
            <div className="absolute -bottom-6 -right-6 bg-gray-800 rounded-2xl shadow-lg p-6 w-48 border border-gray-700">
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-400 mb-1">10+</div>
                <div className="text-gray-300 text-sm">Years Experience</div>
              </div>
            </div>
          </div>

          {/* Instructor Info */}
          <div>
            <h2 className="text-4xl font-bold text-white mb-6">
              {currentInstructor.name}
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              {currentInstructor.bio}
            </p>

            {/* Credentials */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="flex items-start">
                <Award className="w-8 h-8 text-indigo-400 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-white mb-1">Certified Trainer</h3>
                  <p className="text-gray-300">Ableton Certified Trainer</p>
                </div>
              </div>
              <div className="flex items-start">
                <Music2 className="w-8 h-8 text-indigo-400 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-white mb-1">Active Artist</h3>
                  <p className="text-gray-300">Regular club performances</p>
                </div>
              </div>
              <div className="flex items-start">
                <Star className="w-8 h-8 text-indigo-400 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-white mb-1">Industry Expert</h3>
                  <p className="text-gray-300">Released on major labels</p>
                </div>
              </div>
              <div className="flex items-start">
                <Users className="w-8 h-8 text-indigo-400 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-white mb-1">Experienced Teacher</h3>
                  <p className="text-gray-300">500+ students taught</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => openModal('dj', 'booking')}
              className="btn-primary"
            >
              Book with {currentInstructor.name}
            </button>
          </div>
        </div>
        
        {/* Instructor Navigation Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {instructors.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-indigo-400' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}