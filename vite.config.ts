import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import contactHandler from './api/contact.js'

function contactApiPlugin(): Plugin {
  return {
    name: 'uganda-family-tours-contact-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/contact', async (request: IncomingMessage, response: ServerResponse) => {
        try {
          await contactHandler(request, response)
        } catch (error) {
          response.statusCode = 500
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({
            message: error instanceof Error ? error.message : 'The booking request could not be sent right now.',
          }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    plugins: [contactApiPlugin(), react(), tailwindcss()],
  }
})
