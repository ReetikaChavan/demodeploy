
import { Suspense } from "react"
import DescriptionPage from "@/components/dashBoard/description";

export default function DescriptionPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DescriptionPage />
    </Suspense>
  )
}
