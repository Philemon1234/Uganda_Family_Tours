import contactHandler from '../../api/contact.js'

function applyEnv(env = {}) {
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === 'string' && process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

async function createNodeRequest(request) {
  return {
    method: request.method,
    body: await request.text(),
  }
}

function createNodeResponse() {
  let statusCode = 200
  const headers = {}
  let responseBody = ''

  return {
    response: {
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
    },
    toWebResponse() {
      return new Response(responseBody, {
        status: statusCode,
        headers,
      })
    },
  }
}

export async function onRequestPost({ request, env }) {
  applyEnv(env)

  const nodeRequest = await createNodeRequest(request)
  const nodeResponse = createNodeResponse()

  try {
    await contactHandler(nodeRequest, nodeResponse.response)
  } catch (error) {
    console.error('Contact function failed:', error)
    return new Response(JSON.stringify({ message: 'The message could not be sent right now.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  return nodeResponse.toWebResponse()
}

export function onRequest() {
  return new Response(JSON.stringify({ message: 'Method not allowed.' }), {
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      Allow: 'POST',
    },
  })
}
