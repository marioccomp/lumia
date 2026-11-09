import { copyToClipboard } from '../../lib/clipboard.js'

export async function shareVideo(videoId) {
  const url = `${window.location.origin}/videos/${videoId}`

  try {
    await copyToClipboard(url)
    Alpine.store('notify').show('Link copiado', 'Cole onde quiser compartilhar')
  } catch {
    Alpine.store('notify').show('Não foi possível copiar', 'Tente novamente', 'error')
  }
}
