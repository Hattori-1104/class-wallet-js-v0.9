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

// トーストを設定
export function setToast(session: SessionType, state: SessionFlashDataType["toast"]["state"], msg: string) {
  session.flash("toast", { state, msg })
  return session
}

// トーストのケース
const flashCases = {
  InvalidURL: { state: "error", msg: "URLが不正です" },
  UnAuthorized: { state: "error", msg: "ユーザー情報がありません" },
  InvalidForm: { state: "error", msg: "フォームの値が不正です" },
  NotFound: { state: "error", msg: "データが見つかりません" },
  InternalServerError: { state: "error", msg: "サーバーエラーが発生しました" },
  Logout: { state: "success", msg: "ログアウトしました" },
  NotAccountant: { state: "error", msg: "会計ではありません" },
  RequestApproved: { state: "success", msg: "リクエストを承認しました" },
  RequestRejected: { state: "success", msg: "リクエストを拒否しました" },
} as const satisfies Record<string, { state: SessionFlashDataType["toast"]["state"]; msg: string }>

// トーストのケースの識別名
type FlashCaseType = keyof typeof flashCases

// セッションにケース別のトーストを設定
export function setToastByCase(session: SessionType, caseName: FlashCaseType): SessionType {
  return setToast(session, flashCases[caseName].state, flashCases[caseName].msg)
}
// コミットも行う場合
export async function commitToastByCase(session: SessionType, caseName: FlashCaseType): Promise<ReturnType<typeof commitSession>> {
  return await commitSession(setToastByCase(session, caseName))
}

// セッションデータに型を持たせる
// ユーザー情報をリクエストヘッダーのセッションから取得
// 重要：セッションを生成して返す
export async function getSessionInfo(
  request: Request,
): Promise<{ success: true; session: SessionType; sessionData: SessionDataType } | { success: false; session: SessionType; sessionData: undefined }> {
  const session = await getSession(request.headers.get("Cookie"))
  const userId = session.get("userId")
  const userType = session.get("userType")
  if (userId === undefined || userType === undefined) {
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
export async function destroySessionInfo(request: Request, logout = false): Promise<ReturnType<typeof commitToastByCase>> {
  const session = await getSession(request.headers.get("Cookie"))
  session.unset("userId")
  session.unset("userType")
  return await commitToastByCase(session, logout ? "Logout" : "UnAuthorized")
}
