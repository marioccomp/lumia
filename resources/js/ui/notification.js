export default {
  visible: false,
  title: '',
  message: '',
  status: 'success',
  timeout: null,

  show(title, message, status = 'success') {
    Object.assign(this, { title, message, status, visible: true })
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => (this.visible = false), 2000)
  },
}
