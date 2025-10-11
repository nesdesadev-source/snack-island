<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <p>Welcome to Snack Island Management System</p>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <div class="stat-content">
          <h3>Total Items</h3>
          <p class="stat-number">1,234</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>x
        <div class="stat-content">
          <h3>Today's Sales</h3>
          <p class="stat-number">$2,456</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div class="stat-content">
          <h3>Active Users</h3>
          <p class="stat-number">89</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </div>
        <div class="stat-content">
          <h3>Orders</h3>
          <p class="stat-number">156</p>
        </div>
      </div>
    </div>
    
    <div class="dashboard-content">
      <div class="content-section">
        <h2>Recent Activity</h2>
        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-icon">📦</div>
            <div class="activity-content">
              <p><strong>New inventory added:</strong> Chocolate bars (50 units)</p>
              <span class="activity-time">2 hours ago</span>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon">💰</div>
            <div class="activity-content">
              <p><strong>Sale completed:</strong> $45.99</p>
              <span class="activity-time">4 hours ago</span>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon">👤</div>
            <div class="activity-content">
              <p><strong>New user registered:</strong> John Doe</p>
              <span class="activity-time">6 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 0;
}

@media (max-width: 480px) {
  .dashboard {
    padding: 0;
  }
  
  .dashboard-header h1 {
    font-size: 1.5rem;
  }
  
  .dashboard-header p {
    font-size: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .dashboard-content {
    padding: 1rem;
  }
  
  .content-section h2 {
    font-size: 1.1rem;
  }
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  color: #343a40;
  margin-bottom: 0.5rem;
}

.dashboard-header p {
  color: #6c757d;
  font-size: 1.1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-content h3 {
  margin: 0 0 0.5rem 0;
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
}

.stat-number {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #343a40;
}

.dashboard-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.content-section h2 {
  margin: 0 0 1.5rem 0;
  color: #343a40;
  font-size: 1.3rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.activity-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.activity-content p {
  margin: 0 0 0.25rem 0;
  color: #343a40;
}

.activity-time {
  font-size: 0.85rem;
  color: #6c757d;
}
</style>
