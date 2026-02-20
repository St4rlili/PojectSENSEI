<template>
  <div class="layout">
        <aside class="sidebar">
        <span class="logo">{{ userStore.user?.username || userStore.user?.name || 'Usuario' }}</span>

        <nav class="nav">
            <button class="nav-item" @click="$router.push('/dashboard')">
            📚 <span>CLASES</span>
            </button>

            <button class="nav-item" @click="$router.push('/my-reservations')">
            📅 <span>MIS RESERVAS</span>
            </button>
        </nav>

        <button class="nav-item logout" @click="logout">
            🚪 <span>CERRAR SESIÓN</span>
        </button>
        </aside>


    <main class="content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const logout = () => {
  userStore.logout()
  router.push('/')
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background: #fdf2f8;
}

.sidebar {
  width: 250px;
  background: #ec4899;
  color: white;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
}

.logo {
  margin-bottom: 3rem;
  font-size: 22px;
  font-weight: bold;
  text-align: center;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: none;
  color: white;
  font-size: 15px;
  padding: 1.5rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.2s;
  background: rgba(255,255,255,0.15);
}

.nav-item:hover {
  background: rgba(255,255,255,0.3);
}

.logout {
  margin-top: auto;
  background: rgba(255,255,255,0.15);
}

.content {
  flex: 1;
  padding: 3rem;
}
</style>