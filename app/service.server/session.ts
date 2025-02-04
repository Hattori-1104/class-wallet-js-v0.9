import { User } from "@prisma/client"
import { createCookieSessionStorage } from "@remix-run/node"

export type MinimalUserType = Pick<User, "id" | "email" | "name">
export type ProfileUserType = Pick<User, "email" | "name">

// セッションで管理するユーザータイプ
export type SessionUserType = {
  id: string
  email: string
  name: string
  type: "user" | "teacher"
}

// セッションデータの型定義
type SessionData = {
  userId: string
  userType: "user" | "teacher"
}

// フラッシュメッセージの型定義
type SessionFlashData = {
  error?: string
  success?: string
}

// セッションストレージの作成
const sessionStorage = createCookieSessionStorage<SessionData, SessionFlashData>({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET || "s3cr3t"], // 本番環境では必ず環境変数から取得
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30日
  },
})

// セッション管理用の関数
export const { getSession, commitSession, destroySession } = sessionStorage

// セッション情報の取得
export async function getSessionInfo(request: Request): Promise<SessionData | null> {
  const session = await getSession(request.headers.get("Cookie"))
  const userId = session.get("userId")
  const userType = session.get("userType")

  if (!userId || !userType) return null
  return { userId, userType }
}

// セッションの設定
export async function setSessionInfo(request: Request, data: SessionData): Promise<string> {
  const session = await getSession(request.headers.get("Cookie"))
  session.set("userId", data.userId)
  session.set("userType", data.userType)
  return commitSession(session)
}

// セッションの破棄
export async function destroySessionInfo(request: Request): Promise<string> {
  const session = await getSession(request.headers.get("Cookie"))
  return destroySession(session)
}
