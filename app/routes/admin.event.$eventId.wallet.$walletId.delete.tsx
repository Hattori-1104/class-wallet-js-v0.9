import { type ActionFunction } from "@remix-run/node"
import { prisma } from "~/service.server/db"

export const action: ActionFunction = async ({ request, params }) => {
  const { walletId } = params
  if (!walletId) throw new Error("Wallet ID is required")

  await prisma.wallet.delete({
    where: { id: walletId },
  })

  return new Response("Wallet deleted", { status: 200 })
}
