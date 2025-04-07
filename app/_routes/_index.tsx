import { Link } from "@remix-run/react"
import { Container } from "~/components/common/container"
import { Button } from "~/components/ui/button"
export default function Index() {
  return (
    <Container title="ClassWallet.js">
      <div className="space-y-4">
        <div className="rounded border border-gray-200 p-4">
          <h2 className="mb-4 text-xl font-semibold">ようこそ</h2>
          <p className="mb-4 text-gray-600">このシステムはクラスの会計を管理するためのアプリケーションです。 利用するにはログインが必要です。</p>
          <Link to="/auth">
            <Button size="lg">ログインページへ</Button>
          </Link>
        </div>
      </div>
    </Container>
  )
}
