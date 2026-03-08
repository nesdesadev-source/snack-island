export interface StoreSession {
  id: string
  opened_at: string
  closed_at: string | null
  opened_by?: string | null
  closed_by?: string | null
}
