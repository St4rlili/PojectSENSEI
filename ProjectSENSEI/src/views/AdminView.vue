<template>
  <div class="admin">
    <h2>Panel Admin - Miku</h2>

    <button @click="logout">Cerrar sesión</button>

    <hr />

    <h3>Crear nueva clase</h3>

    <input v-model="title" placeholder="Título" />
    <input v-model="description" placeholder="Descripción" />
    <input v-model="date" type="datetime-local" />
    <input v-model.number="capacity" type="number" placeholder="Capacidad" />

    <button @click="createClass">Crear Clase</button>

    <hr />

    <h3>Clases existentes</h3>

    <div v-for="cls in clases" :key="cls._id" class="class-card">
      <h4>{{ cls.title }}</h4>
      <p>{{ cls.description }}</p>
      <p>{{ formatDate(cls.date) }}</p>
      <p>Capacidad: {{ cls.capacity }}</p>

      <button @click="deleteClass(cls._id)">Eliminar</button>
      <button @click="viewReservations(cls._id)">Ver Reservas</button>
    </div>

    <div v-if="selectedReservations.length > 0">
      <hr />
      <h3>Reservas de esta clase</h3>

      <div v-for="res in selectedReservations" :key="res._id">
        <p>{{ res.username }} - Asistió: {{ res.attended ? 'Sí' : 'No' }}</p>
        <button @click="toggleAttendance(res)">
          Cambiar asistencia
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/userStore'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const userStore = useUserStore()

const clases = ref([])
const selectedReservations = ref([])

const title = ref('')
const description = ref('')
const date = ref('')
const capacity = ref(0)

const loadClases = async () => {
  try {
    const response = await api.get('/clases')
    clases.value = response.data
  } catch (error) {
    console.error("Error cargando clases:", error)
  }
}

const createClass = async () => {
  try {
    await api.post('/clases', {
      title: title.value,
      description: description.value,
      date: date.value,
      capacity: capacity.value
    })

    title.value = ''
    description.value = ''
    date.value = ''
    capacity.value = 0

    loadClases()
  } catch (error) {
    console.error("Error creando clase:", error)
    alert('Error al crear clase')
  }
}

const deleteClass = async (id) => {
  try {
    await api.delete(`/clases/${id}`)
    loadClases()
  } catch (error) {
    console.error("Error eliminando clase:", error)
    alert('Error al eliminar clase')
  }
}

const viewReservations = async (classId) => {
  try {
    const response = await api.get(`/reservas/class/${classId}`)
    selectedReservations.value = response.data
  } catch (error) {
    console.error("Error cargando reservas:", error)
  }
}

const toggleAttendance = async (reservation) => {
  try {
    await api.patch(`/reservas/${reservation._id}/attendance`, {
      attended: !reservation.attended
    })

    viewReservations(reservation.classId)
  } catch (error) {
    console.error("Error cambiando asistencia:", error)
    alert('Error al actualizar asistencia')
  }
}

const logout = () => {
  userStore.logout()
  router.push('/')
}

const formatDate = (date) => new Date(date).toLocaleString()

onMounted(loadClases)
</script>

<style scoped>
.admin {
  max-width: 700px;
  margin: auto;
  padding: 1rem;
}

.class-card {
  border: 1px solid #ccc;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
}
</style>
