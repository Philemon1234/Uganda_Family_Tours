const corsHeaders = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

function sendJson(statusCode, payload) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(payload),
  }
}

export async function handleSendEmailRequest({ method }) {
  if (method === 'OPTIONS') {
    return sendJson(200, { success: true, message: 'OK' })
  }

  if (method !== 'POST') {
    return sendJson(405, { success: false, message: 'Method not allowed.' })
  }

  return sendJson(410, {
    success: false,
    message: 'This endpoint has moved. Please submit forms to /api/send-email.',
  })
}

export async function handler(event) {
  return handleSendEmailRequest({
    method: event.httpMethod,
  })
}

export async function onRequest({ request, env }) {
  return toWebResponse(await handleSendEmailRequest({
    method: request.method,
  }))
}

function toWebResponse(result) {
  return new Response(result.body, {
    status: result.statusCode,
    headers: result.headers,
  })
}
