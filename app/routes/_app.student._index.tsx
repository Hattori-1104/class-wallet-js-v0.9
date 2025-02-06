import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { StudentPartCard, StudentWalletCard } from "~/components/dashboard"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { prisma } from "~/service.server/db"
import { destroySessionInfo, getSessionInfo } from "~/service.server/session"

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSessionInfo(request)
  if (!session) throw new Error("Unauthorized")
  const userId = session.userId

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
  if (!user) {
    // セッションを削除してログインページにリダイレクト
    const cookie = await destroySessionInfo(request)
    throw redirect("/auth", {
      headers: {
        "Set-Cookie": cookie,
      },
    })
  }

  return json({ user })
}

export default function StudentIndex() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-8">
        <h1 className="text-2xl font-bold">生徒ダッシュボード</h1>
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">担当パート</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {user.userParts.map(({ part }) => (
              <Link to={`/student/part/${part.id}`} className="w-full" key={part.id}>
                <Card>
                  <CardHeader>
                    <CardTitle>{part.name}</CardTitle>
                    <CardDescription>所属: {part.wallet.name}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">所属ウォレット</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {user.userParts.map(({ part }) => (
              <Link to={`/student/wallet/${part.wallet.id}`} className="block" key={part.wallet.id}>
                <Card>
                  <CardHeader>
                    <CardTitle>{part.wallet.name}</CardTitle>
                    <CardDescription>担当教師: {part.wallet.teachers.map((teacher) => teacher.teacher.name).join(", ")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-gray-600">パート数: {part.wallet.parts.length}個</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
