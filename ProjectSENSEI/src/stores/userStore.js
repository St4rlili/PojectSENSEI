import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    loggedIn: !!localStorage.getItem('token')
  }),
  actions: {
    login() {
      this.loggedIn = true
    },
    logout() {
      localStorage.removeItem('token')
      this.loggedIn = false
    }
  }
})
