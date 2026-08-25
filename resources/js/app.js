import Alpine from 'alpinejs'

Alpine.data('alert', function () {
  return {
    isVisible: false,
    dismiss() {
      this.isVisible = false
    },
    init() {
      setTimeout(() => {
        this.isVisible = true
      }, 80)
      setTimeout(() => {
        this.dismiss()
      }, 5000)
    },
  }
})

Alpine.store('theme', {
  dark: document.documentElement.classList.contains('dark'),

  toggle() {
    this.dark = !this.dark // inverte o estado
    document.documentElement.classList.toggle('dark', this.dark) // aplica no <html>
    localStorage.setItem('theme', this.dark ? 'dark' : 'light') // memoriza no navegador
  },
})

Alpine.start()
