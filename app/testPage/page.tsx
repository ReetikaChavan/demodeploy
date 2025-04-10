"use client";
import { useSearchParams } from "next/navigation";
import Exam from "@/components/testPage/testPage";

const TestPage = () => {
  const searchParams = useSearchParams();

  const title = decodeURIComponent(searchParams.get("title") || "");
  const category = decodeURIComponent(searchParams.get("category") || "");

  return (
    <div className="min-h-screen">
      <Exam title={title} category={category} />
    </div>
  )
};  

export default TestPage;
