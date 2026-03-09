import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StoreSessionService } from '../../src/services/storeSessionService'
import { supabase } from '../../src/supabase'
import type { StoreSession } from '../../src/models'

vi.mock('../../src/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}))

const mockSession: StoreSession = {
  id: 'session-123',
  opened_at: '2026-03-08T10:00:00Z',
  closed_at: null,
  opened_by: null,
  closed_by: null
}

const mockClosedSession: StoreSession = {
  ...mockSession,
  closed_at: '2026-03-08T22:00:00Z'
}

describe('StoreSessionService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getActiveSession', () => {
    it('returns null when no active session', async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })
      const mockIs = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
      const mockSelect = vi.fn().mockReturnValue({ is: mockIs })
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any)

      const result = await StoreSessionService.getActiveSession()

      expect(result).toBeNull()
      expect(supabase.from).toHaveBeenCalledWith('store_sessions')
    })

    it('returns session when one is open', async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: mockSession, error: null })
      const mockIs = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
      const mockSelect = vi.fn().mockReturnValue({ is: mockIs })
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any)

      const result = await StoreSessionService.getActiveSession()

      expect(result).toEqual(mockSession)
    })

    it('throws when Supabase errors', async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'DB error' }
      })
      const mockIs = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
      const mockSelect = vi.fn().mockReturnValue({ is: mockIs })
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any)

      await expect(StoreSessionService.getActiveSession()).rejects.toBeDefined()
    })
  })

  describe('openSession', () => {
    it('creates a new session', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: mockSession, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
      vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any)

      const result = await StoreSessionService.openSession()

      expect(result).toEqual(mockSession)
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          closed_at: null,
          opened_by: null
        })
      )
    })

    it('throws friendly message on unique constraint (session already open)', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate key' }
      })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
      vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any)

      await expect(StoreSessionService.openSession()).rejects.toThrow(
        'A session is already active on another device'
      )
    })
  })

  describe('closeSession', () => {
    it('closes the session', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: mockClosedSession, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
      vi.mocked(supabase.from).mockReturnValue({ update: mockUpdate } as any)

      const result = await StoreSessionService.closeSession('session-123')

      expect(result.closed_at).toBe('2026-03-08T22:00:00Z')
    })
  })

  describe('getSessionRange', () => {
    it('returns start and end for open session (end = now)', () => {
      const before = Date.now()
      const range = StoreSessionService.getSessionRange(mockSession)
      const after = Date.now()

      expect(range.start.getTime()).toBe(new Date(mockSession.opened_at).getTime())
      expect(range.end.getTime()).toBeGreaterThanOrEqual(before)
      expect(range.end.getTime()).toBeLessThanOrEqual(after + 100)
    })

    it('advances end when called again later for an open session', () => {
      vi.useFakeTimers()
      try {
        vi.setSystemTime(new Date('2026-03-08T12:00:00Z'))
        const first = StoreSessionService.getSessionRange(mockSession)

        vi.setSystemTime(new Date('2026-03-08T12:05:00Z'))
        const second = StoreSessionService.getSessionRange(mockSession)

        expect(second.end.getTime()).toBeGreaterThan(first.end.getTime())
      } finally {
        vi.useRealTimers()
      }
    })

    it('returns start and closed_at for closed session', () => {
      const range = StoreSessionService.getSessionRange(mockClosedSession)

      expect(range.start.getTime()).toBe(new Date(mockClosedSession.opened_at).getTime())
      expect(range.end.getTime()).toBe(new Date(mockClosedSession.closed_at!).getTime())
    })
  })
})
