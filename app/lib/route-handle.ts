import type { Handle } from "~/types/route-handle"

export function getRouteHandle(matches: Array<{ handle: Handle }>) {
  const activeRoute = matches[matches.length - 1]
  return {
    getBackRoute: () => activeRoute.handle?.backRoute ?? "/",
  }
}
