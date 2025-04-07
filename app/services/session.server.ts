import { createCookieSessionStorage } from "@remix-run/node"
import { z } from "zod"

const sessionDataSchema = z.object({
  user: z.object({
    id: z.string(),
    type: z.enum(["student", "teacher"]),
  }),
  tempUserType: z.enum(["student", "teacher"]).optional(),
  oauthState: z.string().optional(),
})

const sessionFlashSchema = z.object({
  error: z
    .object({
      message: z.string(),
    })
    .optional(),
})

type SessionDataType = z.infer<typeof sessionDataSchema>
type SessionFlashDataType = z.infer<typeof sessionFlashSchema>

const sessionStorage = createCookieSessionStorage<SessionDataType, SessionFlashDataType>({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    secrets: [process.env.SESSION_SECRET || "s3cr3t"],
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  },
})

export const { getSession, commitSession, destroySession } = sessionStorage

export async function setOauthState(request: Request) {
  const session = await getSession(request.headers.get("Cookie"))
  const state = crypto.randomUUID()
  session.set("oauthState", state)
  return {
    state,
    session,
  }
}

export async function verifyOauthState(request: Request, state: string) {
  const session = await getSession(request.headers.get("Cookie"))
  const savedState = session.get("oauthState")
  return savedState === state
}
