<template>
  <div class="users">
    <div class="users-header">
      <h1>User Management</h1>
      <button class="add-user-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add New User
      </button>
    </div>
    
    <div class="users-filters">
      <div class="search-box">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input type="text" placeholder="Search users..." v-model="searchQuery" />
      </div>
      <select v-model="selectedRole" class="role-filter">
        <option value="">All Roles</option>
        <option value="admin">Admin</option>
        <option value="manager">Manager</option>
        <option value="employee">Employee</option>
        <option value="customer">Customer</option>
      </select>
      <select v-model="selectedStatus" class="status-filter">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="pending">Pending</option>
      </select>
    </div>
    
    <div class="users-grid">
      <div class="user-card" v-for="user in filteredUsers" :key="user.id">
        <div class="user-avatar">
          <img :src="user.avatar" :alt="user.name" v-if="user.avatar" />
          <div class="avatar-placeholder" v-else>
            {{ user.name.charAt(0).toUpperCase() }}
          </div>
        </div>
        
        <div class="user-info">
          <h3 class="user-name">{{ user.name }}</h3>
          <p class="user-email">{{ user.email }}</p>
          <div class="user-role">
            <span class="role-badge" :class="user.role">
              {{ user.role }}
            </span>
          </div>
        </div>
        
        <div class="user-stats">
          <div class="stat">
            <span class="stat-label">Orders</span>
            <span class="stat-value">{{ user.orders }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Spent</span>
            <span class="stat-value">${{ user.totalSpent.toFixed(2) }}</span>
          </div>
        </div>
        
        <div class="user-status">
          <span class="status-badge" :class="user.status">
            {{ user.status }}
          </span>
        </div>
        
        <div class="user-actions">
          <button class="action-btn edit" @click="editUser(user.id)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="action-btn delete" @click="deleteUser(user.id)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const searchQuery = ref('')
const selectedRole = ref('')
const selectedStatus = ref('')

const users = ref([
  { 
    id: 1, 
    name: 'John Doe', 
    email: 'john.doe@example.com', 
    role: 'admin', 
    status: 'active', 
    orders: 45, 
    totalSpent: 1250.75,
    avatar: null
  },
  { 
    id: 2, 
    name: 'Jane Smith', 
    email: 'jane.smith@example.com', 
    role: 'manager', 
    status: 'active', 
    orders: 32, 
    totalSpent: 890.50,
    avatar: null
  },
  { 
    id: 3, 
    name: 'Mike Johnson', 
    email: 'mike.johnson@example.com', 
    role: 'employee', 
    status: 'active', 
    orders: 18, 
    totalSpent: 450.25,
    avatar: null
  },
  { 
    id: 4, 
    name: 'Sarah Wilson', 
    email: 'sarah.wilson@example.com', 
    role: 'customer', 
    status: 'active', 
    orders: 67, 
    totalSpent: 2100.00,
    avatar: null
  },
  { 
    id: 5, 
    name: 'David Brown', 
    email: 'david.brown@example.com', 
    role: 'customer', 
    status: 'inactive', 
    orders: 12, 
    totalSpent: 320.75,
    avatar: null
  },
  { 
    id: 6, 
    name: 'Emily Davis', 
    email: 'emily.davis@example.com', 
    role: 'customer', 
    status: 'pending', 
    orders: 0, 
    totalSpent: 0.00,
    avatar: null
  },
])

const filteredUsers = computed(() => {
  let filtered = users.value
  
  if (searchQuery.value) {
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  if (selectedRole.value) {
    filtered = filtered.filter(user => user.role === selectedRole.value)
  }
  
  if (selectedStatus.value) {
    filtered = filtered.filter(user => user.status === selectedStatus.value)
  }
  
  return filtered
})

const editUser = (userId: number) => {
  console.log('Edit user:', userId)
}

const deleteUser = (userId: number) => {
  console.log('Delete user:', userId)
}
</script>

<style scoped>
.users {
  padding: 0;
}

@media (max-width: 480px) {
  .users {
    padding: 0;
  }
  
  .users-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .users-header h1 {
    font-size: 1.5rem;
  }
  
  .users-filters {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .search-box {
    max-width: none;
  }
  
  .users-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .user-card {
    padding: 1rem;
  }
  
  .user-stats {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .stat {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .stat-label {
    margin-bottom: 0;
  }
  
  .stat-value {
    font-size: 1rem;
  }
}

.users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.users-header h1 {
  font-size: 2rem;
  color: #343a40;
  margin: 0;
}

.add-user-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s;
}

.add-user-btn:hover {
  transform: translateY(-1px);
}

.users-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 300px;
}

.search-box svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-box input:focus {
  border-color: #667eea;
}

.role-filter,
.status-filter {
  padding: 0.75rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  outline: none;
  cursor: pointer;
  min-width: 120px;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.user-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.user-avatar {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.user-avatar img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
}

.user-info {
  text-align: center;
  margin-bottom: 1rem;
}

.user-name {
  margin: 0 0 0.5rem 0;
  color: #343a40;
  font-size: 1.1rem;
  font-weight: 600;
}

.user-email {
  margin: 0 0 0.75rem 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
}

.role-badge.admin { background: #f8d7da; color: #721c24; }
.role-badge.manager { background: #d1ecf1; color: #0c5460; }
.role-badge.employee { background: #d4edda; color: #155724; }
.role-badge.customer { background: #e2e3e5; color: #383d41; }

.user-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1rem;
  padding: 1rem 0;
  border-top: 1px solid #f1f3f4;
  border-bottom: 1px solid #f1f3f4;
}

.stat {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  color: #343a40;
}

.user-status {
  text-align: center;
  margin-bottom: 1rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.active { background: #d4edda; color: #155724; }
.status-badge.inactive { background: #f8d7da; color: #721c24; }
.status-badge.pending { background: #fff3cd; color: #856404; }

.user-actions {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn.edit {
  background: #e3f2fd;
  color: #1976d2;
}

.action-btn.edit:hover {
  background: #1976d2;
  color: white;
}

.action-btn.delete {
  background: #f8d7da;
  color: #721c24;
}

.action-btn.delete:hover {
  background: #721c24;
  color: white;
}

@media (max-width: 480px) {
  .users-filters {
    flex-direction: column;
  }
  
  .search-box {
    max-width: none;
  }
  
  .users-grid {
    grid-template-columns: 1fr;
  }
}
</style>
