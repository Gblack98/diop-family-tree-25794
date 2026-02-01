/**
 * Database Types for Supabase
 *
 * Ces types seront générés automatiquement après la création
 * du schéma Supabase. Pour l'instant, on définit les types manuellement.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'moderator'
          username: string
          email: string | null
          suspended: boolean
          created_at: string
        }
        Insert: {
          id: string
          role: 'admin' | 'moderator'
          username: string
          email?: string | null
          suspended?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'moderator'
          username?: string
          email?: string | null
          suspended?: boolean
          created_at?: string
        }
      }
      persons: {
        Row: {
          id: string
          name: string
          genre: 'Homme' | 'Femme'
          generation: number
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          name: string
          genre: 'Homme' | 'Femme'
          generation: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          genre?: 'Homme' | 'Femme'
          generation?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      relationships: {
        Row: {
          id: string
          parent_id: string
          child_id: string
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          parent_id: string
          child_id: string
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          parent_id?: string
          child_id?: string
          created_at?: string
          created_by?: string | null
        }
      }
      archives: {
        Row: {
          id: string
          person_id: string | null
          category: string
          title: string
          content: string
          full_content: string | null
          date: string
          images: string[] | null
          achievements: string[] | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          person_id?: string | null
          category: string
          title: string
          content: string
          full_content?: string | null
          date: string
          images?: string[] | null
          achievements?: string[] | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          person_id?: string | null
          category?: string
          title?: string
          content?: string
          full_content?: string | null
          date?: string
          images?: string[] | null
          achievements?: string[] | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      change_history: {
        Row: {
          id: string
          table_name: string
          record_id: string
          action: 'INSERT' | 'UPDATE' | 'DELETE'
          old_data: Json | null
          new_data: Json | null
          changed_by: string | null
          changed_at: string
          reverted: boolean
          revert_reason: string | null
        }
        Insert: {
          id?: string
          table_name: string
          record_id: string
          action: 'INSERT' | 'UPDATE' | 'DELETE'
          old_data?: Json | null
          new_data?: Json | null
          changed_by?: string | null
          changed_at?: string
          reverted?: boolean
          revert_reason?: string | null
        }
        Update: {
          id?: string
          table_name?: string
          record_id?: string
          action?: 'INSERT' | 'UPDATE' | 'DELETE'
          old_data?: Json | null
          new_data?: Json | null
          changed_by?: string | null
          changed_at?: string
          reverted?: boolean
          revert_reason?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
