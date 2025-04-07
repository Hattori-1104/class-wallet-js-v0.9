import { LoaderFunctionArgs } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { Container, ContainerGrid } from "~/components/common/container"
import { Button } from "~/components/ui/button"
import { requirePart } from "~/services/loader.utils.server"
import { repository } from "~/services/repository.server"
import { partPlannedUsage, partUsage } from "~/utils/calc"
import { BudgetSection } from "./budget-section"
import { ManagerSection } from "./manager-section"
import { RequestSection } from "./request-section"

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const partId = requirePart(params)
  const part = await repository(
    (prisma) =>
      prisma.part.findUniqueOrThrow({
        where: {
          id: partId,
        },
        select: {
          id: true,
          name: true,
          budget: true,
          leaders: {
            select: {
              id: true,
              name: true,
            },
          },
          purchases: {
            take: 10,
            orderBy: {
              updatedAt: "desc",
            },
            select: {
              id: true,
              note: true,
              actualUsage: true,
              items: {
                select: {
                  id: true,
                  product: {
                    select: {
                      id: true,
                      name: true,
                      price: true,
                    },
                  },
                  quantity: true,
                },
              },
              requestCert: {
                select: {
                  id: true,
                  signedBy: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                  createdAt: true,
                  approved: true,
                },
              },
              accountantCert: {
                select: {
                  id: true,
                  signedBy: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                  createdAt: true,
                  approved: true,
                },
              },
              teacherCert: {
                select: {
                  id: true,
                  signedBy: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                  createdAt: true,
                  approved: true,
                },
              },
              returnedAt: true,
              completedAt: true,
            },
          },
          wallet: {
            select: {
              id: true,
              name: true,
              accountantStudents: {
                select: {
                  id: true,
                  name: true,
                },
                where: {
                  parts: {
                    some: {
                      id: partId,
                    },
                  },
                },
              },
              teachers: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              students: true,
              purchases: {
                where: {
                  NOT: {
                    OR: [
                      {
                        requestCert: {
                          approved: false,
                        },
                      },
                      {
                        teacherCert: {
                          approved: false,
                        },
                      },
                      {
                        accountantCert: {
                          approved: false,
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      }),
    "/app/student",
  )
  return { part }
}

export default function Part() {
  const { part } = useLoaderData<typeof loader>()
  return (
    <Container>
      <h1 className="my-6 flex flex-row justify-between items-center">
        <div>
          <div className="text-2xl font-bold">{part.name}</div>
          <div className="font-normal text-base text-muted-foreground">{part.wallet.name}</div>
        </div>
        <Link to="purchase/new">
          <Button>購入リクエスト</Button>
        </Link>
      </h1>
      <ContainerGrid>
        <BudgetSection budget={part.budget} usage={partUsage(part)} plannedUsage={partPlannedUsage(part)} plannedPurchasesCount={part._count.purchases} />
        <ManagerSection leaders={part.leaders} accountantStudents={part.wallet.accountantStudents} teachers={part.wallet.teachers} />
      </ContainerGrid>
      <RequestSection part={part} />
    </Container>
  )
}
