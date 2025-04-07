import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const event = await prisma.event.create({
    data: { name: "西校祭2025", budget: 10_0000 },
  })
  const user = await prisma.student.create({
    data: { name: "生徒", email: "z20230423@west.ed.jp", id: "105926552011320383379" },
  })
  const teacher = await prisma.teacher.create({
    data: { name: "教師", email: "z20230423@west.ed.jp", id: "105926552011320383379" },
  })
  const wallet = await prisma.wallet.create({
    data: { name: "2-1", budget: 10_0000, eventId: event.id, teachers: { connect: { id: teacher.id } }, accountantStudents: { connect: { id: user.id } } },
  })
  const part = await prisma.part.create({
    data: { name: "展示", budget: 5_0000, walletId: wallet.id, students: { connect: { id: user.id } }, leaders: { connect: { id: user.id } } },
  })
  await prisma.product.create({
    data: {
      name: "ガムテープ",
      price: 100,
    },
  })
}

await main()
