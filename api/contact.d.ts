import type { IncomingMessage, ServerResponse } from 'node:http'

type ContactRequest = IncomingMessage & {
  body?: unknown
}

export default function handler(request: ContactRequest, response: ServerResponse): Promise<void>
