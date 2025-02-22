import { Session, SessionData, createCookieSessionStorage } from "@remix-run/node"

export type SessionDataType = {
  userId: string
  userType: "student" | "teacher"
}

// 主にエラーハンドリングに使用
type SessionFlashDataType = {
  toast: {
    state: "success" | "error" | "Incomprehensive" | "warning"
    msg: string
  }
}

const sessionStorage = createCookieSessionStorage<SessionDataType, SessionFlashDataType>({
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
type SessionType = Session<SessionDataType, SessionFlashDataType>

// ユーザー情報をセッションから取得
export async function getSessionInfo(
  request: Request,
): Promise<{ success: true; session: SessionType; sessionData: SessionDataType } | { success: false; session: SessionType; sessionData: undefined }> {
  const session = await getSession(request.headers.get("Cookie"))
  const userId = session.get("userId")
  const userType = session.get("userType")

  if (userId === undefined || userType === undefined) {
    session.flash("toast", { state: "error", msg: "ログインしてください" })
    return { success: false, session, sessionData: undefined }
  }
  const sessionData: SessionDataType = { userId, userType }
  return { success: true, session, sessionData }
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

export function setToast(session: SessionType, state: SessionFlashDataType["toast"]["state"], msg: string) {
  session.flash("toast", { state, msg })
  return session
}

const flashCases: { [key: string]: { state: SessionFlashDataType["toast"]["state"]; msg: string } } = {
  InvalidURL: { state: "error", msg: "URLが不正です" },
  UnAuthorized: { state: "error", msg: "セッションにユーザー情報がありません" },
  InvalidForm: { state: "error", msg: "フォームの値が不正です" },
  NotFound: { state: "error", msg: "データが見つかりません" },
  InternalServerError: { state: "error", msg: "サーバーエラーが発生しました" },
}

type FlashCaseType = keyof typeof flashCases

export function commitToastByCase(session: SessionType, caseName: FlashCaseType): ReturnType<typeof commitSession> {
  return commitSession(setToast(session, flashCases[caseName].state, flashCases[caseName].msg))
}
