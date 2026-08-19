export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      acquisition_costs: {
        Row: {
          acquisition_id: string
          amount: number
          category: Database["public"]["Enums"]["acquisition_cost_category"]
          created_at: string
          date: string
          description: string | null
          id: string
          proof_url: string | null
        }
        Insert: {
          acquisition_id: string
          amount: number
          category: Database["public"]["Enums"]["acquisition_cost_category"]
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          proof_url?: string | null
        }
        Update: {
          acquisition_id?: string
          amount?: number
          category?: Database["public"]["Enums"]["acquisition_cost_category"]
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          proof_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acquisition_costs_acquisition_id_fkey"
            columns: ["acquisition_id"]
            isOneToOne: false
            referencedRelation: "acquisitions"
            referencedColumns: ["id"]
          },
        ]
      }
      acquisitions: {
        Row: {
          created_at: string
          date_achat: string
          id: string
          lotissement_id: string | null
          plot_id: string | null
          prepared_by_id: string | null
          prix_principal: number
          status: string
          updated_at: string
          validated_by_id: string | null
          validation_date: string | null
          vendeur: string
        }
        Insert: {
          created_at?: string
          date_achat?: string
          id?: string
          lotissement_id?: string | null
          plot_id?: string | null
          prepared_by_id?: string | null
          prix_principal?: number
          status?: string
          updated_at?: string
          validated_by_id?: string | null
          validation_date?: string | null
          vendeur: string
        }
        Update: {
          created_at?: string
          date_achat?: string
          id?: string
          lotissement_id?: string | null
          plot_id?: string | null
          prepared_by_id?: string | null
          prix_principal?: number
          status?: string
          updated_at?: string
          validated_by_id?: string | null
          validation_date?: string | null
          vendeur?: string
        }
        Relationships: [
          {
            foreignKeyName: "acquisitions_lotissement_id_fkey"
            columns: ["lotissement_id"]
            isOneToOne: false
            referencedRelation: "lotissement_profitability"
            referencedColumns: ["lotissement_id"]
          },
          {
            foreignKeyName: "acquisitions_lotissement_id_fkey"
            columns: ["lotissement_id"]
            isOneToOne: false
            referencedRelation: "lotissements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acquisitions_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
        ]
      }
      agences: {
        Row: {
          address: string | null
          city: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          id_number: string | null
          id_type: Database["public"]["Enums"]["id_type"]
          last_name: string
          occupation: string | null
          phone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          id_number?: string | null
          id_type?: Database["public"]["Enums"]["id_type"]
          last_name: string
          occupation?: string | null
          phone: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          id_number?: string | null
          id_type?: Database["public"]["Enums"]["id_type"]
          last_name?: string
          occupation?: string | null
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      expense_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_system: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
        }
        Relationships: []
      }
      ilots: {
        Row: {
          created_at: string
          id: string
          numero: string
          zone_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          numero: string
          zone_id: string
        }
        Update: {
          created_at?: string
          id?: string
          numero?: string
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ilots_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      lotissement_attachments: {
        Row: {
          created_at: string
          created_by: string | null
          file_type: string | null
          file_url: string
          id: string
          lotissement_id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          file_type?: string | null
          file_url: string
          id?: string
          lotissement_id: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          file_type?: string | null
          file_url?: string
          id?: string
          lotissement_id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "lotissement_attachments_lotissement_id_fkey"
            columns: ["lotissement_id"]
            isOneToOne: false
            referencedRelation: "lotissement_profitability"
            referencedColumns: ["lotissement_id"]
          },
          {
            foreignKeyName: "lotissement_attachments_lotissement_id_fkey"
            columns: ["lotissement_id"]
            isOneToOne: false
            referencedRelation: "lotissements"
            referencedColumns: ["id"]
          },
        ]
      }
      lotissements: {
        Row: {
          agence_id: string | null
          created_at: string
          id: string
          location: string
          name: string
          plan_communal: string | null
          superficie_totale: number | null
          updated_at: string
        }
        Insert: {
          agence_id?: string | null
          created_at?: string
          id?: string
          location: string
          name: string
          plan_communal?: string | null
          superficie_totale?: number | null
          updated_at?: string
        }
        Update: {
          agence_id?: string | null
          created_at?: string
          id?: string
          location?: string
          name?: string
          plan_communal?: string | null
          superficie_totale?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lotissements_agence_id_fkey"
            columns: ["agence_id"]
            isOneToOne: false
            referencedRelation: "agences"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          payment_date: string
          reference: string | null
          sale_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          payment_date?: string
          reference?: string | null
          sale_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          payment_date?: string
          reference?: string | null
          sale_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      plot_status_history: {
        Row: {
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["plot_status_new"]
          old_status: Database["public"]["Enums"]["plot_status_new"] | null
          plot_id: string
          reason: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          new_status: Database["public"]["Enums"]["plot_status_new"]
          old_status?: Database["public"]["Enums"]["plot_status_new"] | null
          plot_id: string
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["plot_status_new"]
          old_status?: Database["public"]["Enums"]["plot_status_new"] | null
          plot_id?: string
          reason?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plot_status_history_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
        ]
      }
      plots: {
        Row: {
          base_price: number
          cost_price_calculated: number | null
          created_at: string
          id: string
          ilot_id: string | null
          notes: string | null
          plan_url: string | null
          plot_number: string
          site_id: string
          status: Database["public"]["Enums"]["plot_status_new"]
          surface_area: number
          updated_at: string
        }
        Insert: {
          base_price: number
          cost_price_calculated?: number | null
          created_at?: string
          id?: string
          ilot_id?: string | null
          notes?: string | null
          plan_url?: string | null
          plot_number: string
          site_id: string
          status?: Database["public"]["Enums"]["plot_status_new"]
          surface_area: number
          updated_at?: string
        }
        Update: {
          base_price?: number
          cost_price_calculated?: number | null
          created_at?: string
          id?: string
          ilot_id?: string | null
          notes?: string | null
          plan_url?: string | null
          plot_number?: string
          site_id?: string
          status?: Database["public"]["Enums"]["plot_status_new"]
          surface_area?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plots_ilot_id_fkey"
            columns: ["ilot_id"]
            isOneToOne: false
            referencedRelation: "ilots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plots_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          balance: number
          client_id: string
          created_at: string
          down_payment: number | null
          id: string
          plot_id: string
          prepared_by_id: string | null
          sale_date: string
          status: Database["public"]["Enums"]["sale_status"]
          total_price: number
          updated_at: string
          validated_by_id: string | null
          validation_date: string | null
        }
        Insert: {
          balance: number
          client_id: string
          created_at?: string
          down_payment?: number | null
          id?: string
          plot_id: string
          prepared_by_id?: string | null
          sale_date?: string
          status?: Database["public"]["Enums"]["sale_status"]
          total_price: number
          updated_at?: string
          validated_by_id?: string | null
          validation_date?: string | null
        }
        Update: {
          balance?: number
          client_id?: string
          created_at?: string
          down_payment?: number | null
          id?: string
          plot_id?: string
          prepared_by_id?: string | null
          sale_date?: string
          status?: Database["public"]["Enums"]["sale_status"]
          total_price?: number
          updated_at?: string
          validated_by_id?: string | null
          validation_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          created_at: string
          description: string | null
          id: string
          location: string
          name: string
          status: Database["public"]["Enums"]["site_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          location: string
          name: string
          status?: Database["public"]["Enums"]["site_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string
          name?: string
          status?: Database["public"]["Enums"]["site_status"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          agence_id: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          agence_id?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          agence_id?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_agence_id_fkey"
            columns: ["agence_id"]
            isOneToOne: false
            referencedRelation: "agences"
            referencedColumns: ["id"]
          },
        ]
      }
      zones: {
        Row: {
          created_at: string
          description: string | null
          id: string
          lotissement_id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          lotissement_id: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          lotissement_id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "zones_lotissement_id_fkey"
            columns: ["lotissement_id"]
            isOneToOne: false
            referencedRelation: "lotissement_profitability"
            referencedColumns: ["lotissement_id"]
          },
          {
            foreignKeyName: "zones_lotissement_id_fkey"
            columns: ["lotissement_id"]
            isOneToOne: false
            referencedRelation: "lotissements"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      lotissement_profitability: {
        Row: {
          location: string | null
          lotissement_id: string | null
          margin_percentage: number | null
          name: string | null
          potential_revenue: number | null
          total_investment: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      acquisition_cost_category:
        | "Prix Achat"
        | "Frais Acte"
        | "Géomètre"
        | "Commission"
        | "Taxe"
        | "Autre"
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "pdg"
        | "comptable"
        | "secretaire"
        | "commercial"
        | "responsable_agence"
        | "informaticien"
        | "client"
      id_type: "cni" | "passeport" | "permis" | "autre"
      payment_method: "espece" | "virement" | "cheque" | "mobile_money"
      plot_status: "disponible" | "reserve" | "vendu" | "litige"
      plot_status_new:
        | "Disponible"
        | "Réservée"
        | "Attribuée"
        | "En cours de paiement"
        | "Entièrement payée"
        | "Vendue"
        | "Bloquée"
        | "Annulée"
      sale_status: "reservation" | "en_cours" | "termine" | "annule"
      site_status: "actif" | "inactif" | "termine"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      acquisition_cost_category: [
        "Prix Achat",
        "Frais Acte",
        "Géomètre",
        "Commission",
        "Taxe",
        "Autre",
      ],
      app_role: [
        "admin",
        "moderator",
        "user",
        "pdg",
        "comptable",
        "secretaire",
        "commercial",
        "responsable_agence",
        "informaticien",
        "client",
      ],
      id_type: ["cni", "passeport", "permis", "autre"],
      payment_method: ["espece", "virement", "cheque", "mobile_money"],
      plot_status: ["disponible", "reserve", "vendu", "litige"],
      plot_status_new: [
        "Disponible",
        "Réservée",
        "Attribuée",
        "En cours de paiement",
        "Entièrement payée",
        "Vendue",
        "Bloquée",
        "Annulée",
      ],
      sale_status: ["reservation", "en_cours", "termine", "annule"],
      site_status: ["actif", "inactif", "termine"],
    },
  },
} as const
