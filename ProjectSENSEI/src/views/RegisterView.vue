<template>
    <div class="derecha"></div>
    <div class="register-container">
        <img id = "logoNombre" src = "../assets/logoNombre.png"/>
        <img id = "logoImagen" src = "../assets/logoImagen.PNG"/>
        <h2>Registro</h2>

        <input v-model="username" placeholder="Usuario" />
        <input v-model="password" type="password" placeholder="Contraseña" />
        <input v-model="confirmPassword" type="password" placeholder="Confirmar contraseña" />

        <button id = "registro" @click="register">Registrarse</button>

        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="success" class="success">{{ success }}</p>

        <p>¿Ya tienes cuenta?
        <button id = "login" @click="goToLogin">Inicia sesión</button>
        </p>
    </div>
</template>

<style scoped>
    * {
        font-family: 'Inter', sans-serif;
    }
    .register-container {
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

    .register-container input { 
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

    #registro { 
        width: 320px; 
        padding: 10px; 
        background-color: #000000; 
        color: white; 
        border: none; 
        border-radius: 25px; 
        cursor: pointer; 
    }

    #registro:hover { 
        background-color: #3b3b3b; 
    }

    #login {
        width: 120px; 
        padding: 8px; 
        background-color: #000000;
        color: white; 
        border: none; 
        border-radius: 25px; 
        cursor: pointer;
    }

    #login:hover { 
        background-color: #3b3b3b; 
    }
</style>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')

const router = useRouter()

const register = async () => {
  error.value = ''
  success.value = ''

  if (!username.value || !password.value || !confirmPassword.value) {
    error.value = 'Todos los campos son obligatorios'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden'
    return
  }

  try {
    await api.post('/auth/register', {
      username: username.value,
      password: password.value
    })

    success.value = 'Usuario creado correctamente. Ya puedes iniciar sesión'
    username.value = ''
    password.value = ''
    confirmPassword.value = ''

  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.message || 'Error al registrar usuario'
  }
}

const goToLogin = () => {
  router.push('/')
}
</script>