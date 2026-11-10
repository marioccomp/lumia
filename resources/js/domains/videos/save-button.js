import { http } from '../../lib/http.js'

export default ({ videoId, saved }) => ({
  saved,

  async toggle() {
    const response = await http(`/videos/${videoId}/save`, {
      method: this.saved ? 'DELETE' : 'POST',
    })
    if (!response.ok) return

    this.saved = !this.saved
    Alpine.store('notify').show(
      this.saved ? 'Vídeo salvo' : 'Vídeo removido',
      'Sua lista foi atualizada'
    )
  },
})
