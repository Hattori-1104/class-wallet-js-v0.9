import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const event = await prisma.event.create({
    data: { name: "西校祭2025", budgetLimit: 10_0000 },
  })
  const wallet = await prisma.wallet.create({
    data: { name: "1-1", budgetLimit: 10_0000, eventId: event.id },
  })
  const part = await prisma.part.create({
    data: { name: "展示", budgetLimit: 5_0000, walletId: wallet.id },
  })
  const user = await prisma.user.create({
    data: { name: "test", email: "test@test" },
  })
  const teacher = await prisma.teacher.create({
    data: { name: "teacher", email: "teacher@teacher" },
  })
  const teacherWallet = await prisma.teacherWallet.create({
    data: { teacherId: teacher.id, walletId: wallet.id },
  })
}

await main()
