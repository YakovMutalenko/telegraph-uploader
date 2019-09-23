const fetch = require('node-fetch')
const FormData = require('form-data')

const isBuffer = require('is-buffer')
const isStream = require('isstream')

const toArray = require('stream-to-array')

const uploadByUrl = (url) => {
  return fetch(url)
    .then(async (r) => {
      console.log(r.headers.get('content-type'))
      if (!isStream(r.body)) {
        throw new TypeError('Response is not a stream')
      }
      const array = await toArray(r.body)
      const buffer = Buffer.concat(array)

      if (!r.headers.get('content-type')) {
        throw new Error('No content types in the response')
      }

      return uploadByBuffer(buffer, r.headers.get('content-type'))
    })
}

const uploadByBuffer = (buffer, contentType, filename) => {
  if (!isBuffer(buffer)) {
    throw new TypeError('Buffer is not a Buffer')
  }
  const form = new FormData()

  form.append('photo', buffer, {
    filename: filename || 'blob',
    contentType,
  })

  console.log(form)

  return fetch('https://telegra.ph/upload', {
    method: 'POST',
    body: form
  })
    .then(result => result.json())
    .then((result) => {
      if (result.error) {
        throw result.error
      }

      if (result[0] && result[0].src) {
        return {
          link: 'https://telegra.ph' + result[0].src,
          path: result[0].src,
        }
      }

      throw new Error('Unknown error')
    })
}

module.exports = {
  uploadByUrl,
  uploadByBuffer,
}
