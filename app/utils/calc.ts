import { Prisma } from "@prisma/client"

type walletMemberCountArgs = Prisma.WalletGetPayload<{
  select: {
    parts: {
      select: {
        _count: {
          select: {
            students: true
          }
        }
      }
    }
  }
}>

export const walletMemberCount = (wallet: walletMemberCountArgs) => wallet.parts.reduce((acc, part) => acc + part._count.students, 0)

type partUsageArgs = Prisma.PartGetPayload<{
  select: {
    purchases: {
      select: {
        actualUsage: true
      }
    }
  }
}>

export const partUsage = (part: partUsageArgs) => part.purchases.reduce((acc, purchase) => acc + (purchase.actualUsage ?? 0), 0)

type partPlannedUsageArgs = Prisma.PartGetPayload<{
  select: {
    purchases: {
      select: {
        items: {
          select: {
            quantity: true
            product: {
              select: {
                price: true
              }
            }
          }
        }
      }
      where: {
        NOT: {
          OR: [
            {
              teacherCert: {
                approved: false
              }
            },
            {
              accountantCert: {
                approved: false
              }
            },
          ]
        }
      }
    }
  }
}>

export const partPlannedUsage = (part: partPlannedUsageArgs) =>
  part.purchases.reduce((acc, purchase) => acc + purchase.items.reduce((acc, item) => acc + item.quantity * item.product.price, 0), 0)

export const displayPercent = (num: number, denum: number) => {
  if (denum === 0) return "0%"
  if (denum === num) return "100%"
  return `${Math.floor((num / denum) * 100)}%`
}
