import { Link } from "@remix-run/react"
import { PencilIcon } from "lucide-react"
import { Container, ContainerSection, ContainerTitle } from "~/components/common/container"
import { Button } from "~/components/ui/button"

export default function Admin() {
  return (
    <Container>
      <ContainerTitle>イベント管理</ContainerTitle>
      <ContainerSection>
        <div className="flex gap-2">
          <Link to="/admin/edit/wallet">
            <Button>
              <PencilIcon />
              <span>ウォレット編集</span>
            </Button>
          </Link>
        </div>
      </ContainerSection>
    </Container>
  )
}
