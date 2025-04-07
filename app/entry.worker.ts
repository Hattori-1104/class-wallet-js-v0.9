/// <reference lib="WebWorker" />

import { logger } from "@remix-pwa/sw"

declare let self: ServiceWorkerGlobalScope

self.addEventListener("install", (event) => {
  logger.log("Service worker installed")

  event.waitUntil(self.skipWaiting())
})

self.addEventListener("activate", (event) => {
  logger.log("Service worker activated")

  event.waitUntil(self.clients.claim())
})
