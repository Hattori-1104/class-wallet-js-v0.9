import { Session, createCookieSessionStorage } from "@remix-run/node"

export type SessionData = {
  userId: string
  userType: "student" | "teacher"
}

// 主にエラーハンドリングに使用
type SessionFlashData = {
  toast: {
    state: "success" | "error" | "warning"
    msg: string
  }
}

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

export const { getSession, commitSession, destroySession } = sessionStorage

// ユーティリティ
type SessionType = Session<SessionData, SessionFlashData>

// ユーザー情報をセッションから取得
export async function getSessionInfo(request: Request): Promise<{ success: boolean; session: SessionType }> {
  const session = await getSession(request.headers.get("Cookie"))
  const userId = session.get("userId")
  const userType = session.get("userType")

  if (userId === undefined || userType === undefined) {
    session.flash("toast", { state: "error", msg: "ログインしてください" })
    return { success: false, session }
  }
  return { success: true, session }
}

// ユーザー情報をセッションに付与
export async function setSessionInfo(request: Request, data: SessionData): Promise<SessionType> {
  const session = await getSession(request.headers.get("Cookie"))
  session.set("userId", data.userId)
  session.set("userType", data.userType)
  return session
}

// ユーザー情報を削除する
// ログアウト処理とユーザー情報が見つからない場合のエラーハンドリングを行う
export async function destroySessionInfo(request: Request, logout = false): Promise<SessionType> {
  const session = await getSession(request.headers.get("Cookie"))
  session.unset("userId")
  session.unset("userType")
  session.flash("toast", logout ? { state: "success", msg: "ログアウトしました" } : { state: "error", msg: "ユーザー情報が見つかりません" })
  return session
}
