import { type ActionFunction } from "@remix-run/node"
import { prisma } from "~/service.server/repository"

export const action: ActionFunction = async ({ params }) => {
  const { partId } = params
  if (!partId) throw new Error("Part ID is required")

  await prisma.part.delete({
    where: { id: partId },
  })

  return new Response("Part deleted", { status: 200 })
}
