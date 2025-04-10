"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Exam from "@/components/testPage/testPage"

function PageWithParams() {
  const searchParams = useSearchParams()
  const title = decodeURIComponent(searchParams.get("title") || "")
  const category = decodeURIComponent(searchParams.get("category") || "")

  return <Exam title={title} category={category} />
}

export default function TestPage() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <PageWithParams />
      </Suspense>
    </div>
  )
}
