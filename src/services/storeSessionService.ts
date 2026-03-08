import { supabase } from '../supabase'
import type { StoreSession } from '../models/StoreSession'

export class StoreSessionService {
  /**
   * Get the single active session (where closed_at IS NULL).
   * Returns null if no session is open.
   */
  static async getActiveSession(): Promise<StoreSession | null> {
    const { data, error } = await supabase
      .from('store_sessions')
      .select('id, opened_at, closed_at, opened_by, closed_by')
      .is('closed_at', null)
      .maybeSingle()

    if (error) {
      console.error('Error fetching active store session:', error)
      throw error
    }

    return data as StoreSession | null
  }

  /**
   * Open a new session (Start Day).
   * Fails with a friendly message if a session is already open (unique constraint).
   */
  static async openSession(openedBy?: string): Promise<StoreSession> {
    const { data, error } = await supabase
      .from('store_sessions')
      .insert({
        opened_at: new Date().toISOString(),
        closed_at: null,
        opened_by: openedBy ?? null
      })
      .select('id, opened_at, closed_at, opened_by, closed_by')
      .single()

    if (error) {
      const code = (error as { code?: string }).code
      if (code === '23505') {
        throw new Error('A session is already active on another device. Refresh to sync.')
      }
      console.error('Error opening store session:', error)
      throw error
    }

    return data as StoreSession
  }

  /**
   * Close the given session (End of Day).
   */
  static async closeSession(sessionId: string, closedBy?: string): Promise<StoreSession> {
    const { data, error } = await supabase
      .from('store_sessions')
      .update({
        closed_at: new Date().toISOString(),
        closed_by: closedBy ?? null
      })
      .eq('id', sessionId)
      .select('id, opened_at, closed_at, opened_by, closed_by')
      .single()

    if (error) {
      console.error('Error closing store session:', error)
      throw error
    }

    return data as StoreSession
  }

  /**
   * Returns session boundaries as Date objects for filtering orders/expenses.
   * For an open session, end is "now".
   */
  static getSessionRange(session: StoreSession): { start: Date; end: Date } {
    const start = new Date(session.opened_at)
    const end = session.closed_at ? new Date(session.closed_at) : new Date()
    return { start, end }
  }
}
