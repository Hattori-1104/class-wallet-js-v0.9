import { Part, Teacher, Wallet } from "@prisma/client"
import { Link } from "@remix-run/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { prisma } from "~/service.server/db"

type StudentWalletCardProps = NonNullable<
  Awaited<
    ReturnType<
      typeof prisma.wallet.findUnique<{
        where: {
          id: string
        }
        include: {
          teachers: {
            include: {
              teacher: true
            }
          }
          parts: true
        }
      }>
    >
  >
>

export const StudentWalletCard = ({ wallet }: { wallet: StudentWalletCardProps }) => {
  return (
    <Link to={`/student/wallet/${wallet.id}`} className="block" key={wallet.id}>
      <Card>
        <CardHeader>
          <CardTitle>{wallet.name}</CardTitle>
          <CardDescription>担当教師: {wallet.teachers.map((teacher) => teacher.teacher.name).join(", ")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-600">パート数: {wallet.parts.length}個</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

type StudentPartCardProps = NonNullable<
  Awaited<
    ReturnType<
      typeof prisma.part.findUnique<{
        where: {
          id: string
        }
        include: {
          wallet: {
            include: {
              teachers: {
                include: {
                  teacher: true
                }
              }
              parts: true
            }
          }
          roleId: true
        }
      }>
    >
  >
>

export const StudentPartCard = ({ part }: { part: StudentPartCardProps }) => {
  return (
    <Link to={`/student/part/${part.id}`} className="w-full">
      <Card key={part.id}>
        <CardHeader>
          <CardTitle>{part.name}</CardTitle>
          <CardDescription>
            所属: {part.wallet.name}
            <br />
            役職: {part.roleId}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}
