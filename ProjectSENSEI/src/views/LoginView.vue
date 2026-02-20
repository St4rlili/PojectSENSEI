<template>
  <div class="derecha"></div>
  <div class="login-container">
    <img id = "logoNombre" src = "../assets/logoNombre.png"/>
    <img id = "logoImagen" src = "../assets/logoImagen.PNG"/>
    <h2>Bienvenid@</h2>
    <input v-model="username" placeholder="Usuario" />
    <input v-model="password" type="password" placeholder="Contraseña" />

    <button id = "login" @click="login">Entrar</button>

    <p v-if="error">{{ error }}</p>

    <p>¿No tienes una cuenta? 
      <button id = "registro" @click="goToRegister">Regístrate aquí</button>
    </p>
  </div>
</template>

<style scoped>
  * {
    font-family: 'Inter', sans-serif;
  }

  .derecha { 
    display: flex;
    justify-content: center; 
    align-items: center;
    position: fixed; 
    right: 0; 
    top: 0; 
    width: 25%; 
    height: 100%; 
    background-image: url('../assets/clase.jpg'); 
    background-size: cover; 
    opacity: 0.8;
  }

  #logoNombre {
    position: absolute; 
    left: 0;
    top: 0;
    width: 18em; 
    height: auto;
    margin: 2.5em;
  }

  #logoImagen { 
    width: 7.5em; 
  }
 
  .login-container { 
    position: fixed; 
    left: 0; 
    top: 0; 
    width: 75%; 
    height: 100%; 
    display: flex; 
    flex-direction: column; 
    justify-content: center; 
    align-items: center;
    gap: 1em;
  } 

  .login-container input { 
    margin-bottom: 10px; 
  }

  h2 {
    font-weight: bold;
    font-size: 2.25em;
  }

  input { 
    width: 300px; 
    padding: 10px; 
    border: 1px solid #ccc; 
    border-radius: 5px; 
  } 

  #login { 
    width: 320px; 
    padding: 10px; 
    background-color: #ec64a8; 
    color: white; 
    border: none; 
    border-radius: 25px; 
    cursor: pointer; 
  } 

  #login:hover { 
    background-color: #ec4899; 
  }

  #registro {
    width: 120px; 
    padding: 8px; 
    background-color: #ec64a8;
    color: white; 
    border: none; 
    border-radius: 25px; 
    cursor: pointer;
  }

  #registro:hover { 
    background-color: #ec4899; 
  }
</style>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import api from '../services/api'
import { jwtDecode } from 'jwt-decode'

const username = ref('')
const password = ref('')
const error = ref('')

const router = useRouter()
const userStore = useUserStore()

const login = async () => {
  error.value = ''
  try {
    const response = await api.post('/auth/login', {
      username: username.value,
      password: password.value
    })

    const token = response.data.token
    localStorage.setItem('token', token)

    const user = jwtDecode(token)

    userStore.login(user)

    if (user.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/dashboard')
    }

  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.message || 'Error al iniciar sesión'
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>