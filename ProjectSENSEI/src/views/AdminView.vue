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
      <p>Ocupadas: {{ cls.reserved }}</p>
      <p>Disponibles: {{ cls.available }}</p>


      <button @click="deleteClass(cls._id)">Eliminar</button>
      <button @click="openAttendanceModal(cls._id)">Ver asistentes</button>

    </div>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Asistencia: {{ currentClassTitle }}</h3>
        <div class="attendees-list">
          <div v-for="res in selectedReservations" :key="res._id" class="attendee-item">
            <span>{{ res.username }}</span>
            <button @click="toggleAttendance(res)">
              {{ res.attended ? 'Marcar como no asistió' : 'Marcar como asistió' }}
            </button>
          </div>
        </div>
        <button @click="closeModal">Cerrar</button>
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
const showModal = ref(false)
const selectedReservations = ref([])
const currentClassTitle = ref('')

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

const viewAttendance = async (classId) => {
  selectedClass.value = classId
  try {
    const response = await api.get(`/reservas/class/${classId}`)
    selectedReservations.value = response.data
  } catch (error) {
    console.error("Error cargando asistentes:", error)
    alert('Error al cargar reservas')
  }
}

const openAttendanceModal = async (classId) => {
  showModal.value = true
  try {
    const response = await api.get(`/reservas/class/${classId}`)
    selectedReservations.value = response.data
    const clase = clases.value.find(c => c._id === classId)
    currentClassTitle.value = clase?.title || 'Clase'
  } catch (err) {
    alert('Error cargando asistentes')
  }
}

const closeModal = () => {
  showModal.value = false
  selectedReservations.value = []
}

const toggleAttendance = async (reservation) => {
  try {
    await api.put(`/reservas/${reservation._id}/attendance`, {
      attended: !reservation.attended
    })
    reservation.attended = !reservation.attended
  } catch (err) {
    alert('Error actualizando asistencia')
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  max-height: 80vh;
  width: 400px;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}
.attendees-list {
  overflow-y: auto;
  max-height: 60vh;
  margin: 1rem 0;
}
.attendee-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
</style>
