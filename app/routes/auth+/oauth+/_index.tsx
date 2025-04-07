import { LoaderFunctionArgs, redirect } from "@remix-run/node"
import { z } from "zod"
import { getGoogleAuthUrl } from "~/services/oauth.server"
import { commitSession, setOauthState } from "~/services/session.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { success, data } = z.enum(["student", "teacher"]).safeParse(new URL(request.url).searchParams.get("user-type"))
  const userType = success ? data : "student"

  const { state, session } = await setOauthState(request)
  session.set("tempUserType", userType)
  const authUrl = getGoogleAuthUrl(state)
  return redirect(authUrl, { headers: { "Set-Cookie": await commitSession(session) } })
}
