import { http } from '../../lib/http.js'

const PRIMARY = 'bg-primary text-primary-foreground hover:bg-primary-hover'
const SECONDARY = 'bg-surface text-foreground border border-border hover:bg-border'

export default ({ userId, subscribed, count }) => ({
  subscribed,
  count,
  loading: false,

  get label() {
    return this.subscribed ? 'Inscrito' : 'Inscrever-se'
  },
  get buttonClass() {
    return this.subscribed ? SECONDARY : PRIMARY
  },

  async toggle() {
    if (this.loading) return
    this.loading = true
    try {
      const res = await http(`/${userId}/subscribe`, {
        method: this.subscribed ? 'DELETE' : 'POST',
      })
      if (!res.ok) return
      this.subscribed = !this.subscribed
      this.count += this.subscribed ? 1 : -1
    } finally {
      this.loading = false
    }
  },
})
