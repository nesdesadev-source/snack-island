import { supabase } from '../supabase'
import type { User } from '../models/User'

const USER_STORAGE_KEY = 'user'

export const authService = {
  /**
   * Sign up a new user with username and password
   * @param username - Username for the new user
   * @param password - Password for the new user
   * @returns The created user or error
   */
  async signUp(username: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    try {
      // Convert username to email format for Supabase Auth
      const email = `${username}@snackisland.com`

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      })

      if (authError) {
        return { user: null, error: authError }
      }

      if (!authData.user) {
        return { user: null, error: new Error('Failed to create user') }
      }
      const user: User = {
        id: authData.user.id,
        username,
        roleId: 1 // staff role is the default role 
      }

      return { user, error: null }
    } catch (error) {
      return { user: null, error: error as Error }
    }
  },

  /**
   * Sign in a user with username and password
   * @param username - Username
   * @param password - Password
   * @returns The signed-in user or error
   */
  async signIn(username: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    try {
      // Convert username to email format
      const email = `${username}@snackisland.com`

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        return { user: null, error: authError }
      }

      if (!authData.user) {
        return { user: null, error: new Error('Failed to sign in') }
      }

      // Fetch user profile to get role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('roleId')
        .eq('id', authData.user.id)
        .single()

      if (profileError) {
        return { user: null, error: profileError }
      }

      const user: User = {
        id: authData.user.id,
        username,
        roleId: profileData.roleId
      }

      // Store user in localStorage
      this.storeUser(user)

      return { user, error: null }
    } catch (error) {
      return { user: null, error: error as Error }
    }
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return { error }
      }

      // Clear localStorage
      this.clearUser()

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  /**
   * Get the currently authenticated user from localStorage
   * @returns The current user or null
   */
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem(USER_STORAGE_KEY)
      if (!userStr) {
        return null
      }
      return JSON.parse(userStr) as User
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  },

  /**
   * Check if a user is currently authenticated
   * @returns True if user is authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  },

  /**
   * Store user data in localStorage
   * @param user - User to store
   */
  storeUser(user: User): void {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  },

  /**
   * Clear user data from localStorage
   */
  clearUser(): void {
    localStorage.removeItem(USER_STORAGE_KEY)
  },

  /**
   * Check if current user has a specific role
   * @param role - Role to check (0 = Admin, 1 = Staff)
   * @returns True if user has the role, false otherwise
   */
  hasRole(roleId: number): boolean {
    const user = this.getCurrentUser()
    return user?.roleId === roleId
  },

  /**
   * Check if current user is admin
   * @returns True if user is admin, false otherwise
   */
  isAdmin(): boolean {
    return this.hasRole(0)
  },

  /**
   * Check if current user is staff
   * @returns True if user is staff, false otherwise
   */
  isStaff(): boolean {
    return this.hasRole(1)
  }
}

