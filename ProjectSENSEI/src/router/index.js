import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DashboardView from '../views/DashboardView.vue'
import AdminView from '../views/AdminView.vue'
import MyReservationsView from '../views/MyReservationsView.vue'
import { jwtDecode } from 'jwt-decode'

const routes = [
  { path: '/', component: LoginView },
  { path: '/register', component: RegisterView },
  { path: '/dashboard', component: DashboardView },
  { path: '/admin', component: AdminView },
  { path: '/my-reservations', component: MyReservationsView }

] 

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('token')

  if (!token && to.path !== '/' && to.path !== '/register') {
    return next('/')
  }

  if (token) {
    try {
      const user = jwtDecode(token)

      // Verificar expiración
      const currentTime = Date.now() / 1000
      if (user.exp < currentTime) {
        sessionStorage.removeItem('token')
        return next('/')
      }

      if (to.path === '/admin' && user.role !== 'admin') {
        return next('/dashboard')
      }

    } catch (error) {
      sessionStorage.removeItem('token')
      return next('/')
    }
  }

  next()
})

export default router