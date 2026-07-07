import { handleSendEmailRequest } from '../functions/sendEmail.js'

export default async function handler(request, response) {
  const result = await handleSendEmailRequest({
    method: request.method,
    body: request.body,
    env: process.env,
  })

  response.statusCode = result.statusCode
  Object.entries(result.headers).forEach(([name, value]) => {
    response.setHeader(name, value)
  })
  response.end(result.body)
}
