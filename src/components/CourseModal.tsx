import { useState } from 'react';
import { X, Clock, DollarSign, Calendar, Users, Headphones, Laptop } from 'lucide-react';
import { useModal } from '../contexts/ModalContext';

export default function CourseModal() {
  const { isOpen, lessonType, modalType, closeModal, openModal } = useModal();

  if (!isOpen || modalType !== 'details') return null;

  const djContent = {
    title: "DJ Lessons",
    description: "Master the art of DJing with our comprehensive course structure. From basic beatmatching to advanced performance techniques, develop your skills with professional equipment and personalized instruction.",
    icon: <Headphones className="w-8 h-8 text-indigo-600" />,
    details: [
      {
        title: "Course Duration",
        description: "Flexible scheduling with 1-hour, 2-hour, or custom length sessions",
        icon: <Clock className="w-6 h-6 text-indigo-600" />
      },
      {
        title: "Pricing",
        description: "Starting at $80/hour with package discounts available",
        icon: <DollarSign className="w-6 h-6 text-indigo-600" />
      },
      {
        title: "Schedule",
        description: "Available weekdays and weekends, morning to evening",
        icon: <Calendar className="w-6 h-6 text-indigo-600" />
      },
      {
        title: "Class Size",
        description: "One-on-one instruction for personalized learning",
        icon: <Users className="w-6 h-6 text-indigo-600" />
      }
    ],
    equipment: [
      "Pioneer DJ CDJ-3000s",
      "Pioneer DJ DJM-900NXS2 mixer",
      "Industry-standard monitoring system",
      "Professional recording capabilities"
    ]
  };

  const productionContent = {
    title: "Music Production",
    description: "Learn professional music production in Ableton Live. From basic concepts to advanced techniques, create professional-quality tracks with expert guidance and hands-on practice.",
    icon: <Laptop className="w-8 h-8 text-indigo-600" />,
    details: [
      {
        title: "Course Duration",
        description: "Structured sessions from 1-2 hours per lesson",
        icon: <Clock className="w-6 h-6 text-indigo-600" />
      },
      {
        title: "Pricing",
        description: "Starting at $85/hour with package discounts available",
        icon: <DollarSign className="w-6 h-6 text-indigo-600" />
      },
      {
        title: "Schedule",
        description: "Flexible scheduling to fit your availability",
        icon: <Calendar className="w-6 h-6 text-indigo-600" />
      },
      {
        title: "Class Size",
        description: "Individual instruction for maximum learning",
        icon: <Users className="w-6 h-6 text-indigo-600" />
      }
    ],
    equipment: [
      "Ableton Live 11/12 Suite",
      "Professional plugins and software",
      "High-end studio monitors",
      "MIDI controllers and synthesizers"
    ]
  };

  const content = lessonType === 'dj' ? djContent : productionContent;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeModal}></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={closeModal}
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="flex items-center mb-6">
                  {content.icon}
                  <h3 className="text-2xl font-bold text-gray-900 ml-3" id="modal-title">
                    {content.title}
                  </h3>
                </div>
                
                <p className="text-gray-600 mb-8">
                  {content.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {content.details.map((detail, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0">
                        {detail.icon}
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {detail.title}
                        </h4>
                        <p className="text-gray-600">
                          {detail.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Equipment & Resources
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {content.equipment.map((item, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
              onClick={() => {
                closeModal();
                openModal(lessonType, 'booking');
              }}
            >
              Book Now
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}