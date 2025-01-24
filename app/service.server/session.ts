import { User } from "@prisma/client"
import { createCookieSessionStorage } from "@remix-run/node"

export type MinimalUserType = Pick<User, "id" | "email" | "name">
export type ProfileUserType = Pick<User, "email" | "name">

// セッション管理用Cookieには最小限の情報を
export type SessionCookieDataType = {
  userId: User["id"]
  authTempUserProfile: ProfileUserType
}

// クッキーセッションストレージ
export const sessionSecret = process.env.SESSION_SECRET || ""
export const sessionStorage = createCookieSessionStorage<SessionCookieDataType>({
  cookie: {
    name: "userSession",
    sameSite: "lax",
    path: "/",
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  },
})

export const { getSession, commitSession, destroySession } = sessionStorage
