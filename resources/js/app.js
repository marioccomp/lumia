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
  const form = modal.querySelector('[data-modal-form]')
  const titleEl = modal.querySelector('[data-modal-title]')
  const descriptionEl = modal.querySelector('[data-modal-description]')
  const confirmBtn = modal.querySelector('[data-modal-confirm]')
  const cancelBtn = modal.querySelector('[data-modal-cancel]')
  const fieldsEl = modal.querySelector('[data-modal-fields]')
  const fieldTpl = modal.querySelector('[data-field-template]')
  let onConfirm = null

  const createField = ({ name, label, type = 'text', placeholder = '', required = false, value = '' }) => {
    const node = fieldTpl.content.firstElementChild.cloneNode(true)
    const input = node.querySelector('input')
    const labelEl = node.querySelector('label')

    input.name = name
    input.id = `modal-${name}`
    input.type = type
    input.placeholder = placeholder
    input.required = required
    input.value = value

    if (label) {
      labelEl.textContent = label
      labelEl.htmlFor = input.id
    } else {
      labelEl.remove()
    }

    return node
  }

  window.confirmModal = ({ title, description = '', buttonText = 'Confirmar', fields = [], onConfirm: callback }) => {
    titleEl.textContent = title
    descriptionEl.textContent = description
    confirmBtn.textContent = buttonText
    fieldsEl.replaceChildren(...fields.map(createField))
    onConfirm = callback
    modal.showModal()
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    onConfirm?.(Object.fromEntries(new FormData(form)))
    modal.close()
  })

  cancelBtn.addEventListener('click', () => modal.close())
}
