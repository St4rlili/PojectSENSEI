import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DashboardView from '../views/DashboardView.vue'
import AdminView from '../views/AdminView.vue'
import MisReservasView from '../views/MisReservasView.vue'


const routes = [
  { path: '/', component: LoginView },
  { path: '/register', component: RegisterView },
  { path: '/dashboard', component: DashboardView },
  { path: '/admin', component: AdminView },
  { path: '/mis-reservas', component: MisReservasView }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
