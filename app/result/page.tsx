import { Suspense } from "react"
import ResultPage from "@/components/testPage/result"

export default function ResultPageRoute() {
  return (
    <Suspense fallback={<div>Loading results...</div>}>
      <ResultPage />
    </Suspense>
  )
}
