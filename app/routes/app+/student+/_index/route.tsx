import { LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { Container, ContainerGrid, ContainerSection } from "~/components/common/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { requireStudent } from "~/services/loader.utils.server"
import { repository } from "~/services/repository.server"
import { walletMemberCount } from "~/utils/calc"
import { PartSection } from "./part-section"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const studentId = await requireStudent(request)
  const wallets = await repository(async (prisma) => {
    return await prisma.wallet.findMany({
      where: {
        parts: {
          some: {
            students: {
              some: { id: studentId },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        accountantStudents: {
          select: {
            id: true,
            name: true,
          },
        },
        teachers: {
          select: {
            id: true,
            name: true,
          },
        },
        parts: {
          select: {
            _count: {
              select: {
                students: true,
              },
            },
            id: true,
            name: true,
            leaders: {
              select: {
                id: true,
                name: true,
              },
            },
            wallet: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          where: {
            students: {
              some: {
                id: studentId,
              },
            },
          },
        },
      },
    })
  }, "/auth")
  return { wallets }
}

export default function Student() {
  const { wallets } = useLoaderData<typeof loader>()
  return (
    <Container>
      <ContainerGrid>
        <PartSection parts={wallets.flatMap((wallet) => wallet.parts)} />
        <ContainerSection title="所属ウォレット">
          {wallets.map((wallet) => (
            <Card key={wallet.id}>
              <CardHeader className="flex flex-row justify-between space-y-0">
                <CardTitle>{wallet.name}</CardTitle>
                <CardDescription>{walletMemberCount(wallet)}人</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-1">
                  {wallet.accountantStudents.map((student) => (
                    <li key={student.id} className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">HR会計</div>
                      <div>{student.name}</div>
                    </li>
                  ))}
                  {wallet.teachers.map((teacher) => (
                    <li key={teacher.id} className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">担任教師</div>
                      <div>{teacher.name}</div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </ContainerSection>
      </ContainerGrid>
    </Container>
  )
}
