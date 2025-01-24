import { Part } from "@prisma/client"
import { LoaderFunctionArgs } from "@remix-run/node"
import { Link, Outlet, useLoaderData, useLocation } from "@remix-run/react"
import { House, Scroll } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { db } from "~/service.server/repository"
import { getSession } from "~/service.server/session"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  // ユーザーIDの取得
  const session = await getSession(request.headers.get("Cookie"))
  const userId = session.get("userId")
  if (userId === undefined) throw new Error("セッションにユーザーが存在しない")

  // パートIDの取得
  const partId = Number(params.partId)
  if (Number.isNaN(partId)) throw new Error("パートIDの形式が不適切")

  // パートの取得 ＆ ユーザーの取得
  const currentSession = await db.userPosition.findFirst({
    where: { userId, partId },
    select: { part: { select: { id: true, name: true } }, user: { select: { id: true, name: true } } },
  })
  if (currentSession === null) throw new Error("データベースにパートとユーザーの組み合わせが存在しない")
  return { currentSession }
}

const pathMapper = (part: Pick<Part, "id" | "name">) => [
  { code: "index", pathname: `/part/${part.id}`, name: "ダッシュボード", icon: House },
  { code: "history", pathname: `/part/${part.id}/history`, name: "購入履歴", icon: Scroll },
]

export default function PartPage() {
  const { currentSession } = useLoaderData<typeof loader>()
  const location = useLocation()
  const pathname = location.pathname
  const paths = pathMapper(currentSession.part)
  const currentTab = paths.find((path) => path.pathname === pathname)
  return (
    <div className="h-full">
      <div className="h-12 bg-muted flex justify-center items-center ">
        {currentSession.part.name}.{currentTab?.name ?? "404"}
      </div>
      <div className="h-full">
        <Outlet />
      </div>
      <Tabs defaultValue={currentTab?.code ?? "index"} className="w-full flex justify-center items-center p-1 fixed bottom-0">
        <TabsList className="h-16">
          {paths.map((path) => (
            <TabsTrigger value={path.code} key={path.code} className="size-14 p-0">
              <Link to={path.pathname} className="w-full h-full flex justify-center items-center">
                <path.icon size={20} />
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
