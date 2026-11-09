import { http } from '../../lib/http.js'

export default ({ videoId, title, description }) => ({
  loading: false,
  title,
  description,

  init() {
    this.title = this.$el.dataset.title
    this.description = this.$el.dataset.description
  },
  openEdit() {
    confirmModal({
      title: 'Editar detalhes',
      buttonText: 'Salvar',
      fields: [
        { name: 'title', label: 'Título', value: this.title, required: true },
        {
          name: 'description',
          label: 'Descrição',
          value: this.description,
          placeholder: 'Opcional',
        },
      ],
      onConfirm: (data) => this.edit(data),
    })
  },
  openDelete() {
    confirmModal({
      title: 'Excluir vídeo',
      buttonText: 'Confirmar',
      description: 'Essa ação não pode ser desfeita.',
      onConfirm: () => this.delete(),
    })
  },

  async edit(data) {
    if (this.loading) return
    this.loading = true
    try {
      const res = await http(`/videos/${videoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        Alpine.store('notify').show(
          'Não foi possivel editar o vídeo',
          body?.message ?? 'Tente novamente',
          'error'
        )
        return
      }

      Alpine.store('notify').show(
        'Vídeo editado com sucesso',
        'Informações atualizadas com sucesso',
        'success'
      )

      data.title ? (this.title = data.title) : ''
      data.description ? (this.description = data.description) : ''
    } finally {
      this.loading = false
    }
  },

  async delete() {
    if (this.loading) return
    this.loading = true
    try {
      const res = await http(`/videos/${videoId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        Alpine.store('notify').show(
          'Não foi possivel excluir o vídeo',
          body?.message ?? 'Tente novamente',
          'error'
        )
        return
      }

      Alpine.store('notify').show(
        'Vídeo excluido com sucesso',
        'Informações apagadas com sucesso',
        'success'
      )
      this.$el.closest('a')?.remove()
    } finally {
      this.loading = false
    }
  },
})
