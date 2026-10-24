import Alpine from 'alpinejs'
import 'vidstack/player/styles/default/theme.css'
import 'vidstack/player/styles/default/layouts/video.css'
import 'vidstack/player'
import 'vidstack/player/layouts/default'
import 'vidstack/player/ui'

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

const modal = document.getElementById('confirm-modal')
if (modal) {
  let onConfirm = null

  window.confirmModal = ({ title, description, buttonText, onConfirm: callback }) => {
    modal.querySelector('[data-modal-title]').textContent = title
    modal.querySelector('[data-modal-description]').textContent = description
    modal.querySelector('[data-modal-confirm]').textContent = buttonText
    onConfirm = callback
    modal.showModal()
  }

  modal.querySelector('[data-modal-confirm]').addEventListener('click', () => {
    onConfirm?.()
    modal.close()
  })
}
