function csrfToken() {
  return document.querySelector('meta[name="csrf-token"]')?.content ?? ''
}

export function http(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      'X-CSRF-TOKEN': csrfToken(),
      ...options.headers,
    },
  })
}
