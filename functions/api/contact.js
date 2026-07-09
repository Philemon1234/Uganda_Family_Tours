const headers = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

function json(status, payload) {
  return new Response(JSON.stringify(payload), { status, headers })
}

export function onRequestOptions() {
  return json(200, { success: true })
}

export function onRequestPost() {
  return json(410, {
    success: false,
    error: 'This endpoint has moved. Please submit forms to /api/send-email.',
  })
}

export function onRequest() {
  return json(405, { success: false, error: 'Method not allowed.' })
}
