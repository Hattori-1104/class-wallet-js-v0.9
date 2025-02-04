import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  // 役職の作成
  const roleId_accountant = (
    await prisma.role.create({
      data: { name: "会計" },
    })
  ).id
  const roleId_subAccountant = (
    await prisma.role.create({
      data: { name: "副会計" },
    })
  ).id

  // ユーザーの作成
  const userId_A = (
    await prisma.user.create({
      data: { email: "tanaka.taro@example.com", name: "田中太郎" },
    })
  ).id
  const userId_B = (
    await prisma.user.create({
      data: { email: "yamada.hanako@example.com", name: "山田花子" },
    })
  ).id
  const userId_C = (
    await prisma.user.create({
      data: { email: "suzuki.ichiro@example.com", name: "鈴木一郎" },
    })
  ).id

  // ウォレットの作成
  const walletId_2_1 = (
    await prisma.wallet.create({
      data: { name: "2-1" },
    })
  ).id

  const walletId_2_2 = (
    await prisma.wallet.create({
      data: { name: "2-2" },
    })
  ).id

  // 教師の作成
  const teacherId = (
    await prisma.teacher.create({
      data: {
        email: "teacher@example.com",
        name: "山田先生",
        wallets: {
          create: [{ wallet: { connect: { id: walletId_2_1 } } }, { wallet: { connect: { id: walletId_2_2 } } }],
        },
      },
    })
  ).id

  // 2-1のパートの作成
  const partId_A = (
    await prisma.part.create({
      data: {
        name: "展示",
        walletId: walletId_2_1,
      },
    })
  ).id
  const partId_B = (
    await prisma.part.create({
      data: {
        name: "行燈",
        walletId: walletId_2_1,
      },
    })
  ).id
  const partId_C = (
    await prisma.part.create({
      data: {
        name: "垂れ幕",
        walletId: walletId_2_1,
      },
    })
  ).id

  // 2-2のパートの作成
  const partId_D = (
    await prisma.part.create({
      data: {
        name: "展示",
        walletId: walletId_2_2,
      },
    })
  ).id
  const partId_E = (
    await prisma.part.create({
      data: {
        name: "装飾",
        walletId: walletId_2_2,
      },
    })
  ).id

  // ユーザーとパートの関連付け（役職含む）
  await prisma.userPart.create({
    data: {
      userId: userId_A,
      partId: partId_A,
      roleId: roleId_accountant,
    },
  })
  await prisma.userPart.create({
    data: {
      userId: userId_B,
      partId: partId_A,
      roleId: roleId_subAccountant,
    },
  })
  await prisma.userPart.create({
    data: {
      userId: userId_B,
      partId: partId_B,
      roleId: roleId_accountant,
    },
  })
  await prisma.userPart.create({
    data: {
      userId: userId_C,
      partId: partId_C,
      roleId: roleId_accountant,
    },
  })
  await prisma.userPart.create({
    data: {
      userId: userId_A,
      partId: partId_D,
      roleId: roleId_accountant,
    },
  })
  await prisma.userPart.create({
    data: {
      userId: userId_C,
      partId: partId_E,
      roleId: roleId_accountant,
    },
  })

  // ユーザーとウォレットの関連付け
  await prisma.userWallet.create({
    data: {
      userId: userId_A,
      walletId: walletId_2_1,
    },
  })
  await prisma.userWallet.create({
    data: {
      userId: userId_B,
      walletId: walletId_2_1,
    },
  })
  await prisma.userWallet.create({
    data: {
      userId: userId_C,
      walletId: walletId_2_1,
    },
  })
  await prisma.userWallet.create({
    data: {
      userId: userId_A,
      walletId: walletId_2_2,
    },
  })
  await prisma.userWallet.create({
    data: {
      userId: userId_C,
      walletId: walletId_2_2,
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
