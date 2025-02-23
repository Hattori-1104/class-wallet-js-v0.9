import type { Wallet } from "@prisma/client"
import { type LoaderFunctionArgs, json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { WalletCard } from "~/components/wallet-card"
import { prisma } from "~/service.server/repository"
import { getSessionInfo } from "~/service.server/session"

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { success, sessionData } = await getSessionInfo(request)
  if (!success) throw new Error("Unauthorized")

  const walletId = params.walletId
  if (!walletId) throw new Error("Wallet ID is required")

  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId },
    include: {
      parts: {
        include: {
          users: {
            include: {
              user: true,
            },
          },
          purchases: {
            include: {
              requestedBy: true,
              approvedByAccountant: true,
              approvedByTeacher: true,
            },
          },
        },
      },
      teachers: true,
    },
  })

  if (!wallet) {
    throw new Response("Wallet not found", { status: 404 })
  }

  // 教師が担当クラスにアクセスしているか確認
  const isTeacherOfWallet = wallet.teachers.some((t: { id: string }) => t.id === sessionData.userId)
  if (!isTeacherOfWallet) throw new Error("Unauthorized")

  return json(wallet)
}

export default function WalletDetail() {
  const { wallet } = useLoaderData<{
    wallet: Wallet & {
      parts: {
        id: string
        name: string
        users: { user: { id: string; name: string }; role: { name: string } }[]
        purchaseRequests: {
          id: string
          itemName: string
          amount: number
          requestedBy: { name: string }
          approvedByAccountant?: { name: string } | undefined
          approvedByTeacher?: { name: string } | undefined
        }[]
      }[]
      teachers: { id: string }[]
    }
  }>()

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{wallet.name}</h1>
      </div>
      <WalletCard wallet={wallet} />
    </div>
  )
}
