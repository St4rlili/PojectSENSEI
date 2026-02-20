import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null
  }),
  actions: {
    login(userData) {
      this.loggedIn = true
      this.user = userData
      sessionStorage.setItem('user', JSON.stringify(userData))
    },
    logout() {
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
      this.loggedIn = false
      this.user = null
    }
  }
})