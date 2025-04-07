import { Await, Link, defer, useFetcher, useLoaderData, useNavigate, useNavigation, useRevalidator } from "@remix-run/react"
import { RefreshCw, Table2 } from "lucide-react"
import { Suspense, useEffect } from "react"
import { z } from "zod"
import { Container, ContainerSection, ContainerTitle } from "~/components/common/container"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { formatMoney } from "~/utils/display"

const SHEET_URL = "https://docs.google.com/spreadsheets/d/1lwEZq3AAJ8DYPOwCyh3FQAxxG8OtxhCpxvXb2NcsStw/edit?usp=sharing"
const API_URL = "https://script.google.com/macros/s/AKfycbzA0676zXWOWCyPkB8r4UYzQ8YQaSTQKirXbsw8ERxKFQCvivQUqu-RjIn4veghe_Vw7g/exec"

const SpreadsheetSchema = z.array(z.tuple([z.string(), z.number()]))

export const loader = async () => {
  const data = await getFromSpreadsheet()
  return { data }
}

async function getFromSpreadsheet() {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      "Content-Type": "text/plain",
    },
  })
  const data = await response.json()
  const parsed = SpreadsheetSchema.safeParse(data)
  if (!parsed.success) {
    return []
  }
  return parsed.data
}

export default function EditWallet() {
  const { data } = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const revalidator = useRevalidator()
  const isLoading = navigation.state === "loading" || revalidator.state === "loading"
  return (
    <Container>
      <ContainerTitle>ウォレットの編集</ContainerTitle>
      <ContainerSection>
        <div className="space-y-4">
          <div className="flex flex-col gap-2 desk:flex-row">
            <Link to={SHEET_URL} target="_blank" className="block">
              <Button variant="spreadsheet" className="w-full">
                <Table2 />
                <span>ウォレットの編集</span>
              </Button>
            </Link>
            <Button variant="spreadsheet" onClick={revalidator.revalidate} disabled={isLoading}>
              <RefreshCw />
              <span>{isLoading ? "同期中..." : "スプレッドシートの変更を同期"}</span>
            </Button>
          </div>
          <div className="flex gap-2">
            <Table>
              <TableCaption>{data.length > 0 ? `${data.length}件のウォレット` : "データがありません"}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>ウォレット名</TableHead>
                  <TableHead className="text-right">予算</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row[0]}>
                    <TableCell>{row[0]}</TableCell>
                    <TableCell className="text-right">{formatMoney(row[1])}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </ContainerSection>
    </Container>
  )
}
