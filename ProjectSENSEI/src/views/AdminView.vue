<template>
  <div class="layout">
    <aside class="sidebar">
      <h2 class="logo">Admin Miku</h2>

      <nav class="nav">
        <button class="nav-item" @click="showSection = 'create'">
          ✏️ <span>CREAR CLASE</span>
        </button>
        <button class="nav-item" @click="showSection = 'list'">
          📚 <span>VER CLASES</span>
        </button>
        <button class="nav-item logout" @click="logout">
          🚪 <span>CERRAR SESIÓN</span>
        </button>
      </nav>
    </aside>

    <main class="content">
      <!-- Crear Clase -->
      <section v-if="showSection === 'create'" class="section-create">
        <h1>Crear nueva clase</h1>
        <input v-model="title" placeholder="Título" />
        <input v-model="description" placeholder="Descripción" />
        <input v-model="date" type="datetime-local" />
        <input v-model.number="capacity" type="number" placeholder="Capacidad" />
        <button @click="createClass">Crear Clase</button>
      </section>

      <!-- Ver Clases -->
      <section v-if="showSection === 'list'" class="section-list">
        <h1>Clases existentes</h1>
        <div class="grid">
          <div v-for="cls in clases" :key="cls._id" class="class-card">
            <div class="time-label">{{ formatTime(cls.date) }}</div>
            <h3>{{ cls.title }}</h3>
            <p class="desc">{{ cls.description }}</p>
            <p>Capacidad: {{ cls.capacity }}</p>
            <p>Ocupadas: {{ cls.reserved }}</p>

            <div class="card-buttons">
              <button @click="confirmDeleteClass(cls)">Eliminar</button>
              <button @click="openEditModal(cls)">Editar</button>
              <button @click="openAttendanceModal(cls._id)">Asistentes</button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Modal Asistentes -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Asistencia: {{ currentClassTitle }}</h3>
        <div class="attendees-list">
          <div 
            v-for="res in selectedReservations" 
            :key="res._id" 
            class="attendee-item"
          >
            <span class="attendee-name">{{ res.username }}</span>

            <button 
              class="attendance-btn" 
              :class="res.attended ? 'attended' : 'absent'"
              :disabled="res.cancelledLate"
              @click="!res.cancelledLate && toggleAttendance(res)"
            >
              {{ res.attended ? '✅' : '❌' }}
            </button>
          </div>
        </div>
        <button class="btn-secondary full-width" @click="closeModal">Cerrar</button>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal">
        <h3>Eliminar clase</h3>
        <p>¿Estás seguro de que quieres eliminar la clase <strong>{{ classToDelete?.title }}</strong>?</p>

        <div class="modal-buttons">
          <button class="btn-secondary" @click="closeDeleteModal">No</button>
          <button class="btn-danger" @click="deleteClassConfirmed">Sí, eliminar</button>
        </div>
      </div>
    </div>

    <div v-if="showNotification" class="modal-overlay">
      <div class="modal">
        <p>{{ notificationMessage }}</p>
        <div style="margin-top: 1.5rem; text-align:center;">
          <button class="btn-secondary" @click="closeNotification">Cerrar</button>
        </div>
      </div>
    </div>

    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal">
        <h3>Editar clase</h3>
        <input v-model="editForm.title" placeholder="Título" />
        <input v-model="editForm.description" placeholder="Descripción" />
        <input v-model="editForm.date" type="datetime-local" />
        <input v-model.number="editForm.capacity" type="number" placeholder="Capacidad" />
        <div class="modal-buttons">
          <button class="btn-secondary" @click="closeEditModal">Cancelar</button>
          <button class="btn-primary" @click="saveEdit">Guardar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import api from '../services/api'

const router = useRouter()
const userStore = useUserStore()

const showSection = ref('create')

const clases = ref([])
const title = ref('')
const description = ref('')
const date = ref('')
const capacity = ref(0)

const showModal = ref(false)
const selectedReservations = ref([])
const currentClassTitle = ref('')

const showDeleteModal = ref(false)
const classToDelete = ref(null)

const showNotification = ref(false)
const notificationMessage = ref('')

const showEditModal = ref(false)
const editingClass = ref(null)
const editForm = ref({ title: '', description: '', date: '', capacity: 0 })

// Cargar clases
const loadClases = async () => {
  try {
    const res = await api.get('/clases')
    clases.value = res.data
  } catch (err) {
    console.error(err)
  }
}

// Crear clase
const createClass = async () => {
  if (!title.value.trim()) {
    notify('Debes ingresar un título para la clase')
    return
  }

  if (!date.value) {
    notify('Debes seleccionar una fecha para la clase')
    return
  }

  const fechaClase = new Date(date.value) // <- mover aquí

  if (isNaN(fechaClase.getTime()) || fechaClase < new Date()) {
    notify('La fecha debe ser válida y futura')
    return
  }

  if (!capacity.value || !Number.isInteger(capacity.value) || capacity.value <= 0) {
    notify('La capacidad debe ser un número entero mayor a 0')
    return
  }

  try {
    await api.post('/clases', {
      title: title.value,
      description: description.value,
      date: fechaClase.toISOString(),
      capacity: capacity.value
    })

    title.value = ''
    description.value = ''
    date.value = ''
    capacity.value = 0

    notify('Clase creada correctamente!')
    loadClases()
    showSection.value = 'list'
  } catch (err) {
    console.error(err)
    notify('Error al crear la clase')
  }
}

// Modal asistencia
const openAttendanceModal = async (classId) => {
  showModal.value = true
  try {
    const res = await api.get(`/reservas/class/${classId}`)
    selectedReservations.value = res.data
    const cls = clases.value.find(c => c._id === classId)
    currentClassTitle.value = cls?.title || 'Clase'
  } catch (err) {
    alert('Error cargando asistentes')
  }
}

