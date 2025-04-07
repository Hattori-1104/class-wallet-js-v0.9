import { Prisma, PrismaClient } from "@prisma/client"
import { escapeError } from "./navigation.server"

export const prisma = new PrismaClient()

export async function repository<T>(process: (prisma: PrismaClient) => Promise<T>, redirectUrl: string) {
  try {
    const result = await process(prisma)
    return result
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw escapeError(redirectUrl)
    }
    throw error
  }
}
