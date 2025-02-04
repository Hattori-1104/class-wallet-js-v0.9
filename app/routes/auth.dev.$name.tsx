import { type LoaderFunctionArgs, redirect } from "@remix-run/node"
import { prisma } from "~/service.server/db"
import { setSessionInfo } from "~/service.server/session"

type UserMap = {
  [key: string]: {
    type: "user" | "teacher"
    email: string
  }
}

const userMap: UserMap = {
  "user-a": {
    type: "user",
    email: "tanaka.taro@example.com",
  },
  "user-b": {
    type: "user",
    email: "yamada.hanako@example.com",
  },
  "user-c": {
    type: "user",
    email: "suzuki.ichiro@example.com",
  },
  teacher: {
    type: "teacher",
    email: "teacher@example.com",
  },
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { name } = params
  if (!name || !(name in userMap)) {
    throw new Error("Invalid user type")
  }

  const { type, email } = userMap[name]

  if (type === "teacher") {
    const teacher = await prisma.teacher.findFirst({
      where: { email },
    })
    if (!teacher) throw new Error("Teacher not found")

    const cookie = await setSessionInfo(request, {
      userId: teacher.id,
      userType: "teacher",
    })

    return redirect("/auth", {
      headers: {
        "Set-Cookie": cookie,
      },
    })
  }

  const user = await prisma.user.findFirst({
    where: { email },
  })
  if (!user) throw new Error("User not found")

  const cookie = await setSessionInfo(request, {
    userId: user.id,
    userType: "user",
  })

  return redirect("/auth", {
    headers: {
      "Set-Cookie": cookie,
    },
  })
}
