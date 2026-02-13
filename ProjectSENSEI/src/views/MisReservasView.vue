<template>
  <div>
    <h2>Mis reservas</h2>

    <button @click="goBack">Volver</button>

    <div v-for="res in reservations" :key="res._id">
      <p>Clase ID: {{ res.classId }}</p>
      <p>Asistencia: {{ res.attended ? 'Sí' : 'No' }}</p>

      <button @click="cancel(res._id)">
        Cancelar
      </button>

      <hr />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/userStore'
import { useRouter } from 'vue-router'
import api from '../services/api'

const reservations = ref([])
const userStore = useUserStore()
const router = useRouter()

const loadReservations = async () => {
  const response = await api.get('/reservations/my', {
    data: {
      username: userStore.username,
      role: userStore.role
    }
  })
  reservations.value = response.data
}

const cancel = async (id) => {
  await api.delete(`/reservations/${id}`, {
    data: {
      username: userStore.username,
      role: userStore.role
    }
  })

  loadReservations()
}

const goBack = () => {
  router.push('/dashboard')
}

onMounted(loadReservations)
</script>