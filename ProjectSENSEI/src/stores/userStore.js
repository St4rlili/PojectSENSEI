import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    loggedIn: false,
    user: null
  }),
  actions: {
    login(userData) {
      this.loggedIn = true
      this.user = userData
      sessionStorage.setItem('token', sessionStorage.getItem('token'))
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