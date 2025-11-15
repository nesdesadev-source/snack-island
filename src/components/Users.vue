<template>
  <div class="users">
    <div class="users-header">
      <h1>User Management</h1>
      <button class="add-user-btn" @click="navigateToSignup">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add New User
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading users...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadUsers" class="retry-btn">Retry</button>
    </div>
    
    <template v-else>
      <div class="users-filters">
        <div class="search-box">
          <input type="text" placeholder="Search users..." v-model="searchQuery" />
        </div>
        <select v-model="selectedRole" class="role-filter">
          <option value="">All Roles</option>
          <option value="0">Administrator</option>
          <option value="1">Staff</option>
        </select>
      </div>
      
      <div v-if="filteredUsers.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <p>No users found</p>
      </div>

      <div v-else class="users-grid">
        <div class="user-card" v-for="user in filteredUsers" :key="user.id">
          <div class="user-avatar">
            <div class="avatar-placeholder">
              {{ user.username.charAt(0).toUpperCase() }}
            </div>
          </div>
          
          <div class="user-info">
            <h3 class="user-name">{{ user.username }}</h3>
            <p class="user-email">{{ user.email }}</p>
            <div class="user-role">
              <span class="role-badge" :class="getRoleBadgeClass(user.role)">
                {{ getRoleLabel(user.role) }}
              </span>
            </div>
          </div>
          
          <div class="user-meta">
            <div class="meta-item">
              <span class="meta-label">Joined</span>
              <span class="meta-value">{{ formatDate(user.created_at) }}</span>
            </div>
          </div>
          
          <div class="user-actions">
            <button 
              class="action-btn edit" 
              @click="toggleRoleModal(user)"
              title="Change Role"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button 
              class="action-btn delete" 
              @click="confirmDeleteUser(user)"
              title="Delete User"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Role Change Modal -->
    <div v-if="showRoleModal" class="modal-overlay" @click="showRoleModal = false">
      <div class="modal-content" @click.stop>
        <h3>Change User Role</h3>
        <p class="modal-user-info">{{ selectedUser?.username }}</p>
        <div class="role-options">
          <label class="role-option">
            <input type="radio" v-model="newRole" :value="0" />
            <span>Administrator</span>
          </label>
          <label class="role-option">
            <input type="radio" v-model="newRole" :value="1" />
            <span>Staff</span>
          </label>
        </div>
        <div class="modal-actions">
          <button @click="showRoleModal = false" class="btn-cancel">Cancel</button>
          <button @click="updateRole" class="btn-confirm">Update Role</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <h3>Delete User</h3>
        <p>Are you sure you want to delete <strong>{{ selectedUser?.username }}</strong>?</p>
        <p class="warning-text">This action cannot be undone.</p>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn-cancel">Cancel</button>
          <button @click="deleteUser" class="btn-delete">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userService, type UserWithProfile } from '../services/userService'

const router = useRouter()

const searchQuery = ref('')
const selectedRole = ref('')
const users = ref<UserWithProfile[]>([])
const loading = ref(true)
const error = ref('')

const showRoleModal = ref(false)
const showDeleteModal = ref(false)
const selectedUser = ref<UserWithProfile | null>(null)
const newRole = ref(0)

onMounted(() => {
  loadUsers()
})

const loadUsers = async () => {
  loading.value = true
  error.value = ''
  
  const { users: fetchedUsers, error: fetchError } = await userService.getAllUsers()
  
  if (fetchError) {
    error.value = fetchError.message || 'Failed to load users'
    loading.value = false
    return
  }
  
  users.value = fetchedUsers || []
  loading.value = false
}

const filteredUsers = computed(() => {
  let filtered = users.value
  
  if (searchQuery.value) {
    filtered = filtered.filter(user => 
      user.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  if (selectedRole.value !== '') {
    filtered = filtered.filter(user => user.role === Number(selectedRole.value))
  }
  
  return filtered
})

const getRoleLabel = (role: number) => {
  return role === 0 ? 'Administrator' : 'Staff'
}

const getRoleBadgeClass = (role: number) => {
  return role === 0 ? 'admin' : 'staff'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const toggleRoleModal = (user: UserWithProfile) => {
  selectedUser.value = user
  newRole.value = user.role
  showRoleModal.value = true
}

const updateRole = async () => {
  if (!selectedUser.value) return
  
  const { error: updateError } = await userService.updateUserRole(selectedUser.value.id, newRole.value)
  
  if (updateError) {
    alert(`Failed to update role: ${updateError.message}`)
    return
  }
  
  // Update local data
  const userIndex = users.value.findIndex(u => u.id === selectedUser.value?.id)
  if (userIndex !== -1 && users.value[userIndex]) {
    users.value[userIndex].role = newRole.value
  }
  
  showRoleModal.value = false
}

const confirmDeleteUser = (user: UserWithProfile) => {
  selectedUser.value = user
  showDeleteModal.value = true
}

const deleteUser = async () => {
  if (!selectedUser.value) return
  
  const { error: deleteError } = await userService.deleteUser(selectedUser.value.id)
  
  if (deleteError) {
    alert(`Failed to delete user: ${deleteError.message}`)
    return
  }
  
  // Remove from local data
  users.value = users.value.filter(u => u.id !== selectedUser.value?.id)
  
  showDeleteModal.value = false
}

const navigateToSignup = () => {
  router.push('/signup')
}
</script>

<style scoped>
.users {
  padding: 0;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p,
.error-state p,
.empty-state p {
  margin-top: 1rem;
  color: #6c757d;
  font-size: 1rem;
}

.empty-state svg {
  color: #dee2e6;
  margin-bottom: 1rem;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.retry-btn:hover {
  background: #5568d3;
}

.user-meta {
  text-align: center;
  padding: 1rem 0;
  border-top: 1px solid #f1f3f4;
  border-bottom: 1px solid #f1f3f4;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.meta-label {
  font-size: 0.8rem;
  color: #6c757d;
}

.meta-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #343a40;
}

.role-badge.staff {
  background: #d4edda;
  color: #155724;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin: 0 0 1rem 0;
  color: #343a40;
  font-size: 1.5rem;
}

.modal-content p {
  margin: 0 0 1.5rem 0;
  color: #6c757d;
}

.modal-user-info {
  font-weight: 600;
  color: #343a40 !important;
}

.warning-text {
  color: #dc3545 !important;
  font-size: 0.9rem;
}

.role-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.role-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.role-option:hover {
  border-color: #667eea;
  background: #f8f9fa;
}

.role-option input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.role-option span {
  font-weight: 500;
  color: #343a40;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-cancel,
.btn-confirm,
.btn-delete {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #e9ecef;
  color: #495057;
}

.btn-cancel:hover {
  background: #dee2e6;
}

.btn-confirm {
  background: #667eea;
  color: white;
}

.btn-confirm:hover {
  background: #5568d3;
}

.btn-delete {
  background: #dc3545;
  color: white;
}

.btn-delete:hover {
  background: #c82333;
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

  .modal-content {
    padding: 1.5rem;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-confirm,
  .btn-delete {
    width: 100%;
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
  margin-right: 50px
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
