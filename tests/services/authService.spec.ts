import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authService } from '../../src/services/authService'
import type { User } from '../../src/models/User'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
})

// Mock Supabase
vi.mock('../../src/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ error: null })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: { role: 0 }, error: null }))
        }))
      }))
    }))
  }
}))

describe('authService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('getCurrentUser', () => {
    it('should return null when no user is stored', () => {
      const user = authService.getCurrentUser()
      expect(user).toBeNull()
    })

    it('should return user when stored in localStorage', () => {
      const mockUser: User = { id: '123', username: 'testuser', role: 0 }
      localStorage.setItem('user', JSON.stringify(mockUser))
      
      const user = authService.getCurrentUser()
      expect(user).toEqual(mockUser)
    })
  })

  describe('storeUser', () => {
    it('should store user in localStorage', () => {
      const mockUser: User = { id: '123', username: 'testuser', role: 0 }
      authService.storeUser(mockUser)
      
      const stored = localStorage.getItem('user')
      expect(stored).toBe(JSON.stringify(mockUser))
    })
  })

  describe('clearUser', () => {
    it('should remove user from localStorage', () => {
      const mockUser: User = { id: '123', username: 'testuser', role: 0 }
      localStorage.setItem('user', JSON.stringify(mockUser))
      
      authService.clearUser()
      
      const stored = localStorage.getItem('user')
      expect(stored).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('should return false when no user is stored', () => {
      expect(authService.isAuthenticated()).toBe(false)
    })

    it('should return true when user is stored', () => {
      const mockUser: User = { id: '123', username: 'testuser', role: 0 }
      localStorage.setItem('user', JSON.stringify(mockUser))
      
      expect(authService.isAuthenticated()).toBe(true)
    })
  })

  describe('hasRole', () => {
    it('should return true when user has the specified role', () => {
      const mockUser: User = { id: '123', username: 'testuser', role: 0 }
      localStorage.setItem('user', JSON.stringify(mockUser))
      
      expect(authService.hasRole(0)).toBe(true)
      expect(authService.hasRole(1)).toBe(false)
    })

    it('should return false when no user is stored', () => {
      expect(authService.hasRole(0)).toBe(false)
    })
  })

  describe('isAdmin', () => {
    it('should return true for admin user', () => {
      const mockUser: User = { id: '123', username: 'admin', role: 0 }
      localStorage.setItem('user', JSON.stringify(mockUser))
      
      expect(authService.isAdmin()).toBe(true)
    })

    it('should return false for staff user', () => {
      const mockUser: User = { id: '123', username: 'staff', role: 1 }
      localStorage.setItem('user', JSON.stringify(mockUser))
      
      expect(authService.isAdmin()).toBe(false)
    })
  })

  describe('isStaff', () => {
    it('should return true for staff user', () => {
      const mockUser: User = { id: '123', username: 'staff', role: 1 }
      localStorage.setItem('user', JSON.stringify(mockUser))
      
      expect(authService.isStaff()).toBe(true)
    })

    it('should return false for admin user', () => {
      const mockUser: User = { id: '123', username: 'admin', role: 0 }
      localStorage.setItem('user', JSON.stringify(mockUser))
      
      expect(authService.isStaff()).toBe(false)
    })
  })
})

