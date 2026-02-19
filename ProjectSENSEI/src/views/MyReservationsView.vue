<template>
  <div>
    <h2>Mis Reservas</h2>

    <div v-if="reservas.length === 0">
      No tienes reservas
    </div>

    <div v-for="cls in reservas" :key="cls._id" class="class-card">
      <h3>{{ cls.title }}</h3>
      <p>{{ cls.description }}</p>
      <p>Fecha: {{ formatDate(cls.date) }}</p>

      <button @click="cancelReservation(cls.reservationId)">
        Cancelar
      </button>

    </div>

    <button @click="goBack">Volver</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const reservas = ref([])

const loadReservations = async () => {
  try {
    const response = await api.get('/reservas/my')
    reservas.value = response.data
  } catch (error) {
    console.error(error)
  }
}

const cancelReservation = async (reservationId) => {
  try {
    await api.delete(`/reservas/${reservationId}`)
    loadReservations()
  } catch (error) {
    alert(error.response?.data?.message || 'Error al cancelar')
  }
}

const goBack = () => {
  router.push('/dashboard')
}

const formatDate = (date) => new Date(date).toLocaleString()

onMounted(loadReservations)
</script>
