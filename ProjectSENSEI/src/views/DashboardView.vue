<template>
  <UserLayout>
    <h1 class="page-title">Clases disponibles</h1>

    <div class="grid">
      <div v-for="cls in clases" :key="cls._id" class="card">
        <div class="time-label">{{ formatTime(cls.date) }}</div>

        <h3>{{ cls.title }}</h3>
        <p class="desc">{{ cls.description }}</p>

        <div class="bottom">
          <span>{{ cls.available }} plazas disponibles</span>

          <button
            v-if="cls.alreadyReserved"
            class="cancel-btn"
            @click="openCancelModal(cls.reservationId)"
          >
            Cancelar
          </button>

          <button
            v-else
            class="reserve-btn"
            @click="reserve(cls._id)"
            :disabled="cls.available <= 0 || cls.isFinished"
          >
            {{ cls.isFinished ? 'Finalizada' :
              cls.available <= 0 ? 'Llena' :
              'Reservar' }}
          </button>
        </div>
      </div>
    </div>
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3>Cancelar reserva</h3>
        <p>¿Estás seguro de que quieres cancelar esta reserva?</p>

        <div class="modal-buttons">
          <button class="btn-secondary" @click="closeModal">No</button>
          <button class="btn-danger" @click="confirmCancel">
            Sí, cancelar
          </button>
        </div>
      </div>
    </div>
  </UserLayout>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import api from '../services/api'
import UserLayout from '../components/UserLayout.vue'

const router = useRouter()
const userStore = useUserStore()

const clases = ref([])

const showModal = ref(false)
const reservationToCancel = ref(null)

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

const openCancelModal = (reservationId) => {
  reservationToCancel.value = reservationId
  showModal.value = true
}

const confirmCancel = async () => {
  try {
    await api.delete(`/reservas/${reservationToCancel.value}`)
    showModal.value = false
    reservationToCancel.value = null
    await loadClases()
  } catch (error) {
    alert(error.response?.data?.message || 'Error al cancelar')
  }
}

const closeModal = () => {
  showModal.value = false
  reservationToCancel.value = null
}

const formatTime = (date) => {
  const d = new Date(date)
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${day}/${month} ${hours}:${minutes}`
}

onMounted(loadClases)
</script>

<style scoped>
.page-title {
  margin-bottom: 2rem;
  font-size: 26px;
  font-weight: 600;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.card {
  position: relative;
  background: white;
  padding: 2rem;
  border-radius: 18px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  min-height: 220px;
}

h3 {
  padding-top: 0.5em;
  font-size: 2rem;
}

.desc {
  font-size: 1rem;
  color: #87888a;
  font-style: italic;
  margin-top: 0.6em;
}

.date {
  color: #6b7280;
  margin-bottom: 1rem;
}

.bottom {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reserve-btn {
  background: #ec4899;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.2s;
}

.reserve-btn:hover {
  background: #db2777;
}

.reserve-btn:disabled {
  background: #f9a8d4;
  cursor: not-allowed;
}

.cancel-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  width: 350px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.modal h3 {
  padding-bottom: 0.5em;
}

.modal-buttons {
  margin-top: 1.5rem;
  display: flex;
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

</style>