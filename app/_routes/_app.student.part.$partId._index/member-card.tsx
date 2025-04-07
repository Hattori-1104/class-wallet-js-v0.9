import { Badge } from "~/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "~/components/ui/drawer"
import { ScrollArea } from "~/components/ui/scroll-area"

import { User, UserPart } from "@prisma/client"

type PartMemberCardProps = {
  userParts: (Pick<UserPart, "roleId"> & { user: User })[]
}

export function PartMemberCard({ userParts }: PartMemberCardProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Card>
          <CardHeader>
            <CardTitle>メンバー</CardTitle>
            <CardDescription>パートに所属するメンバーと役職</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userParts
                .filter(({ roleId }) => roleId === 1 || roleId === 2)
                .sort((a, b) => b.roleId - a.roleId)
                .map(({ user, roleId }) => (
                  <div key={user.id} className="flex items-center justify-between rounded border p-3">
                    <div className="flex flex-row items-center justify-between grow">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      {
                        [
                          <Badge key={0} variant="outline">
                            メンバー
                          </Badge>,
                          <Badge key={1} variant="secondary">
                            副会計
                          </Badge>,
                          <Badge key={2} variant="default">
                            会計
                          </Badge>,
                        ][roleId]
                      }
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>すべてのメンバー</DrawerTitle>
          <DrawerDescription>パートに所属するメンバーと役職</DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="max-h-[80vh] overflow-y-auto">
          {userParts
            .sort((a, b) => b.roleId - a.roleId - a.roleId)
            .map(({ user, roleId }) => (
              <div key={user.id} className="flex items-center justify-between border-t p-3">
                <div className="flex flex-row items-center justify-between w-full">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  {
                    [
                      <Badge key={0} variant="outline">
                        メンバー
                      </Badge>,
                      <Badge key={1} variant="secondary">
                        副会計
                      </Badge>,
                      <Badge key={2} variant="default">
                        会計
                      </Badge>,
                    ][roleId]
                  }
                </div>
              </div>
            ))}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}
