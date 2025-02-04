import { Link } from "@remix-run/react"
import { Button } from "~/components/ui/button"

export default function Index() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-3xl font-bold">ClassWallet.js</h1>

      <div className="space-y-4">
        <div className="rounded border border-gray-200 p-4">
          <h2 className="mb-4 text-xl font-semibold">ようこそ</h2>
          <p className="mb-4 text-gray-600">このシステムはクラスの会計を管理するためのアプリケーションです。 利用するにはログインが必要です。</p>
          <Link to="/auth">
            <Button size="lg">ログインページへ</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
