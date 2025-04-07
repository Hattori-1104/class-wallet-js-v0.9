import { ContainerSection } from "~/components/common/container"

type ManagerSectionProps = {
  leaders: { id: string; name: string }[]
  accountantStudents: { id: string; name: string }[]
  teachers: { id: string; name: string }[]
}

export function ManagerSection({ leaders, accountantStudents, teachers }: ManagerSectionProps) {
  return (
    <ContainerSection title="責任者">
      <ul className="list-disc space-y-1">
        {leaders.length > 0 ? (
          leaders.map((leader) => (
            <li key={leader.id} className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">パート責任者</div>
              <div>{leader.name}</div>
            </li>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">パート責任者がいません</div>
        )}
        {accountantStudents.map((student) => (
          <li key={student.id} className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">HR会計</div>
            <div>{student.name}</div>
          </li>
        ))}
        {teachers.length > 0 ? (
          teachers.map((teacher) => (
            <li key={teacher.id} className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">担任教師</div>
              <div>{teacher.name}</div>
            </li>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">担任教師がいません</div>
        )}
      </ul>
    </ContainerSection>
  )
}
