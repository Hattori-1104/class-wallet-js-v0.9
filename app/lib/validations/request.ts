import { z } from "zod"

export const requestFormSchema = z.object({
  action: z.enum(["approve", "reject"]),
})
