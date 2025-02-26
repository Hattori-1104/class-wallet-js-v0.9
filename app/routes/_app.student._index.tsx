import { type LoaderFunctionArgs, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

import { PartLinkCard } from "~/components/part-link-card"
import { WalletLinkCard } from "~/components/wallet-link-card"
import { prisma } from "~/service.server/repository"
import { destroySessionInfo, getSessionInfo } from "~/service.server/session"

export async function loader({ request }: LoaderFunctionArgs) {
  const { success, session } = await getSessionInfo(request)
  if (!success) return redirect("/auth/student/login", { headers: { "Set-Cookie": await destroySessionInfo(request) } })
  const userId = session.get("userId")

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userParts: {
        include: {
          part: {
            include: {
              wallet: {
                include: {
                  teachers: {
                    include: {
                      teacher: true,
                    },
                  },
                  parts: true,
                },
              },
            },
          },
        },
      },
    },
  })
  // ユーザー情報が見つからない場合はログアウト処理を行う
  if (!user) return redirect("/auth", { headers: { "Set-Cookie": await destroySessionInfo(request) } })

  return { user }
}

export default function StudentIndex() {
  const { user } = useLoaderData<typeof loader>()
  const wallets = Array.from(new Map(user.userParts.map(({ part }) => [part.walletId, part.wallet])).values())

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-8 text-2xl font-bold">生徒ダッシュボード</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <section>
          <h2 className="text-xl font-semibold mb-2">担当パート</h2>
          <div className="space-y-4">
            {user.userParts.map(({ part }) => (
              <PartLinkCard part={part} key={part.id} />
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">所属ウォレット</h2>
          <div className="space-y-4">
            {wallets.map((wallet) => (
              <WalletLinkCard wallet={wallet} key={wallet.id} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
