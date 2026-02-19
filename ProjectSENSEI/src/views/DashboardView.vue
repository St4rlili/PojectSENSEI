<template>
  <div>
    <h2>Clases disponibles</h2>

    <button @click="logout">Cerrar sesión</button>

    <div v-if="clases.length === 0">
      No hay clases disponibles
    </div>

    <div v-for="cls in clases" :key="cls._id" class="class-card">
      <h3>{{ cls.title }}</h3>
      <p>{{ cls.description }}</p>
      <p>Fecha: {{ formatDate(cls.date) }}</p>
      <p>Capacidad: {{ cls.capacity }}</p>
      <p>Plazas disponibles: {{ cls.available }}</p>

      <button v-if="cls.alreadyReserved"
              @click="cancelReservation(cls.reservationId)">
        Cancelar reserva
      </button>

      <button v-else
              @click="reserve(cls._id)"
              :disabled="cls.available <= 0 || cls.isFinished">

        {{ cls.isFinished ? 'Clase finalizada' :
          cls.available <= 0 ? 'Clase llena' :
          'Reservar' }}
      </button>
    </div>

    <hr />
    <button @click="goToMyReservations">
      Ver mis reservas
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import api from '../services/api'

const router = useRouter()
const userStore = useUserStore()

const clases = ref([])

const loadClases = async () => {
  try {
    const response = await api.get('/clases')
    clases.value = response.data
  } catch (error) {
    console.error("Error cargando clases:", error)
  }
}

const reserve = async (classId) => {
  try {
    await api.post('/reservas', { classId })
    await loadClases()
  } catch (error) {
    alert(error.response?.data?.message || 'Error al reservar')
  }
}

const cancelReservation = async (reservationId) => {
  try {
    await api.delete(`/reservas/${reservationId}`)
    await loadClases()
  } catch (error) {
    alert(error.response?.data?.message || 'Error al cancelar')
  }
}


const logout = () => {
  userStore.logout()
  router.push('/')
}

const goToMyReservations = () => {
  router.push('/my-reservations')
}

const formatDate = (date) => new Date(date).toLocaleString()

onMounted(loadClases)
</script>
