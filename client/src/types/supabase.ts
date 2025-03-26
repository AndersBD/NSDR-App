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
      meditations: {
        Row: {
          id: number
          title: string
          duration: number
          file_name: string
          file_url: string
          created_at: string
        }
        Insert: {
          id?: number
          title: string
          duration: number
          file_name: string
          file_url: string
          created_at?: string
        }
        Update: {
          id?: number
          title?: string
          duration?: number
          file_name?: string
          file_url?: string
          created_at?: string
        }
      }
      feedback: {
        Row: {
          id: number
          user_id: string | null
          meditation_id: number
          wellbeing_change: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id?: string | null
          meditation_id: number
          wellbeing_change: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string | null
          meditation_id?: number
          wellbeing_change?: number
          created_at?: string
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
