export interface User {
  id: string
  username: string
  roleId: number // 0 = Admin, 1 = Staff
}

export interface UserProfile {
  id: string
  roleId: number
  created_at: string
  email: string
}

