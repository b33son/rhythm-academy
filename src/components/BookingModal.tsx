import React, { useState, useEffect } from 'react';
import { format, addMinutes } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { Clock, DollarSign, Calendar as CalendarIcon, X, Users, CheckCircle2 } from 'lucide-react';
import { useModal } from '../contexts/ModalContext';
import 'react-day-picker/dist/style.css';
import { TimeBlock, Instructor } from '../types';
import { getInstructorAvailability, createBooking } from '../lib/api';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonType: 'dj' | 'production';
}

const timeBlocks: TimeBlock[] = [
  { hours: 1, price: 100 },
  { hours: 2, price: 180, discount: 10 },
  { hours: 5, price: 425, discount: 15 },
  { hours: 10, price: 800, discount: 20 },
];

const availableTimeSlots = [
  '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export default function BookingModal({ isOpen, onClose, lessonType }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock>();
  const [promoCode, setPromoCode] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { modalType, lessonType: contextLessonType } = useModal();
  const { user } = useAuth();
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<{
    date: Date;
    instructor: Instructor;
    duration: number;
    price: number;
    lessonType: 'dj' | 'production';
  } | null>(null);

  useEffect(() => {
    setError(null);
    async function fetchInstructors() {
      const { data, error } = await supabase
        .from('instructors')
        .select();
      
      if (error) {
        console.error('Error fetching instructors:', error);
        setError('No instructors available. Please try again later.');
        return;
      }

      if (!data || data.length === 0) {
        setError('No instructors available. Please try again later.');
        return;
      }

      setInstructors(data);
    }

    fetchInstructors();
  }, []);

  useEffect(() => {
    async function fetchAvailability() {
      if (selectedDate && instructor?.id) {
        setAvailableSlots([]); // Clear slots while loading
        const availability = await getInstructorAvailability(instructor.id, selectedDate);
        if (availability) {
          setAvailableSlots(availability.availableSlots);
        } else {
          setAvailableSlots([]);
        }
      }
      setSelectedTime(undefined); // Reset selected time when date changes
    }

    fetchAvailability();
  }, [selectedDate, instructor]);

  if (!isOpen || modalType !== 'booking') return null;

  if (bookingConfirmed && bookingDetails) {
    const endTime = addMinutes(bookingDetails.date, bookingDetails.duration * 60);
    
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="booking-confirmation" role="dialog" aria-modal="true">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Booking Confirmed!
                </h3>
                <p className="text-gray-600 mb-6">
                  Your lesson has been successfully booked. Here are your booking details:
                </p>
                
                <div className="bg-gray-50 rounded-lg p-6 text-left mb-6">
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Instructor</dt>
                      <dd className="text-base text-gray-900">{bookingDetails.instructor.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Date & Time</dt>
                      <dd className="text-base text-gray-900">
                        {format(bookingDetails.date, 'EEEE, MMMM d, yyyy')}
                        <br />
                        {format(bookingDetails.date, 'h:mm a')} - {format(endTime, 'h:mm a')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Duration</dt>
                      <dd className="text-base text-gray-900">
                        {bookingDetails.duration} {bookingDetails.duration === 1 ? 'hour' : 'hours'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Total Price</dt>
                      <dd className="text-base text-gray-900">${bookingDetails.price}</dd>
                    </div>
                  </dl>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  A confirmation email has been sent to your registered email address.
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex justify-center btn-primary text-base sm:text-sm sm:ml-3"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedBlock || !instructor?.id) {
      setError('Please select all required booking details');
      return;
    }

    setIsLoading(true);
    setError(null);

    if (!user) {
      setShowAuthModal(true);
      setIsLoading(false);
      return;
    }

    try {
      // Create a new date object combining the selected date and time
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const bookingDate = new Date(selectedDate);
      bookingDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      // Ensure we're working with the correct timezone
      const tzOffset = bookingDate.getTimezoneOffset() * 60000; // offset in milliseconds
      const adjustedDate = new Date(bookingDate.getTime() - tzOffset);

      await createBooking(
        user.id,
        instructor.id,
        contextLessonType,
        adjustedDate,
        selectedBlock,
        promoCode || undefined
      );

      setBookingDetails({
        date: bookingDate,
        instructor: instructor,
        duration: selectedBlock.hours,
        price: selectedBlock.price,
        lessonType: contextLessonType
      });
      setBookingConfirmed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const disabledDays = [
    { from: new Date(0), to: new Date() }, // Past dates
    { daysOfWeek: [0] }, // Sundays
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="booking-modal" role="dialog" aria-modal="true">
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          handleBooking();
        }}
      />
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Book Your {contextLessonType === 'dj' ? 'DJ' : 'Production'} Lesson
              </h3>
              <p className="text-gray-600">
                Select your preferred date, time, and lesson duration.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Calendar */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-indigo-600" />
                  Select Date
                </h4>
                <div className="border rounded-lg p-4 bg-white">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={disabledDays}
                    modifiers={{
                      available: (date) => {
                        const day = date.getDay();
                        return day !== 0; // Not Sunday
                      }
                    }}
                    modifiersStyles={{
                      selected: {
                        backgroundColor: '#4f46e5',
                        color: 'white'
                      }
                    }}
                  />
                </div>
              </div>

              {/* Time and Duration */}
              <div>
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-indigo-600" />
                    Select Instructor
                  </h4>
                  <div className="grid grid-cols-1 gap-2 mb-6">
                    {instructors.map((inst) => (
                      <button
                        key={inst.id}
                        onClick={() => setInstructor(inst)}
                        className={`p-4 rounded-lg border text-left ${
                          instructor?.id === inst.id
                            ? 'bg-indigo-50 border-indigo-600'
                            : 'border-gray-300 hover:border-indigo-600'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{inst.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{inst.bio}</div>
                      </button>
                    ))}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                    {selectedDate && instructor ? (
                      <span>Select Time with {instructor.name}</span>
                    ) : (
                      'Select Time'
                    )}
                    {selectedDate && instructor && availableSlots.length === 0 && (
                      <span className="ml-2 text-sm text-red-600">
                        No available slots for this date
                      </span>
                    )}
                  </h4>
                  {selectedDate && instructor ? (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-2 rounded-lg border text-sm ${
                            selectedTime === time
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'border-gray-300 text-gray-700 hover:border-indigo-600'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      {selectedDate ? 'Select instructor to see available time slots' : 'Please select a date first'}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-indigo-600" />
                    Select Package
                  </h4>
                  <div className="space-y-3">
                    {timeBlocks.map((block) => (
                      <button
                        key={block.hours}
                        onClick={() => setSelectedBlock(block)}
                        className={`w-full p-4 rounded-lg border text-left ${
                          selectedBlock?.hours === block.hours
                            ? 'bg-indigo-50 border-indigo-600'
                            : 'border-gray-300 hover:border-indigo-600'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">
                            {block.hours} {block.hours === 1 ? 'Hour' : 'Hours'}
                          </span>
                          <span className="text-gray-900">
                            ${block.price}
                            {block.discount && (
                              <span className="ml-2 text-sm text-green-600">
                                Save {block.discount}%
                              </span>
                            )}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Promo Code */}
            <div className="mt-6">
              <label htmlFor="promo" className="block text-sm font-medium text-gray-700 mb-1">
                Promo Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="promo"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 rounded-lg border-gray-400 shadow-sm focus:border-indigo-600 focus:ring-indigo-600"
                  placeholder="Enter promo code"
                />
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Apply
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full sm:w-auto inline-flex justify-center btn-primary text-base sm:text-sm sm:ml-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
              onClick={handleBooking}
              disabled={!selectedDate || !selectedTime || !selectedBlock || isLoading}
            >
              {isLoading ? 'Booking...' : 'Confirm Booking'}
            </button>
            <button
              type="button"
              className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center btn-secondary text-base sm:text-sm sm:ml-3"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}