const closeModal = () => {
  showModal.value = false
  selectedReservations.value = []
}

const toggleAttendance = async (res) => {
  try {
    await api.put(`/reservas/${res._id}/attendance`, { attended: !res.attended })
    res.attended = !res.attended
  } catch (err) {
    alert('Error actualizando asistencia')
  }
}

const logout = () => {
  userStore.logout()
  router.push('/')
}

const formatTime = (date) => {
  const d = new Date(date)
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${day}/${month} ${hours}:${minutes}`
}

// Modal borrar clase
const confirmDeleteClass = (cls) => {
  classToDelete.value = cls
  showDeleteModal.value = true
}

const deleteClassConfirmed = async () => {
  if (!classToDelete.value) return

  try {
    await api.delete(`/clases/${classToDelete.value._id}`)
    showDeleteModal.value = false
    classToDelete.value = null
    loadClases()
  } catch (err) {
    alert('Error al eliminar la clase')
  }
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  classToDelete.value = null
}

// Modal notificación
const notify = (message) => {
  notificationMessage.value = message
  showNotification.value = true
}

const closeNotification = () => {
  showNotification.value = false
  notificationMessage.value = ''
}

const openEditModal = (cls) => {
  editingClass.value = cls
  const d = new Date(cls.date)
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString().slice(0, 16)
  editForm.value = {
    title: cls.title,
    description: cls.description,
    date: local,
    capacity: cls.capacity
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingClass.value = null
}

const saveEdit = async () => {
  if (!editForm.value.title.trim()) {
    notify('El título es obligatorio')
    return
  }
  if (!editForm.value.date) {
    notify('La fecha es obligatoria')
    return
  }
  if (!editForm.value.capacity || editForm.value.capacity <= 0) {
    notify('La capacidad debe ser mayor a 0')
    return
  }
  try {
    await api.put(`/clases/${editingClass.value._id}`, {
      title: editForm.value.title,
      description: editForm.value.description,
      date: new Date(editForm.value.date).toISOString(),
      capacity: editForm.value.capacity
    })
    closeEditModal()
    notify('Clase actualizada correctamente')
    loadClases()
  } catch (err) {
    notify('Error al actualizar la clase')
  }
}

onMounted(loadClases)
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background: #fdf2f8;
  font-family: sans-serif;
}

.sidebar {
  width: 250px;
  background: #ec4899;
  color: white;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
}

.sidebar .logo {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 3rem;
  text-align: center;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
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
}

.content {
  flex: 1;
  padding: 3rem;
}

.section-create h1{
  padding-bottom: 0.7em;
}

.section-create input {
  display: block;
  width: 25%;
  padding: 0.7rem;
  margin-bottom: 0.8rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.section-create input:focus {
  outline: none;
  border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236,72,153,0.15);
}

.section-create button {
  background: #ec4899;
  color: white;
  border-radius: 10px;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
  margin-top: 0.75rem;
  width: 25%;
}

.section-create button:hover {
  background: #db2777;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.section-list h1{
  padding-bottom: 0.7em;
}

.class-card {
  background: white;
  padding: 1.5rem;
  border-radius: 18px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  min-height: 260px;
  position: relative;
}

.time-label {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 0.8rem;
  text-align: center;
}

.class-card h3 {
  padding-top: 0.5em;
  font-size: 2rem;
}

.class-card p {
  padding-top: 0.5em;
}

.desc {
  font-size: 1rem;
  color: #87888a;
  font-style: italic;
  margin: 0.1em 0 0.75em 0;
}

.card-buttons {
  margin-top: auto;
  display: flex;
  gap: 0.5rem;
}

.card-buttons button {
  flex: 1;
  border-radius: 10px;
  padding: 0.5rem;
  cursor: pointer;
}

.card-buttons button:first-child {
  background: #ef4444;
  color: white;
}

.card-buttons button:first-child:hover {
  background: #dc2626;
}

.card-buttons button:last-child {
  background: #ec4899;
  color: white;
}

.card-buttons button:last-child:hover {
  background: #db2777;
}

.modal-overlay {
  position: fixed;
  top:0; left:0;
  width: 100%; height:100%;
  background: rgba(0,0,0,0.4);
  display:flex; justify-content:center; align-items:center;
  z-index:1000;
}

.modal-content {
  background:white;
  padding:2rem;
  border-radius:16px;
  max-height:80vh;
  width:400px;
  overflow-y:auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.modal {
  background:white;
  padding:2rem;
  border-radius:16px;
  width: 350px;
  max-height: 80vh;
  overflow-y: auto;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.modal-buttons {
  margin-top: 1.5rem;
  display:flex;
  justify-content: space-between;
}

.btn-secondary {
  background: #e5e7eb;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  cursor: pointer;
}

.btn-danger {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  cursor: pointer;
}

.attendees-list {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.attendee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  font-size: 1.1rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.attendee-name {
  font-weight: 500;
}

.attendance-btn {
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: 0.2s;
}

.attendance-btn.attended {
  background-color: #dcfce7;
  color: #16a34a;
}

.attendance-btn.absent {
  background-color: #fee2e2;
  color: #b91c1c;
}

.attendance-btn:hover {
  transform: scale(1.1);
}

.attendance-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary.full-width {
  width: 100%;
  margin-top: 1rem;
}

.btn-primary {
  background: #ec4899;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  cursor: pointer;
}

.btn-primary:hover {
  background: #db2777;
}

.modal input {
  display: block;
  width: 100%;
  padding: 0.6rem;
  margin-bottom: 0.7rem;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  box-sizing: border-box;
}

.modal input:focus {
  outline: none;
  border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236,72,153,0.15);
}

</style>