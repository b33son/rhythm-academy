import { Check, DollarSign, Clock, Star } from 'lucide-react';
import { useModal } from '../contexts/ModalContext';
import type { TimeBlock } from '../types';

const timeBlocks: TimeBlock[] = [
  { hours: 1, price: 100 },
  { hours: 2, price: 180, discount: 10 },
  { hours: 5, price: 425, discount: 15 },
  { hours: 10, price: 800, discount: 20 },
];

const features = [
  'Professional equipment',
  'One-on-one instruction',
  'Flexible scheduling',
  'Progress tracking',
  'Practice materials',
  'Recording sessions'
];

export default function Pricing() {
  const { openModal } = useModal();

  return (
    <section id="pricing" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Choose the package that best fits your learning goals. All packages include
            the same premium features and personalized instruction.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {timeBlocks.map((block) => (
            <div
              key={block.hours}
              className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-700 hover:border-indigo-400 transition-colors"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Clock className="w-6 h-6 text-indigo-400 mr-2" />
                    <h3 className="text-xl font-bold text-white">
                      {block.hours} {block.hours === 1 ? 'Hour' : 'Hours'}
                    </h3>
                  </div>
                  {block.discount && (
                    <span className="bg-green-900 text-green-300 text-sm font-medium px-2.5 py-0.5 rounded">
                      Save {block.discount}%
                    </span>
                  )}
                </div>

                <div className="flex items-baseline mb-8">
                  <DollarSign className="w-6 h-6 text-gray-300" />
                  <span className="text-4xl font-bold text-white">{block.price}</span>
                  <span className="text-gray-300 ml-1">total</span>
                </div>

                <div className="space-y-4 mb-8">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-indigo-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => openModal('dj', 'booking')}
                  className={`w-full btn-base text-base px-8 py-3 rounded-full ${
                    block.hours === 1 ? 'bg-primary text-black hover:bg-white hover:text-primary'
                    : block.hours === 2
                      ? 'btn-purple'
                      : block.hours <= 5
                      ? 'btn-orange'
                      : 'btn-accent'
                  }`}
                >
                  Get Started
                </button>
              </div>

              {block.hours >= 5 && (
                <div className="bg-indigo-900/50 p-4">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-indigo-400 mr-2" />
                    <span className="text-sm text-indigo-300 font-medium">
                      Most popular for serious students
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-300 mb-4">
            Need a custom package? Contact us for personalized options.
          </p>
          <button 
            onClick={() => openModal('dj', 'details')}
            className="inline-flex items-center text-indigo-400 font-medium hover:text-indigo-300"
          >
            Contact for Custom Packages
            <Star className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </section>
  );
}