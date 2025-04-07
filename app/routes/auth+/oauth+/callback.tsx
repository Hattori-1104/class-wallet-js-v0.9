import { Prisma } from "@prisma/client"
import { LoaderFunctionArgs, redirect } from "@remix-run/node"
import { escapeError } from "~/services/navigation.server"
import { getGoogleUser } from "~/services/oauth.server"
import { prisma } from "~/services/repository.server"
import { commitSession, getSession } from "~/services/session.server"
import { verifyOauthState } from "~/services/session.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")

  if (!code) throw escapeError("/auth")
  if (!state) throw escapeError("/auth")

  const isVerified = await verifyOauthState(request, state)
  if (!isVerified) throw escapeError("/auth")

  const googleUser = await getGoogleUser(code)
  if (!googleUser.verified_email) throw escapeError("/auth")

  const session = await getSession(request.headers.get("Cookie"))
  const userType = session.get("tempUserType") ?? "student"
  try {
    if (userType === "student") {
      const student = await prisma.student.upsert({
        where: { id: googleUser.id },
        create: {
          id: googleUser.id,
          name: googleUser.name,
          email: googleUser.email,
        },
        update: {},
      })
      session.set("user", {
        id: student.id,
        type: "student",
      })
    } else {
      const teacher = await prisma.teacher.upsert({
        where: { id: googleUser.id },
        create: {
          id: googleUser.id,
          name: googleUser.name,
          email: googleUser.email,
        },
        update: {},
      })
      session.set("user", {
        id: teacher.id,
        type: "teacher",
      })
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw escapeError("/auth")
    }
    throw error
  }
  return redirect(`/app/${userType}`, {
    headers: { "Set-Cookie": await commitSession(session) },
  })
}
