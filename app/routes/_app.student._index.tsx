import { type LoaderFunctionArgs, redirect } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"

import { prisma } from "~/service.server/repository"
import { commitSession, destroySessionInfo, getSessionInfo } from "~/service.server/session"

export async function loader({ request }: LoaderFunctionArgs) {
  const { success, session } = await getSessionInfo(request)
  if (!success) return redirect("/auth/student/login", { headers: { "Set-Cookie": await commitSession(session) } })
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
  if (!user) return redirect("/auth", { headers: { "Set-Cookie": await commitSession(await destroySessionInfo(request)) } })

  return { user }
}

export default function StudentIndex() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-8 text-2xl font-bold">生徒ダッシュボード</h1>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <section>
          <h2 className="text-xl font-semibold mb-2">担当パート</h2>
          <div className="space-y-4">
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
        <section>
          <h2 className="text-xl font-semibold mb-2">所属ウォレット</h2>
          <div className="space-y-4">
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
