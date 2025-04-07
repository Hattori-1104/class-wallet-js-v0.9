import { useNavigate } from "@remix-run/react"
import { ChevronLeftIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
export function Header() {
  const navigate = useNavigate()
  return (
    <header className="h-16 w-full border-b bg-white flex-shrink-0">
      <nav className="container mx-auto flex items-center justify-between h-full px-8">
        <Button variant="ghost" className="size-12" onClick={() => navigate(-1)}>
          <ChevronLeftIcon />
        </Button>
      </nav>
    </header>
  )
}
