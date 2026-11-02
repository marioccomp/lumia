import Alpine from 'alpinejs'
import 'vidstack/player/styles/default/theme.css'
import 'vidstack/player/styles/default/layouts/video.css'
import 'vidstack/player'
import 'vidstack/player/layouts/default'
import 'vidstack/player/ui'

import { EditorView, basicSetup } from 'codemirror'
import { sql } from '@codemirror/lang-sql'
import { Grid } from 'gridjs'
import 'gridjs/dist/theme/mermaid.css'

Alpine.data('sqlEditor', function () {
  let view = null
  let grid = null
  let datasetId = null

  return {
    loading: false,
    error: null,

    init() {
      datasetId = this.$el.dataset.id
      const columns = JSON.parse(this.$el.dataset.schema)
      view = new EditorView({
        doc: 'SELECT * FROM dataset LIMIT 10',
        extensions: [
          basicSetup,
          sql({
            schema: { dataset: columns.map((c) => c.name) },
            defaultTable: 'dataset',
            upperCaseKeywords: true,
          }),
        ],
        parent: this.$refs.editor,
      })
    },
    getQuery() {
      return view.state.doc.toString()
    },
    async executeQuery() {
      this.loading = true
      this.error = null

      try {
        const csrf = document.querySelector('meta[name=csrf-token]').content
        const response = await fetch(`/dataset/${datasetId}/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
          body: JSON.stringify({ query: this.getQuery() }),
        })

        const data = await response.json()

        if (!response.ok) {
          this.error = data.error ?? 'Erro ao executar a query'
          return
        }

        this.renderResult(data.columns, data.rows)
      } catch {
        this.error = 'Falha na comunicação com o servidor'
      } finally {
        this.loading = false
      }
    },

    renderResult(columns, rows) {
      if (!grid) {
        grid = new Grid({ columns, data: rows, sort: true, pagination: { limit: 20 } })
        grid.render(this.$refs.result)
      } else {
        grid.updateConfig({ columns, data: rows }).forceRender()
      }
    },
  }
})

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

const wrapper = document.getElementById('wrapper')
if (wrapper) {
  new Grid({
    columns: ['Name', 'Email'],
    data: [['John', 'john@example.com']],
  }).render(wrapper)
}

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

  const createField = ({
    name,
    label,
    type = 'text',
    placeholder = '',
    required = false,
    value = '',
  }) => {
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

  window.confirmModal = ({
    title,
    description = '',
    buttonText = 'Confirmar',
    fields = [],
    onConfirm: callback,
  }) => {
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
