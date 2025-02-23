import { type ActionFunction } from "@remix-run/node"
import { prisma } from "~/service.server/repository"

export const action: ActionFunction = async ({ params }) => {
  const { walletId } = params
  if (!walletId) throw new Error("Wallet ID is required")

  await prisma.wallet.delete({
    where: { id: walletId },
  })

  return new Response("Wallet deleted", { status: 200 })
}
