import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    loggedIn: !!localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user')) || null
  }),

  actions: {
    login(userData) {
      this.loggedIn = true
      this.user = userData
      localStorage.setItem('user', JSON.stringify(userData))
    },

    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.loggedIn = false
      this.user = null
    }
  }
})
