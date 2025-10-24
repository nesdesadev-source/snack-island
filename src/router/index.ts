import { createRouter, createWebHistory } from 'vue-router'
import OrderPage from '../components/OrderPage.vue'
import Dashboard from '../components/Dashboard.vue'
import Inventory from '../components/Inventory.vue'
import Sales from '../components/Sales.vue'
import Expenses from '../components/Expenses.vue'
import Users from '../components/Users.vue'
import Menu from '../components/Menu.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/menu',
    name: 'Menu',
    component: Menu
  },
  {
    path: '/order',
    name: 'Order',
    component: OrderPage
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: Inventory
  },
  {
    path: '/sales',
    name: 'Sales',
    component: Sales
  },
  {
    path: '/expenses',
    name: 'Expenses',
    component: Expenses
  },
  {
    path: '/users',
    name: 'Users',
    component: Users
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
