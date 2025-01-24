import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  // ユーザー
  const userId_A = (await prisma.user.create({ data: { email: 'z20230423@west.ed.jp', name: '服部和紀' } })).id
  const userId_B = (await prisma.user.create({ data: { email: 'crafter.alloy@gmail.com', name: 'Hattori' } })).id
  const userId_C = (await prisma.user.create({ data: { email: 'hukubekazuki@gmail.com', name: 'はっとり' } })).id
  // ウォレット
  const walletId = (await prisma.wallet.create({ data: { name: '2-1', budget: 60_000 } })).id
  // パート
  const partId_A = (await prisma.part.create({ data: { name: '展示', parentId: walletId, budget: 20_000 } })).id
  const partId_B = (await prisma.part.create({ data: { name: '行燈', parentId: walletId, budget: 30_000 } })).id
  const partId_C = (await prisma.part.create({ data: { name: '垂れ幕', parentId: walletId, budget: 10_000 } })).id
  // ユーザーの所属
  await prisma.userPosition.create({ data: { partId: partId_A, userId: userId_A } })
  await prisma.userPosition.create({ data: { partId: partId_A, userId: userId_B } })
  await prisma.userPosition.create({ data: { partId: partId_B, userId: userId_B } })
  await prisma.userPosition.create({ data: { partId: partId_C, userId: userId_C } })
  // 商品
  const productId_A = (await prisma.product.create({ data: { name: 'ガムテープ', price: 200 } })).id
  const productId_B = (await prisma.product.create({ data: { name: 'カラーセロハン８枚組', price: 160 } })).id
  const productId_C = (await prisma.product.create({ data: { name: '油性ペン', price: 100 } })).id
  const productId_D = (await prisma.product.create({ data: { name: '極小ダイヤモンド', price: 10_000 } })).id

  // ショッピング
  const shoppingId_A = (await prisma.shopping.create({ data: { partId: partId_A } })).id
  await prisma.shoppingMember.create({ data: { shoppingId: shoppingId_A, userId: userId_A } })
  await prisma.shoppingMember.create({ data: { shoppingId: shoppingId_A, userId: userId_B } })
  await prisma.shoppingItem.create({ data: { amount: 3, productId: productId_A, shoppingId: shoppingId_A } })
  await prisma.shoppingItem.create({ data: { amount: 2, productId: productId_B, shoppingId: shoppingId_A } })
  await prisma.shoppingItem.create({ data: { amount: 6, productId: productId_C, shoppingId: shoppingId_A } })

  const shoppingId_B = (await prisma.shopping.create({ data: { partId: partId_A } })).id
  await prisma.shoppingMember.create({ data: { shoppingId: shoppingId_B, userId: userId_A } })
  await prisma.shoppingItem.create({ data: { amount: 1, productId: productId_A, shoppingId: shoppingId_B } })
  await prisma.shoppingItem.create({ data: { amount: 2, productId: productId_B, shoppingId: shoppingId_B } })

  const shoppingId_C = (await prisma.shopping.create({ data: { partId: partId_A } })).id
  await prisma.shoppingMember.create({ data: { shoppingId: shoppingId_C, userId: userId_A } })
  await prisma.shoppingItem.create({ data: { amount: 1, productId: productId_D, shoppingId: shoppingId_C } })
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
