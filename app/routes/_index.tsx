import { Link } from "@remix-run/react"
import { Button } from "~/components/ui/button"

export default function Index() {
  return (
    <div>
      <Link to="/auth">
        <Button>認証</Button>
      </Link>
    </div>
  )
}
