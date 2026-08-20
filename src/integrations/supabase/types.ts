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
            foreignKeyName: "acquisitions_lotissement_id_fkey"
            columns: ["lotissement_id"]
            isOneToOne: false
            referencedRelation: "v_lotissement_profitability"
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
      audit_finance: {
        Row: {
          agency_id: string | null
          amount: number
          created_at: string | null
          id: string
          new_balance: number | null
          notes: string | null
          operation_type: string
          payment_id: string | null
          previous_balance: number | null
          refund_id: string | null
          sale_id: string | null
          user_id: string | null
        }
        Insert: {
          agency_id?: string | null
          amount: number
          created_at?: string | null
          id?: string
          new_balance?: number | null
          notes?: string | null
          operation_type: string
          payment_id?: string | null
          previous_balance?: number | null
          refund_id?: string | null
          sale_id?: string | null
          user_id?: string | null
        }
        Update: {
          agency_id?: string | null
          amount?: number
          created_at?: string | null
          id?: string
          new_balance?: number | null
          notes?: string | null
          operation_type?: string
          payment_id?: string | null
          previous_balance?: number | null
          refund_id?: string | null
          sale_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_finance_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_finance_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_finance_refund_id_fkey"
            columns: ["refund_id"]
            isOneToOne: false
            referencedRelation: "refunds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_finance_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_finance_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "v_sale_arrears"
            referencedColumns: ["sale_id"]
          },
        ]
      }
      audit_finance_corrections: {
        Row: {
          corrected_by: string
          created_at: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          reason: string
          record_id: string
          record_type: string
        }
        Insert: {
          corrected_by: string
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          reason: string
          record_id: string
          record_type: string
        }
        Update: {
          corrected_by?: string
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          reason?: string
          record_id?: string
          record_type?: string
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
      cash_journals: {
        Row: {
          actual_closing_balance: number | null
          agency_id: string
          closed_at: string | null
          closed_by_id: string | null
          created_at: string | null
          discrepancy: number | null
          discrepancy_reason: string | null
          id: string
          opened_at: string | null
          opened_by_id: string
          opening_balance: number
          status: string
          theoretical_closing_balance: number
        }
        Insert: {
          actual_closing_balance?: number | null
          agency_id: string
          closed_at?: string | null
          closed_by_id?: string | null
          created_at?: string | null
          discrepancy?: number | null
          discrepancy_reason?: string | null
          id?: string
          opened_at?: string | null
          opened_by_id: string
          opening_balance?: number
          status?: string
          theoretical_closing_balance?: number
        }
        Update: {
          actual_closing_balance?: number | null
          agency_id?: string
          closed_at?: string | null
          closed_by_id?: string | null
          created_at?: string | null
          discrepancy?: number | null
          discrepancy_reason?: string | null
          id?: string
          opened_at?: string | null
          opened_by_id?: string
          opening_balance?: number
          status?: string
          theoretical_closing_balance?: number
        }
        Relationships: [
          {
            foreignKeyName: "cash_journals_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agences"
            referencedColumns: ["id"]
          },
        ]
      }
      client_documents: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          document_type: string
          file_url: string
          id: string
          name: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          document_type: string
          file_url: string
          id?: string
          name: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          document_type?: string
          file_url?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_interactions: {
        Row: {
          client_id: string
          created_at: string
          id: string
          interaction_date: string
          interaction_type: string
          notes: string | null
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          interaction_date?: string
          interaction_type: string
          notes?: string | null
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          interaction_date?: string
          interaction_type?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_interactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          civilite: string | null
          created_at: string
          created_by: string | null
          date_naissance: string | null
          email: string | null
          first_name: string
          id: string
          id_number: string | null
          id_type: Database["public"]["Enums"]["id_type"]
          last_name: string
          lieu_naissance: string | null
          nationalite: string | null
          occupation: string | null
          phone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          civilite?: string | null
          created_at?: string
          created_by?: string | null
          date_naissance?: string | null
          email?: string | null
          first_name: string
          id?: string
          id_number?: string | null
          id_type?: Database["public"]["Enums"]["id_type"]
          last_name: string
          lieu_naissance?: string | null
          nationalite?: string | null
          occupation?: string | null
          phone: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          civilite?: string | null
          created_at?: string
          created_by?: string | null
          date_naissance?: string | null
          email?: string | null
          first_name?: string
          id?: string
          id_number?: string | null
          id_type?: Database["public"]["Enums"]["id_type"]
          last_name?: string
          lieu_naissance?: string | null
          nationalite?: string | null
          occupation?: string | null
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      contract_snapshots: {
        Row: {
          client_data: Json
          created_at: string | null
          created_by: string | null
          id: string
          plot_data: Json
          sale_data: Json
          sale_id: string
        }
        Insert: {
          client_data: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          plot_data: Json
          sale_data: Json
          sale_id: string
        }
        Update: {
          client_data?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          plot_data?: Json
          sale_data?: Json
          sale_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_snapshots_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_snapshots_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "v_sale_arrears"
            referencedColumns: ["sale_id"]
          },
        ]
      }
      contracts: {
        Row: {
          content_url: string | null
          contract_number: string
          created_at: string | null
          id: string
          metadata: Json | null
          sale_id: string
          signed_at: string | null
          version: number | null
        }
        Insert: {
          content_url?: string | null
          contract_number: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          sale_id: string
          signed_at?: string | null
          version?: number | null
        }
        Update: {
          content_url?: string | null
          contract_number?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          sale_id?: string
          signed_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "v_sale_arrears"
            referencedColumns: ["sale_id"]
          },
        ]
      }
      daily_cash_adjustments: {
        Row: {
          adjusted_by: string
          amount: number
          created_at: string | null
          id: string
          journal_id: string
          reason: string
        }
        Insert: {
          adjusted_by: string
          amount: number
          created_at?: string | null
          id?: string
          journal_id: string
          reason: string
        }
        Update: {
          adjusted_by?: string
          amount?: number
          created_at?: string | null
          id?: string
          journal_id?: string
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_cash_adjustments_journal_id_fkey"
            columns: ["journal_id"]
            isOneToOne: false
            referencedRelation: "cash_journals"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_cash_operations: {
        Row: {
          agency_id: string | null
          amount: number
          created_at: string | null
          description: string | null
          id: string
          operation_date: string | null
          operation_type: string | null
          payment_method: string
          performed_by: string | null
          reference_id: string | null
        }
        Insert: {
          agency_id?: string | null
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          operation_date?: string | null
          operation_type?: string | null
          payment_method: string
          performed_by?: string | null
          reference_id?: string | null
        }
        Update: {
          agency_id?: string | null
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          operation_date?: string | null
          operation_type?: string | null
          payment_method?: string
          performed_by?: string | null
          reference_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_cash_operations_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agences"
            referencedColumns: ["id"]
          },
        ]
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
      expenses: {
        Row: {
          agency_id: string
          amount: number
          beneficiary: string | null
          cash_journal_id: string | null
          category_id: string
          created_at: string | null
          created_by_id: string
          date: string
          description: string
          id: string
          payment_method: string
          project_id: string | null
          receipt_url: string | null
          status: Database["public"]["Enums"]["expense_status"]
          validated_by_id: string | null
          validation_date: string | null
          validation_notes: string | null
        }
        Insert: {
          agency_id: string
          amount: number
          beneficiary?: string | null
          cash_journal_id?: string | null
          category_id: string
          created_at?: string | null
          created_by_id: string
          date?: string
          description: string
          id?: string
          payment_method: string
          project_id?: string | null
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["expense_status"]
          validated_by_id?: string | null
          validation_date?: string | null
          validation_notes?: string | null
        }
        Update: {
          agency_id?: string
          amount?: number
          beneficiary?: string | null
          cash_journal_id?: string | null
          category_id?: string
          created_at?: string | null
          created_by_id?: string
          date?: string
          description?: string
          id?: string
          payment_method?: string
          project_id?: string | null
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["expense_status"]
          validated_by_id?: string | null
          validation_date?: string | null
          validation_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_cash_journal_id_fkey"
            columns: ["cash_journal_id"]
            isOneToOne: false
            referencedRelation: "cash_journals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "lotissement_profitability"
            referencedColumns: ["lotissement_id"]
          },
          {
            foreignKeyName: "expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "lotissements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_lotissement_profitability"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "lotissement_attachments_lotissement_id_fkey"
            columns: ["lotissement_id"]
            isOneToOne: false
            referencedRelation: "v_lotissement_profitability"
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
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_corrections: {
        Row: {
          corrected_by: string | null
          created_at: string | null
          id: string
          new_amount: number | null
          new_data: Json | null
          old_amount: number | null
          old_data: Json | null
          payment_id: string | null
          reason: string
        }
        Insert: {
          corrected_by?: string | null
          created_at?: string | null
          id?: string
          new_amount?: number | null
          new_data?: Json | null
          old_amount?: number | null
          old_data?: Json | null
          payment_id?: string | null
          reason: string
        }
        Update: {
          corrected_by?: string | null
          created_at?: string | null
          id?: string
          new_amount?: number | null
          new_data?: Json | null
          old_amount?: number | null
          old_data?: Json | null
          payment_id?: string | null
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_corrections_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_schedules: {
        Row: {
          amount_due: number
          amount_paid: number | null
          created_at: string | null
          due_date: string
          id: string
          last_reminder_sent_at: string | null
          notes: string | null
          sale_id: string
          schedule_type: string | null
          status: string
        }
        Insert: {
          amount_due: number
          amount_paid?: number | null
          created_at?: string | null
          due_date: string
          id?: string
          last_reminder_sent_at?: string | null
          notes?: string | null
          sale_id: string
          schedule_type?: string | null
          status?: string
        }
        Update: {
          amount_due?: number
          amount_paid?: number | null
          created_at?: string | null
          due_date?: string
          id?: string
          last_reminder_sent_at?: string | null
          notes?: string | null
          sale_id?: string
          schedule_type?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_schedules_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_schedules_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "v_sale_arrears"
            referencedColumns: ["sale_id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          id: string
          imputed_data: Json | null
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          payment_date: string
          reference: string | null
          sale_id: string
        }
        Insert: {
          amount: number
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          id?: string
          imputed_data?: Json | null
          method: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          payment_date?: string
          reference?: string | null
          sale_id: string
        }
        Update: {
          amount?: number
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          id?: string
          imputed_data?: Json | null
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
          {
            foreignKeyName: "payments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "v_sale_arrears"
            referencedColumns: ["sale_id"]
          },
        ]
      }
      plot_pricing: {
        Row: {
          base_price: number
          created_at: string
          effective_date: string
          id: string
          min_price: number | null
          notes: string | null
          plot_id: string
          prepared_by_id: string | null
          validated_by_id: string | null
          validation_date: string | null
        }
        Insert: {
          base_price: number
          created_at?: string
          effective_date?: string
          id?: string
          min_price?: number | null
          notes?: string | null
          plot_id: string
          prepared_by_id?: string | null
          validated_by_id?: string | null
          validation_date?: string | null
        }
        Update: {
          base_price?: number
          created_at?: string
          effective_date?: string
          id?: string
          min_price?: number | null
          notes?: string | null
          plot_id?: string
          prepared_by_id?: string | null
          validated_by_id?: string | null
          validation_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plot_pricing_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
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
      price_templates: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          price_per_m2: number
          surface_range_max: number
          surface_range_min: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          price_per_m2: number
          surface_range_max: number
          surface_range_min: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          price_per_m2?: number
          surface_range_max?: number
          surface_range_min?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      refunds: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          processed_by: string | null
          reason: string | null
          refund_date: string | null
          sale_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          processed_by?: string | null
          reason?: string | null
          refund_date?: string | null
          sale_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          processed_by?: string | null
          reason?: string | null
          refund_date?: string | null
          sale_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "refunds_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "v_sale_arrears"
            referencedColumns: ["sale_id"]
          },
        ]
      }
      reservations: {
        Row: {
          cancellation_reason: string | null
          client_id: string
          created_at: string
          created_by: string
          expires_at: string
          id: string
          plot_id: string
          reminder_sent_at: string | null
          status: Database["public"]["Enums"]["reservation_status"]
        }
        Insert: {
          cancellation_reason?: string | null
          client_id: string
          created_at?: string
          created_by: string
          expires_at: string
          id?: string
          plot_id: string
          reminder_sent_at?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
        }
        Update: {
          cancellation_reason?: string | null
          client_id?: string
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          plot_id?: string
          reminder_sent_at?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "reservations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          permission?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      sale_adjustments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          new_total_price: number | null
          previous_total_price: number | null
          reason: string
          requested_by: string
          sale_id: string
          status: Database["public"]["Enums"]["adjustment_status"]
          type: Database["public"]["Enums"]["adjustment_type"]
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          new_total_price?: number | null
          previous_total_price?: number | null
          reason: string
          requested_by: string
          sale_id: string
          status?: Database["public"]["Enums"]["adjustment_status"]
          type: Database["public"]["Enums"]["adjustment_type"]
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          new_total_price?: number | null
          previous_total_price?: number | null
          reason?: string
          requested_by?: string
          sale_id?: string
          status?: Database["public"]["Enums"]["adjustment_status"]
          type?: Database["public"]["Enums"]["adjustment_type"]
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sale_adjustments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_adjustments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "v_sale_arrears"
            referencedColumns: ["sale_id"]
          },
        ]
      }
      sale_mutations: {
        Row: {
          created_at: string | null
          id: string
          new_plot_id: string
          old_plot_id: string
          price_difference: number
          reason: string
          requested_by: string
          sale_id: string
          status: string
          validated_by: string | null
          validation_date: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          new_plot_id: string
          old_plot_id: string
          price_difference: number
          reason: string
          requested_by: string
          sale_id: string
          status?: string
          validated_by?: string | null
          validation_date?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          new_plot_id?: string
          old_plot_id?: string
          price_difference?: number
          reason?: string
          requested_by?: string
          sale_id?: string
          status?: string
          validated_by?: string | null
          validation_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sale_mutations_new_plot_id_fkey"
            columns: ["new_plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_mutations_old_plot_id_fkey"
            columns: ["old_plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_mutations_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_mutations_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "v_sale_arrears"
            referencedColumns: ["sale_id"]
          },
        ]
      }
      sale_transfers: {
        Row: {
          authorized_by: string | null
          created_at: string | null
          id: string
          new_plot_id: string
          old_plot_id: string
          price_difference: number
          reason: string
          sale_id: string
        }
        Insert: {
          authorized_by?: string | null
          created_at?: string | null
          id?: string
          new_plot_id: string
          old_plot_id: string
          price_difference?: number
          reason: string
          sale_id: string
        }
        Update: {
          authorized_by?: string | null
          created_at?: string | null
          id?: string
          new_plot_id?: string
          old_plot_id?: string
          price_difference?: number
          reason?: string
          sale_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_transfers_new_plot_id_fkey"
            columns: ["new_plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_transfers_old_plot_id_fkey"
            columns: ["old_plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_transfers_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_transfers_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "v_sale_arrears"
            referencedColumns: ["sale_id"]
          },
        ]
      }
      sales: {
        Row: {
          agency_id: string | null
          balance: number
          catalog_price: number | null
          client_id: string
          created_at: string
          deposit_amount: number | null
          discount_amount: number | null
          down_payment: number | null
          final_price: number | null
          first_payment_date: string | null
          id: string
          notes: string | null
          plot_id: string
          prepared_by_id: string | null
          price_validated_by_id: string | null
          price_validation_date: string | null
          sale_date: string
          status: Database["public"]["Enums"]["sale_status"]
          total_amount: number | null
          total_price: number
          updated_at: string
          validated_by_id: string | null
          validation_date: string | null
        }
        Insert: {
          agency_id?: string | null
          balance: number
          catalog_price?: number | null
          client_id: string
          created_at?: string
          deposit_amount?: number | null
          discount_amount?: number | null
          down_payment?: number | null
          final_price?: number | null
          first_payment_date?: string | null
          id?: string
          notes?: string | null
          plot_id: string
          prepared_by_id?: string | null
          price_validated_by_id?: string | null
          price_validation_date?: string | null
          sale_date?: string
          status?: Database["public"]["Enums"]["sale_status"]
          total_amount?: number | null
          total_price: number
          updated_at?: string
          validated_by_id?: string | null
          validation_date?: string | null
        }
        Update: {
          agency_id?: string | null
          balance?: number
          catalog_price?: number | null
          client_id?: string
          created_at?: string
          deposit_amount?: number | null
          discount_amount?: number | null
          down_payment?: number | null
          final_price?: number | null
          first_payment_date?: string | null
          id?: string
          notes?: string | null
          plot_id?: string
          prepared_by_id?: string | null
          price_validated_by_id?: string | null
          price_validation_date?: string | null
          sale_date?: string
          status?: Database["public"]["Enums"]["sale_status"]
          total_amount?: number | null
          total_price?: number
          updated_at?: string
          validated_by_id?: string | null
          validation_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agences"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "zones_lotissement_id_fkey"
            columns: ["lotissement_id"]
            isOneToOne: false
            referencedRelation: "v_lotissement_profitability"
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
      v_commercial_performance: {
        Row: {
          agency_id: string | null
          agency_name: string | null
          agent_email: string | null
          agent_id: string | null
          agent_name: string | null
          avg_sale_value: number | null
          collected_amount: number | null
          total_sales: number | null
          total_value: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agences"
            referencedColumns: ["id"]
          },
        ]
      }
      v_commercial_performance_detailed: {
        Row: {
          active_sales: number | null
          agency_id: string | null
          agency_name: string | null
          agent_email: string | null
          agent_id: string | null
          agent_name: string | null
          collected_amount: number | null
          sale_date: string | null
          total_balance: number | null
          total_sales: number | null
          total_value: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agences"
            referencedColumns: ["id"]
          },
        ]
      }
      v_financial_summary: {
        Row: {
          active_sales_count: number | null
          available_plots_count: number | null
          integrity_alerts: number | null
          monthly_collections: number | null
          monthly_sales: number | null
          monthly_sales_count: number | null
          stock_value: number | null
          total_ca_potential: number | null
          total_collected_net: number | null
          total_outstanding: number | null
          total_plots_in_system: number | null
        }
        Relationships: []
      }
      v_lotissement_profitability: {
        Row: {
          acquisition_cost: number | null
          agence_id: string | null
          agence_name: string | null
          collected_amount: number | null
          id: string | null
          location: string | null
          name: string | null
          net_profit: number | null
          operational_expenses: number | null
          potential_value: number | null
          roi_percent: number | null
          sold_plots: number | null
          sold_value: number | null
          total_costs: number | null
          total_plots: number | null
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
      v_sale_arrears: {
        Row: {
          agence_name: string | null
          agency_id: string | null
          client_id: string | null
          client_name: string | null
          client_phone: string | null
          days_overdue: number | null
          is_critical_delay: boolean | null
          lotissement_name: string | null
          oldest_unpaid_due_date: string | null
          sale_id: string | null
          total_arrears: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_financial_integrity: {
        Args: never
        Returns: {
          audit_sum: number
          is_consistent: boolean
          mismatch_amount: number
          total_payments: number
          total_refunds: number
        }[]
      }
      fn_calculate_sale_arrears: {
        Args: { _sale_id: string }
        Returns: {
          days_overdue: number
          is_critical_delay: boolean
          oldest_unpaid_due_date: string
          total_arrears: number
        }[]
      }
      fn_calculate_theoretical_cash: {
        Args: { _journal_id: string }
        Returns: number
      }
      fn_check_and_notify_arrears: { Args: never; Returns: undefined }
      fn_create_notification: {
        Args: {
          _message: string
          _sale_id?: string
          _title: string
          _type?: string
          _user_id: string
        }
        Returns: undefined
      }
      fn_get_payment_imputation_preview: {
        Args: { p_amount: number; p_sale_id: string }
        Returns: Json
      }
      fn_impute_payment_on_schedule: {
        Args: { p_amount: number; p_payment_id: string; p_sale_id: string }
        Returns: Json
      }
      fn_notify_pdg: {
        Args: { _agency_id: string; _message: string; _title: string }
        Returns: undefined
      }
      fn_update_late_schedules: { Args: never; Returns: undefined }
      get_plot_effective_price: { Args: { _plot_id: string }; Returns: number }
      handle_plot_transfer: {
        Args: {
          p_author_id: string
          p_new_plot_id: string
          p_reason: string
          p_sale_id: string
        }
        Returns: undefined
      }
      has_role:
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
        | { Args: { _role: string; _user_id: string }; Returns: boolean }
    }
    Enums: {
      acquisition_cost_category:
        | "Prix Achat"
        | "Frais Acte"
        | "Géomètre"
        | "Commission"
        | "Taxe"
        | "Autre"
      adjustment_status: "pending" | "approved" | "rejected"
      adjustment_type: "change_plot" | "price_adjustment"
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
        | "super_admin"
      expense_status:
        | "brouillon"
        | "en_attente_validation"
        | "validé"
        | "rejeté"
      id_type: "cni" | "passeport" | "permis" | "autre"
      payment_method: "espece" | "virement" | "cheque" | "mobile_money"
      payment_plan_type: "comptant" | "echelonne"
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
      reservation_status: "active" | "converted" | "expired" | "cancelled"
      sale_status: "reservation" | "en_cours" | "termine" | "annule"
      schedule_status: "En attente" | "Partiel" | "Payé" | "Retard"
      schedule_type: "automatique" | "manuel"
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
      adjustment_status: ["pending", "approved", "rejected"],
      adjustment_type: ["change_plot", "price_adjustment"],
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
        "super_admin",
      ],
      expense_status: [
        "brouillon",
        "en_attente_validation",
        "validé",
        "rejeté",
      ],
      id_type: ["cni", "passeport", "permis", "autre"],
      payment_method: ["espece", "virement", "cheque", "mobile_money"],
      payment_plan_type: ["comptant", "echelonne"],
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
      reservation_status: ["active", "converted", "expired", "cancelled"],
      sale_status: ["reservation", "en_cours", "termine", "annule"],
      schedule_status: ["En attente", "Partiel", "Payé", "Retard"],
      schedule_type: ["automatique", "manuel"],
      site_status: ["actif", "inactif", "termine"],
    },
  },
} as const
