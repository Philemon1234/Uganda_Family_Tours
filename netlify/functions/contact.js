import contactHandler from '../../api/contact.js'

export async function handler(event) {
  let statusCode = 200
  const headers = {}
  let responseBody = ''

  const request = {
    method: event.httpMethod,
    body: event.body || '{}',
  }

  const response = {
    setHeader(name, value) {
      headers[name] = value
    },
    end(body) {
      responseBody = body || ''
    },
    get statusCode() {
      return statusCode
    },
    set statusCode(value) {
      statusCode = value
    },
  }

  try {
    await contactHandler(request, response)
  } catch (error) {
    statusCode = 500
    headers['Content-Type'] = 'application/json'
    responseBody = JSON.stringify({
      message: error instanceof Error ? error.message : 'The booking request could not be sent right now.',
    })
  }

  return {
    statusCode,
    headers,
    body: responseBody,
  }
}
