import { supabase } from './supabase';
import { TimeBlock } from '../types';

export async function getAvailableInstructors(date: Date): Promise<Instructor[]> {
  const { data: instructors, error } = await supabase
    .from('instructors')
    .select('*');

  if (error) {
    console.error('Error fetching instructors:', error);
    return [];
  }

  // Filter instructors based on availability for the selected date
  const availableInstructors = await Promise.all(
    instructors.map(async (instructor) => {
      const availability = await getInstructorAvailability(instructor.id, date);
      return availability && availability.availableSlots.length > 0 ? instructor : null;
    })
  );

  return availableInstructors.filter((instructor): instructor is Instructor => instructor !== null);
}

export interface Availability {
  date: Date;
  availableSlots: string[];
}

export async function getInstructorAvailability(
  instructorId: string,
  date: Date
): Promise<Availability | null> {
  const { data: availabilityData, error: availabilityError } = await supabase
    .from('availability')
    .select('*')
    .eq('instructor_id', instructorId);

  if (availabilityError || !availabilityData) {
    console.error('Error fetching availability:', availabilityError);
    return null;
  }

  // Find availability for the selected day
  const dayAvailability = availabilityData.find(
    (a) => a.day_of_week === date.getDay() && a.is_available
  );

  if (!dayAvailability) {
    console.log('No availability found for this day');
    return null;
  }

  // Get existing bookings for the date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('start_time, duration')
    .gte('start_time', startOfDay.toISOString())
    .lte('start_time', endOfDay.toISOString())
    .eq('instructor_id', instructorId)
    .neq('status', 'cancelled');

  if (bookingsError) {
    console.error('Error fetching bookings:', bookingsError);
    return null;
  }

  // Generate available time slots
  const slots: string[] = [];
  const startTime = new Date(date);
  const [startHour, startMinute] = dayAvailability.start_time.split(':');
  startTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
  // Ensure we're working with the correct date
  startTime.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());

  const endTime = new Date(date);
  const [endHour, endMinute] = dayAvailability.end_time.split(':');
  endTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);
  // Ensure we're working with the correct date
  endTime.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());

  while (startTime < endTime) {
    const timeString = startTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const isSlotAvailable = !bookings?.some(booking => {
      const bookingStart = new Date(booking.start_time);
      const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60000);
      
      // Convert all times to minutes since midnight for easier comparison
      const slotMinutes = startTime.getHours() * 60 + startTime.getMinutes();
      const bookingStartMinutes = bookingStart.getHours() * 60 + bookingStart.getMinutes();
      const bookingEndMinutes = bookingEnd.getHours() * 60 + bookingEnd.getMinutes();
      
      return slotMinutes >= bookingStartMinutes && slotMinutes < bookingEndMinutes;
    });

    if (isSlotAvailable) {
      slots.push(timeString);
    }

    // Increment by one hour
    startTime.setTime(startTime.getTime() + 60 * 60 * 1000);
  }

  // Sort slots chronologically
  slots.sort((a, b) => {
    const [aHour, aMinute] = a.split(':').map(Number);
    const [bHour, bMinute] = b.split(':').map(Number);
    return aHour * 60 + aMinute - (bHour * 60 + bMinute);
  });

  return {
    date,
    availableSlots: slots,
  };
}

export async function createBooking(
  userId: string,
  instructorId: string,
  lessonType: 'dj' | 'production',
  startTime: Date,
  timeBlock: TimeBlock,
  promoCode?: string
) {
  // Normalize lesson type to lowercase
  const normalizedLessonType = lessonType.toLowerCase() as 'dj' | 'production';

  // Validate lesson type
  if (normalizedLessonType !== 'dj' && normalizedLessonType !== 'production') {
    throw new Error('Invalid lesson type. Must be either "dj" or "production"');
  }

  // Format the start time to ensure timezone consistency
  const formattedStartTime = new Date(startTime).toISOString();

  // Validate booking availability
  const { data: isAvailable, error: availabilityError } = await supabase
    .rpc('check_booking_availability', {
      p_instructor_id: instructorId,
      p_start_time: formattedStartTime,
      p_duration: timeBlock.hours * 60,
    });

  if (availabilityError) {
    console.error('Availability check error:', availabilityError);
    throw new Error('Error checking availability. Please try again.');
  }

  if (isAvailable === false) {
    throw new Error('This time slot is no longer available. Please select another time.');
  }

  // Apply promo code if provided
  let finalPrice = timeBlock.price;
  if (promoCode) {
    const { data: promoData, error: promoError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', promoCode)
      .single();

    if (promoError) {
      throw new Error('Invalid promo code');
    }

    if (promoData) {
      const now = new Date();
      if (
        now >= new Date(promoData.valid_from) &&
        now <= new Date(promoData.valid_until) &&
        (!promoData.max_uses || promoData.times_used < promoData.max_uses)
      ) {
        finalPrice = timeBlock.price * (1 - promoData.discount_percentage / 100);
      }
    }
  }

  // Create booking
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      user_id: userId,
      instructor_id: instructorId,
      lesson_type: normalizedLessonType,
      start_time: formattedStartTime,
      duration: timeBlock.hours * 60,
      status: 'pending',
      total_price: finalPrice,
      promo_code: promoCode,
    })
    .select()
    .single();

  if (bookingError) {
    console.error('Booking error:', bookingError);
    throw new Error('Failed to create booking');
  }

  // Update promo code usage if applicable
  if (promoCode) {
    await supabase.rpc('increment_promo_code_usage', { p_code: promoCode });
  }

  return booking;
}