// Database types for Voyara
// Auto-generated from Supabase schema

export interface Database {
  public: {
    Tables: {
      destinations: {
        Row: {
          id: string;
          name: string;
          country: string;
          description: string | null;
          image: string | null;
          rating: number | null;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          country: string;
          description?: string | null;
          image?: string | null;
          rating?: number | null;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          country?: string;
          description?: string | null;
          image?: string | null;
          rating?: number | null;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          language: string;
          preferences: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          language?: string;
          preferences?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          language?: string;
          preferences?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };
      trips: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          start_date: string;
          end_date: string;
          cover_photo: string | null;
          status: 'planning' | 'ongoing' | 'completed' | 'cancelled';
          budget: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          start_date: string;
          end_date: string;
          cover_photo?: string | null;
          status?: 'planning' | 'ongoing' | 'completed' | 'cancelled';
          budget?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          start_date?: string;
          end_date?: string;
          cover_photo?: string | null;
          status?: 'planning' | 'ongoing' | 'completed' | 'cancelled';
          budget?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      trip_destinations: {
        Row: {
          id: string;
          trip_id: string;
          destination_id: string;
          order_index: number;
          notes: string | null;
          arrival_date: string | null;
          departure_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          destination_id: string;
          order_index?: number;
          notes?: string | null;
          arrival_date?: string | null;
          departure_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          destination_id?: string;
          order_index?: number;
          notes?: string | null;
          arrival_date?: string | null;
          departure_date?: string | null;
          created_at?: string;
        };
      };
      saved_destinations: {
        Row: {
          id: string;
          user_id: string;
          destination_id: string;
          notes: string | null;
          saved_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          destination_id: string;
          notes?: string | null;
          saved_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          destination_id?: string;
          notes?: string | null;
          saved_at?: string;
        };
      };
    };
  };
}
