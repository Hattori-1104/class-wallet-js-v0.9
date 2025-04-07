import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"

type PersonUIProps = {
  person: {
    name: string
  }
}
export function PersonCompactUI({ person }: PersonUIProps) {
  return <div className="h-8 w-28 text-center border rounded-full flex justify-center items-center text-sm">{person.name}</div>
}

export function PersonUI({ person }: PersonUIProps) {
  return (
    <div className="flex items-center gap-2 border rounded-md py-2 px-4">
      <div>{person.name}</div>
    </div>
  )
}
