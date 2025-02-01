import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, Music2, Laptop, Plus, RefreshCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useModal } from '../contexts/ModalContext';
import type { Database } from '../lib/database.types';

type Booking = Database['public']['Tables']['bookings']['Row'] & {
  instructors: {
    name: string;
    email: string;
    bio: string | null;
  };
};

export default function UserDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { openModal } = useModal();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          instructors (
            name,
            email,
            bio
          )
        `)
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      if (error) throw error;

      setBookings(data as Booking[]);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const now = new Date();
  const upcomingBookings = bookings.filter(
    booking => new Date(booking.start_time) >= now
  );
  const pastBookings = bookings.filter(
    booking => new Date(booking.start_time) < now
  );

  const displayBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">My Lessons</h1>
          <button
            onClick={() => openModal('dj', 'booking')}
            className="btn-primary flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Book New Lesson
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'upcoming'
                ? 'bg-primary text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Upcoming Lessons
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'past'
                ? 'bg-primary text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Past Lessons
          </button>
          <button
            onClick={fetchBookings}
            className="ml-auto text-gray-400 hover:text-white"
            title="Refresh bookings"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading your lessons...</p>
          </div>
        ) : displayBookings.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
            <div className="mb-4">
              {activeTab === 'upcoming' ? (
                <Calendar className="w-12 h-12 text-gray-400 mx-auto" />
              ) : (
                <Clock className="w-12 h-12 text-gray-400 mx-auto" />
              )}
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              {activeTab === 'upcoming'
                ? 'No upcoming lessons'
                : 'No past lessons'}
            </h3>
            {activeTab === 'upcoming' && (
              <p className="text-gray-400 mb-6">
                Book your first lesson to start your musical journey
              </p>
            )}
            {activeTab === 'upcoming' && (
              <button
                onClick={() => openModal('dj', 'booking')}
                className="btn-primary"
              >
                Book Your First Lesson
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {displayBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${
                      booking.lesson_type === 'dj' ? 'bg-purple-500/20' : 'bg-orange-500/20'
                    }`}>
                      {booking.lesson_type === 'dj' ? (
                        <Music2 className={`w-6 h-6 ${
                          booking.lesson_type === 'dj' ? 'text-purple-500' : 'text-orange-500'
                        }`} />
                      ) : (
                        <Laptop className={`w-6 h-6 ${
                          booking.lesson_type === 'dj' ? 'text-purple-500' : 'text-orange-500'
                        }`} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {booking.lesson_type === 'dj' ? 'DJ' : 'Production'} Lesson with {booking.instructors.name}
                      </h3>
                      <div className="mt-2 space-y-1">
                        <p className="text-gray-300 flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {format(new Date(booking.start_time), 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p className="text-gray-300 flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {format(new Date(booking.start_time), 'h:mm a')} - 
                          {format(
                            new Date(new Date(booking.start_time).getTime() + booking.duration * 60000),
                            'h:mm a'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium
                      ${booking.status === 'confirmed'
                        ? 'bg-green-500/20 text-green-500'
                        : booking.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-500'
                        : booking.status === 'completed'
                        ? 'bg-blue-500/20 text-blue-500'
                        : 'bg-red-500/20 text-red-500'
                      }"
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    <p className="text-gray-400 mt-2">
                      ${booking.total_price}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}