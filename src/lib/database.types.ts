export interface Database {
  public: {
    Tables: {
      instructors: {
        Row: {
          id: string;
          name: string;
          email: string;
          bio: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          bio?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          bio?: string | null;
          created_at?: string;
        };
      };
      availability: {
        Row: {
          id: string;
          instructor_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_available: boolean;
        };
        Insert: {
          id?: string;
          instructor_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_available?: boolean;
        };
        Update: {
          id?: string;
          instructor_id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          is_available?: boolean;
        };
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          instructor_id: string;
          lesson_type: 'dj' | 'production';
          start_time: string;
          duration: number;
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          total_price: number;
          promo_code: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          instructor_id: string;
          lesson_type: 'dj' | 'production';
          start_time: string;
          duration: number;
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          total_price: number;
          promo_code?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          instructor_id?: string;
          lesson_type?: 'dj' | 'production';
          start_time?: string;
          duration?: number;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          total_price?: number;
          promo_code?: string | null;
          created_at?: string;
        };
      };
      promo_codes: {
        Row: {
          code: string;
          discount_percentage: number;
          valid_from: string;
          valid_until: string;
          max_uses: number | null;
          times_used: number;
        };
        Insert: {
          code: string;
          discount_percentage: number;
          valid_from: string;
          valid_until: string;
          max_uses?: number | null;
          times_used?: number;
        };
        Update: {
          code?: string;
          discount_percentage?: number;
          valid_from?: string;
          valid_until?: string;
          max_uses?: number | null;
          times_used?: number;
        };
      };
    };
    Functions: {
      check_booking_availability: {
        Args: {
          p_instructor_id: string;
          p_start_time: string;
          p_duration: number;
        };
        Returns: boolean;
      };
      increment_promo_code_usage: {
        Args: {
          p_code: string;
        };
        Returns: void;
      };
    };
  };
}