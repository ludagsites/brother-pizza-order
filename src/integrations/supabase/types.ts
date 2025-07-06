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
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          selected_extras: Json | null
          selected_size: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          quantity?: number
          selected_extras?: Json | null
          selected_size?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          selected_extras?: Json | null
          selected_size?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          order_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          order_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          order_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_zones: {
        Row: {
          created_at: string | null
          delivery_fee: number
          id: string
          neighborhood: string
        }
        Insert: {
          created_at?: string | null
          delivery_fee: number
          id?: string
          neighborhood: string
        }
        Update: {
          created_at?: string | null
          delivery_fee?: number
          id?: string
          neighborhood?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          change_amount: number | null
          created_at: string | null
          customer_address: string
          customer_name: string
          customer_phone: string
          delivery_fee: number | null
          delivery_time_estimate: string | null
          id: string
          items: Json
          needs_change: boolean | null
          notes: string | null
          observations: string | null
          payment_method: string | null
          remove_ingredients: string | null
          status: string
          total: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          change_amount?: number | null
          created_at?: string | null
          customer_address: string
          customer_name: string
          customer_phone: string
          delivery_fee?: number | null
          delivery_time_estimate?: string | null
          id?: string
          items?: Json
          needs_change?: boolean | null
          notes?: string | null
          observations?: string | null
          payment_method?: string | null
          remove_ingredients?: string | null
          status?: string
          total: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          change_amount?: number | null
          created_at?: string | null
          customer_address?: string
          customer_name?: string
          customer_phone?: string
          delivery_fee?: number | null
          delivery_time_estimate?: string | null
          id?: string
          items?: Json
          needs_change?: boolean | null
          notes?: string | null
          observations?: string | null
          payment_method?: string | null
          remove_ingredients?: string | null
          status?: string
          total?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pizza_flavors: {
        Row: {
          available: boolean | null
          category: string
          created_at: string | null
          id: string
          ingredients: string
          name: string
          price_familia: number
          price_grande: number
          price_media: number
          updated_at: string | null
        }
        Insert: {
          available?: boolean | null
          category: string
          created_at?: string | null
          id?: string
          ingredients: string
          name: string
          price_familia: number
          price_grande: number
          price_media: number
          updated_at?: string | null
        }
        Update: {
          available?: boolean | null
          category?: string
          created_at?: string | null
          id?: string
          ingredients?: string
          name?: string
          price_familia?: number
          price_grande?: number
          price_media?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          available: boolean | null
          category: string
          created_at: string | null
          description: string | null
          extras: Json | null
          id: string
          image: string | null
          name: string
          price: number
          sizes: Json | null
          updated_at: string | null
        }
        Insert: {
          available?: boolean | null
          category: string
          created_at?: string | null
          description?: string | null
          extras?: Json | null
          id?: string
          image?: string | null
          name: string
          price: number
          sizes?: Json | null
          updated_at?: string | null
        }
        Update: {
          available?: boolean | null
          category?: string
          created_at?: string | null
          description?: string | null
          extras?: Json | null
          id?: string
          image?: string | null
          name?: string
          price?: number
          sizes?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
