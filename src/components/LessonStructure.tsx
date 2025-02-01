import React, { useState } from 'react';
import { GraduationCap, BarChart, Target, Zap, BookOpen, Star, Headphones, Laptop } from 'lucide-react';
import { useModal } from '../contexts/ModalContext';

interface LevelProps {
  title: string;
  description: string;
  skills: string[];
  icon: React.ReactNode;
  color: string;
}

function Level({ title, description, skills, icon, color }: LevelProps) {
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-700">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${color} mb-6`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-300 mb-4">{description}</p>
      <ul className="space-y-2">
        {skills.map((skill, index) => (
          <li key={index} className="flex items-center text-gray-300">
            <Star className="w-4 h-4 text-indigo-400 mr-2" />
            <span>{skill}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function LessonStructure() {
  const { openModal } = useModal();
  const [showCourseOptions, setShowCourseOptions] = useState(false);

  const djLevels = [
    {
      title: "Beginner DJ",
      description: "Master the fundamentals of DJing and build a strong foundation.",
      skills: [
        "Basic equipment operation",
        "Beatmatching fundamentals",
        "Music library organization",
        "Basic mixing techniques"
      ],
      icon: <BookOpen className="w-6 h-6 text-white" />,
      color: "bg-blue-500"
    },
    {
      title: "Intermediate DJ",
      description: "Develop advanced techniques and expand your mixing abilities.",
      skills: [
        "Advanced mixing techniques",
        "Harmonic mixing",
        "Effects and loops",
        "Live performance skills"
      ],
      icon: <BarChart className="w-6 h-6 text-white" />,
      color: "bg-indigo-500"
    },
    {
      title: "Advanced DJ",
      description: "Perfect your craft and develop your unique style.",
      skills: [
        "Advanced performance techniques",
        "Complex mixing patterns",
        "Creative track selection",
        "Professional workflow"
      ],
      icon: <Target className="w-6 h-6 text-white" />,
      color: "bg-purple-500"
    }
  ];

  const productionLevels = [
    {
      title: "Production Basics",
      description: "Learn the fundamentals of music production in Ableton Live.",
      skills: [
        "DAW navigation",
        "Basic music theory",
        "Sound design basics",
        "Arrangement fundamentals"
      ],
      icon: <BookOpen className="w-6 h-6 text-white" />,
      color: "bg-emerald-500"
    },
    {
      title: "Intermediate Producer",
      description: "Develop your production skills and creative techniques.",
      skills: [
        "Advanced sound design",
        "Mixing techniques",
        "Music theory application",
        "Workflow optimization"
      ],
      icon: <Zap className="w-6 h-6 text-white" />,
      color: "bg-teal-500"
    },
    {
      title: "Advanced Producer",
      description: "Master professional production techniques and finalize tracks.",
      skills: [
        "Professional mixing",
        "Advanced arrangements",
        "Sound design mastery",
        "Release preparation"
      ],
      icon: <GraduationCap className="w-6 h-6 text-white" />,
      color: "bg-cyan-500"
    }
  ];

  return (
    <section id="structure" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Your Learning Journey
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Structured learning paths designed to take you from beginner to professional,
            with clear progression and achievable milestones.
          </p>
        </div>

        {/* DJ Path */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            DJ Learning Path
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {djLevels.map((level, index) => (
              <Level key={index} {...level} />
            ))}
          </div>
        </div>

        {/* Production Path */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Music Production Path
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {productionLevels.map((level, index) => (
              <Level key={index} {...level} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="relative inline-block">
            <button
              onClick={() => setShowCourseOptions(!showCourseOptions)}
              onBlur={() => setTimeout(() => setShowCourseOptions(false), 200)}
              className="btn-primary"
            >
              Start Your Journey
              <GraduationCap className="ml-2 w-5 h-5" />
            </button>
            {showCourseOptions && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 rounded-lg shadow-lg bg-gray-900 ring-1 ring-gray-700 ring-opacity-5 z-10">
                <div className="py-1">
                  <button
                    className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center"
                    onClick={() => {
                      openModal('dj', 'booking');
                      setShowCourseOptions(false);
                    }}
                  >
                    <Headphones className="w-5 h-5 mr-2 text-primary" />
                    DJ Lessons
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center"
                    onClick={() => {
                      openModal('production', 'booking');
                      setShowCourseOptions(false);
                    }}
                  >
                    <Laptop className="w-5 h-5 mr-2 text-primary" />
                    Music Production
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}