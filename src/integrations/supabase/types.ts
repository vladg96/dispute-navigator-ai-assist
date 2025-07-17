export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      disputes: {
        Row: {
          amount: number
          case_id: string
          complaint: string
          created_at: string
          current_reply: string | null
          customer_email: string
          customer_name: string
          dispute_type: string
          id: string
          priority: string
          status: string
          submitted_date: string
          transaction_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          case_id: string
          complaint: string
          created_at?: string
          current_reply?: string | null
          customer_email: string
          customer_name: string
          dispute_type: string
          id?: string
          priority?: string
          status?: string
          submitted_date: string
          transaction_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          case_id?: string
          complaint?: string
          created_at?: string
          current_reply?: string | null
          customer_email?: string
          customer_name?: string
          dispute_type?: string
          id?: string
          priority?: string
          status?: string
          submitted_date?: string
          transaction_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      evidence: {
        Row: {
          created_at: string
          dispute_id: string
          file_name: string
          file_path: string | null
          id: string
        }
        Insert: {
          created_at?: string
          dispute_id: string
          file_name: string
          file_path?: string | null
          id?: string
        }
        Update: {
          created_at?: string
          dispute_id?: string
          file_name?: string
          file_path?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']