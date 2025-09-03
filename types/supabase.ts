export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_type: string
          description: string
          icon: string | null
          id: string
          metadata: Json | null
          points: number | null
          rarity: string | null
          title: string
          unlocked_at: string | null
          user_id: string | null
        }
        Insert: {
          achievement_type: string
          description: string
          icon?: string | null
          id?: string
          metadata?: Json | null
          points?: number | null
          rarity?: string | null
          title: string
          unlocked_at?: string | null
          user_id?: string | null
        }
        Update: {
          achievement_type?: string
          description?: string
          icon?: string | null
          id?: string
          metadata?: Json | null
          points?: number | null
          rarity?: string | null
          title?: string
          unlocked_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      activities: {
        Row: {
          activity_type: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          metadata: Json | null
          title: string
          user_id: string | null
        }
        Insert: {
          activity_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          title: string
          user_id?: string | null
        }
        Update: {
          activity_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      activity_comments: {
        Row: {
          activity_id: string | null
          content: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          activity_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          activity_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_comments_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_likes: {
        Row: {
          activity_id: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          activity_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          activity_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_likes_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_participants: {
        Row: {
          competition_id: string | null
          id: string
          joined_at: string | null
          ranking: number | null
          score: number | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          competition_id?: string | null
          id?: string
          joined_at?: string | null
          ranking?: number | null
          score?: number | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          competition_id?: string | null
          id?: string
          joined_at?: string | null
          ranking?: number | null
          score?: number | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_participants_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions: {
        Row: {
          created_at: string | null
          current_participants: number | null
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          max_participants: number | null
          name: string
          organizer_id: string | null
          prize: string | null
          rules: string | null
          start_date: string | null
          status: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          max_participants?: number | null
          name: string
          organizer_id?: string | null
          prize?: string | null
          rules?: string | null
          start_date?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          max_participants?: number | null
          name?: string
          organizer_id?: string | null
          prize?: string | null
          rules?: string | null
          start_date?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_challenges: {
        Row: {
          challenge_type: string | null
          created_at: string | null
          date: string | null
          description: string
          difficulty: string | null
          id: string
          is_active: boolean | null
          points: number | null
          requirements: Json | null
          title: string
        }
        Insert: {
          challenge_type?: string | null
          created_at?: string | null
          date?: string | null
          description: string
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          points?: number | null
          requirements?: Json | null
          title: string
        }
        Update: {
          challenge_type?: string | null
          created_at?: string | null
          date?: string | null
          description?: string
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          points?: number | null
          requirements?: Json | null
          title?: string
        }
        Relationships: []
      }
      flavor_wheels: {
        Row: {
          created_at: string | null
          group_id: string | null
          id: string
          item_id: string | null
          picture_url: string | null
          prose_excerpt: string | null
          review_id: string | null
          tasting_id: string | null
          updated_at: string | null
          user_id: string | null
          wheel_data: Json
          wheel_type: string | null
        }
        Insert: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          item_id?: string | null
          picture_url?: string | null
          prose_excerpt?: string | null
          review_id?: string | null
          tasting_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          wheel_data: Json
          wheel_type?: string | null
        }
        Update: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          item_id?: string | null
          picture_url?: string | null
          prose_excerpt?: string | null
          review_id?: string | null
          tasting_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          wheel_data?: Json
          wheel_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flavor_wheels_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "tasting_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flavor_wheels_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "user_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flavor_wheels_tasting_id_fkey"
            columns: ["tasting_id"]
            isOneToOne: false
            referencedRelation: "tastings"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          addressee_id: string | null
          created_at: string | null
          id: string
          requester_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          addressee_id?: string | null
          created_at?: string | null
          id?: string
          requester_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          addressee_id?: string | null
          created_at?: string | null
          id?: string
          requester_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mexican_beverages: {
        Row: {
          agave_variety: string | null
          alcohol_content: number | null
          availability: string | null
          certifications: string[] | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          nom_number: string | null
          price_range: string | null
          producer_id: string | null
          production_method: string | null
          region: string | null
          stock_quantity: number | null
          sustainability_score: number | null
          tasting_notes: Json | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          agave_variety?: string | null
          alcohol_content?: number | null
          availability?: string | null
          certifications?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          nom_number?: string | null
          price_range?: string | null
          producer_id?: string | null
          production_method?: string | null
          region?: string | null
          stock_quantity?: number | null
          sustainability_score?: number | null
          tasting_notes?: Json | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          agave_variety?: string | null
          alcohol_content?: number | null
          availability?: string | null
          certifications?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          nom_number?: string | null
          price_range?: string | null
          producer_id?: string | null
          production_method?: string | null
          region?: string | null
          stock_quantity?: number | null
          sustainability_score?: number | null
          tasting_notes?: Json | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mexican_beverages_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
        ]
      }
      producers: {
        Row: {
          agave_varieties: string[] | null
          brands: string[] | null
          certifications: string[] | null
          contact_info: Json | null
          created_at: string | null
          facility_info: Json | null
          founded_year: number | null
          id: string
          municipality: string | null
          name: string
          nom_number: string | null
          ownership_type: string | null
          region: string | null
          state: string | null
          sustainability_data: Json | null
          type: string[] | null
          updated_at: string | null
        }
        Insert: {
          agave_varieties?: string[] | null
          brands?: string[] | null
          certifications?: string[] | null
          contact_info?: Json | null
          created_at?: string | null
          facility_info?: Json | null
          founded_year?: number | null
          id?: string
          municipality?: string | null
          name: string
          nom_number?: string | null
          ownership_type?: string | null
          region?: string | null
          state?: string | null
          sustainability_data?: Json | null
          type?: string[] | null
          updated_at?: string | null
        }
        Update: {
          agave_varieties?: string[] | null
          brands?: string[] | null
          certifications?: string[] | null
          contact_info?: Json | null
          created_at?: string | null
          facility_info?: Json | null
          founded_year?: number | null
          id?: string
          municipality?: string | null
          name?: string
          nom_number?: string | null
          ownership_type?: string | null
          region?: string | null
          state?: string | null
          sustainability_data?: Json | null
          type?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string | null
          avatar_url: string | null
          beverage_preferences: string[] | null
          bio: string | null
          created_at: string | null
          email: string | null
          experience_level: string | null
          id: string
          language: string | null
          last_login: string | null
          location: string | null
          name: string | null
          preferences: Json | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          account_status?: string | null
          avatar_url?: string | null
          beverage_preferences?: string[] | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          experience_level?: string | null
          id: string
          language?: string | null
          last_login?: string | null
          location?: string | null
          name?: string | null
          preferences?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          account_status?: string | null
          avatar_url?: string | null
          beverage_preferences?: string[] | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          experience_level?: string | null
          id?: string
          language?: string | null
          last_login?: string | null
          location?: string | null
          name?: string | null
          preferences?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      tasting_items: {
        Row: {
          agave_variety: string | null
          alcohol_content: number | null
          certifications: string[] | null
          created_at: string | null
          details: Json | null
          id: string
          name: string
          nom_number: string | null
          order_index: number | null
          photo_url: string | null
          producer_id: string | null
          production_method: string | null
          tasting_id: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          agave_variety?: string | null
          alcohol_content?: number | null
          certifications?: string[] | null
          created_at?: string | null
          details?: Json | null
          id?: string
          name: string
          nom_number?: string | null
          order_index?: number | null
          photo_url?: string | null
          producer_id?: string | null
          production_method?: string | null
          tasting_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          agave_variety?: string | null
          alcohol_content?: number | null
          certifications?: string[] | null
          created_at?: string | null
          details?: Json | null
          id?: string
          name?: string
          nom_number?: string | null
          order_index?: number | null
          photo_url?: string | null
          producer_id?: string | null
          production_method?: string | null
          tasting_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasting_items_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasting_items_tasting_id_fkey"
            columns: ["tasting_id"]
            isOneToOne: false
            referencedRelation: "tastings"
            referencedColumns: ["id"]
          },
        ]
      }
      tasting_participants: {
        Row: {
          completed_at: string | null
          id: string
          joined_at: string | null
          notes: string | null
          status: string | null
          tasting_id: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          joined_at?: string | null
          notes?: string | null
          status?: string | null
          tasting_id?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          joined_at?: string | null
          notes?: string | null
          status?: string | null
          tasting_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasting_participants_tasting_id_fkey"
            columns: ["tasting_id"]
            isOneToOne: false
            referencedRelation: "tastings"
            referencedColumns: ["id"]
          },
        ]
      }
      tastings: {
        Row: {
          characteristics: Json | null
          created_at: string | null
          created_by: string | null
          current_participants: number | null
          date: string | null
          description: string | null
          id: string
          is_public: boolean | null
          location: string | null
          max_participants: number | null
          meeting_link: string | null
          name: string
          status: string | null
          tasting_data: Json | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          characteristics?: Json | null
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          date?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          location?: string | null
          max_participants?: number | null
          meeting_link?: string | null
          name: string
          status?: string | null
          tasting_data?: Json | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          characteristics?: Json | null
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          date?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          location?: string | null
          max_participants?: number | null
          meeting_link?: string | null
          name?: string
          status?: string | null
          tasting_data?: Json | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_challenge_progress: {
        Row: {
          challenge_id: string | null
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          progress: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          challenge_id?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          progress?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          challenge_id?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          progress?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reviews: {
        Row: {
          content: string
          created_at: string | null
          helpful_count: number | null
          id: string
          item_id: string | null
          rating: number | null
          tasting_id: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          item_id?: string | null
          rating?: number | null
          tasting_id?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          item_id?: string | null
          rating?: number | null
          tasting_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_reviews_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "tasting_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reviews_tasting_id_fkey"
            columns: ["tasting_id"]
            isOneToOne: false
            referencedRelation: "tastings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_streaks: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          streak_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          streak_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          streak_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_achievement: {
        Args: {
          p_user_id: string
          p_achievement_type: string
          p_title: string
          p_description: string
          p_points?: number
        }
        Returns: undefined
      }
      calculate_user_streak: {
        Args: {
          p_user_id: string
          p_streak_type: string
        }
        Returns: undefined
      }
      refresh_materialized_views: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_beverage_stock: {
        Args: {
          p_beverage_id: string
          p_quantity_change: number
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          level: number | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      prefixes: {
        Row: {
          bucket_id: string
          created_at: string | null
          level: number
          name: string
          updated_at: string | null
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          level?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          level?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prefixes_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_prefixes: {
        Args: {
          _bucket_id: string
          _name: string
        }
        Returns: undefined
      }
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      delete_prefix: {
        Args: {
          _bucket_id: string
          _name: string
        }
        Returns: boolean
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_level: {
        Args: {
          name: string
        }
        Returns: number
      }
      get_prefix: {
        Args: {
          name: string
        }
        Returns: string
      }
      get_prefixes: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
      search_legacy_v1: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
      search_v1_optimised: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
      search_v2: {
        Args: {
          prefix: string
          bucket_name: string
          limits?: number
          levels?: number
          start_after?: string
        }
        Returns: {
          key: string
          name: string
          id: string
          updated_at: string
          created_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

