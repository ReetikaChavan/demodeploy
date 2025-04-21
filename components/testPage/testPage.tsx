"use client"

import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast, Toaster } from "sonner"
import ResultPage from "@/components/testPage/result"

// Types
type QuestionType = {
  question: string
  options: string[]
  correctAnswer: string
}

type ExamData = {
  title: string
  timer: number
  level: string
  category: string
  questions: QuestionType[]
}

const ScrollContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [scrollCirclePosition, setScrollCirclePosition] = useState(30)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const scrollIndicatorRef = useRef<SVGSVGElement | null>(null)
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    // Check initially if scrolling is needed
    checkIfScrollable()

    function checkIfScrollable() {
      const container = scrollContainerRef.current
      if (!container) return

      // Show indicator only if content requires scrolling
      const isScrollable = container.scrollHeight > container.clientHeight
      setShowScrollIndicator(isScrollable)
    }

    function updateScrollIndicator() {
      const container = scrollContainerRef.current
      if (!container || !scrollIndicatorRef.current) return

      // Update scrollable status
      checkIfScrollable()

      const scrollable = container.scrollHeight - container.clientHeight
      const scrollPercentage =
        scrollable <= 0 ? 0 : container.scrollTop / scrollable

      const maxPosition = 270
      const minPosition = 30
      const newPosition =
        minPosition + scrollPercentage * (maxPosition - minPosition)

      setScrollCirclePosition(newPosition)
    }

    // Add scroll event listener
    container.addEventListener("scroll", updateScrollIndicator)

    const resizeObserver = new ResizeObserver(() => {
      checkIfScrollable()
      updateScrollIndicator()
    })

    resizeObserver.observe(container)

    return () => {
      container.removeEventListener("scroll", updateScrollIndicator)
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div className="relative">
      <div
        ref={scrollContainerRef}
        className="custom-scrollbar max-h-[125px] overflow-x-hidden overflow-y-auto pr-2"
        style={{ position: "relative" }}
      >
        {children}
      </div>
      {showScrollIndicator && (
        <div className="pointer-events-none absolute top-0 right-[-5px] z-20 h-full w-6">
          <svg
            ref={scrollIndicatorRef}
            viewBox="0 0 20 300"
            className="h-full w-full"
          >
            <line
              x1="10"
              y1="0"
              x2="10"
              y2="300"
              stroke="#333"
              strokeWidth="2"
            />
            <circle
              cx="10"
              cy={scrollCirclePosition}
              r="6"
              fill="#FFCC66"
              stroke="#333"
              strokeWidth="1"
            />
          </svg>
        </div>
      )}
    </div>
  )
}

// Helper to get question status
function getQuestionStatus(
  index: number,
  selectedOptions: Record<number, string | null>,
  visitedQuestions: number[],
  markedQuestions: number[]
):
  | "notVisited"
  | "answered"
  | "markedAndAnswered"
  | "markedForReview"
  | "notAnswered" {
  if (!visitedQuestions.includes(index)) {
    return "notVisited"
  }

  if (markedQuestions.includes(index)) {
    return selectedOptions[index] ? "markedAndAnswered" : "markedForReview"
  }

  if (selectedOptions[index]) {
    return "answered"
  }

  return "notAnswered"
}

// Sidebar Component
function ExamSidebar({
  examData,
  selectedOptions,
  visitedQuestions,
  markedQuestions,
  setActiveQuestion,
  theme,
  submitHovered,
  setSubmitHovered,
  handleSubmit,
  submitted,
  timeLeft,
  formatTime,
}: {
  examData: ExamData | null
  selectedOptions: Record<number, string | null>
  visitedQuestions: number[]
  markedQuestions: number[]
  setMarkedQuestions: (questions: number[]) => void
  activeQuestion: number
  setActiveQuestion: (questionIndex: number) => void
  theme: string
  submitHovered: boolean
  setSubmitHovered: (hovered: boolean) => void
  handleSubmit: (isAutoSubmit: boolean) => void
  timeLeft: number
  formatTime: (seconds: number) => string
  submitted: boolean
}) {
  const [isMobile, setIsMobile] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Check for mobile on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth <= 1024)
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 1024)
      }

      window.addEventListener("resize", handleResize)
      return () => {
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  if (!examData) return null

  return (
    <>
      {/* Toggle Button */}
      {isMobile && (
        <button
          onClick={toggleMenu}
          className="fixed top-4 right-4 z-50 rounded-full bg-white p-2 shadow-lg"
          aria-label="Toggle Exam Menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
            />
          </svg>
        </button>
      )}

      {/* Overlay for mobile when menu is open */}
      {isMobile && isMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={toggleMenu}
        />
      )}

      {/* sidebar*/}
      <div
  className={` ${
    isMobile
      ? `fixed inset-y-0 right-0 z-40 w-[230px] transition-transform duration-300 ease-in-out`
      : "absolute top-8 bottom-8 right-0 w-[230px] flex flex-col"
  } ${isMobile && !isMenuOpen ? "translate-x-full" : "translate-x-0"}
  rounded-l-3xl bg-white p-3 shadow-lg overflow-hidden`}
>
        {/* category name */}
        <div
          className="text-1lg absolute top-0 left-1/2 -translate-x-1/2 rounded-t-none rounded-b-3xl
            bg-black px-6 py-0.5 pb-0 text-center whitespace-nowrap text-white"
        >
          {examData?.category || "Loading..."}
        </div>

        {/* Title */}
        <h2 className="text-2sm absolute right-4 mt-5 max-w-xs text-right font-bold">
          {examData?.title || "Loading..."}
        </h2>

        {/* Timer and Divider */}
        <div className="mt-13 mb-0 ml-2 flex items-center">
          {/* Timer */}
          <div className="relative z-20">
            <svg
              width="100"
              height="70"
              viewBox="0 0 140 70"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer Rounded Rectangle */}
              <rect
                x="1"
                y="11"
                width="138"
                height="58"
                rx="29"
                fill={theme === "dark" ? "#1F2937" : "white"}
                stroke={theme === "dark" ? "#E5E7EB" : "#0C0C0C"}
                strokeWidth="2"
              />

              {/* Inner Yellow Border */}
              <rect
                x="5"
                y="15"
                width="130"
                height="50"
                rx="25"
                stroke="#FFCC66"
                strokeWidth="4"
              />

              {/* Middle Vertical Line */}
              <line
                x1="70"
                y1="10.5"
                x2="70"
                y2="2.5"
                stroke={theme === "dark" ? "#E5E7EB" : "#0C0C0C"}
                strokeWidth="2"
              />

              {/* Top Horizontal Line */}
              <path
                d="M44 2H94"
                stroke={theme === "dark" ? "#E5E7EB" : "#0C0C0C"}
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>

            {/* Timer Value */}
            <div
              className="absolute inset-0 flex items-center justify-center pt-2 text-xl font-semibold
                text-black"
            >
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Divider */}
          <div className="ml-1 flex-1">
            <svg
              width="100%"
              height="2"
              className="stroke-black"
            >
              <path
                strokeDasharray="9 9"
                strokeLinecap="round"
                strokeWidth="3"
                d="M1.5 1.5h1397"
              />
            </svg>
          </div>
        </div>

        {/* Status */}
        <div className="mt-1 space-y-1 pl-3">
  {/* Not visited */}
  <div className="flex items-center justify-end gap-2">
    <span className="text-2sm w-40 text-right">Not visited</span>
    <span className="h-6 w-6 flex items-center justify-center rounded-full bg-[#D9D9D9]">
      <svg className="h-4 w-4 text-white" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
        <line x1="18" y1="6" x2="6" y2="18" />
      </svg>
    </span>
  </div>
  {/* Saved answers */}
  <div className="flex items-center justify-end gap-2">
    <span className="text-2sm w-40 text-right">Saved answers</span>
    <span className="h-6 w-6 flex items-center justify-center rounded-full bg-[#CCEEAA]">
      <svg className="h-4.5 w-4.5 text-white" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
        <path d="M5 13l4 4L19 7" />
      </svg>
    </span>
  </div>
  {/* Not sure */}
  <div className="flex items-center justify-end gap-2">
    <span className="text-2sm w-40 text-right">Not sure</span>
    <span className="h-6 w-6 flex items-center justify-center rounded-full bg-[#AACCFF]">
      <svg className="h-4 w-1 text-white" fill="white" viewBox="0 0 4 16">
        <rect x="1" y="0" width="2" height="10" rx="1" />
        <rect x="1" y="12" width="2" height="2" rx="1" />
      </svg>
    </span>
  </div>
  {/* Not answered */}
  <div className="flex items-center justify-end gap-2">
    <span className="text-2sm w-40 text-right">Not answered</span>
    <span className="h-6 w-6 flex items-center justify-center rounded-full bg-[#FFB1AA]">
      <svg className="h-4 w-4 text-white" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
        <line x1="6" y1="6" x2="18" y2="18" />
        <line x1="6" y1="18" x2="18" y2="6" />
      </svg>
    </span>
  </div>
</div>

        {/* Question no */}
        <div className="relative left-8 mt-3 w-fit rounded-3xl bg-[#F7F7F7] p-2">
          <h3 className="mr-2 mb-2 text-right text-base font-semibold sm:text-lg">
            Questions
          </h3>
          <ScrollContainer>
            <div className="grid w-full grid-cols-5 gap-1 pr-1">
              {examData?.questions?.map((_, index) => {
                const status = getQuestionStatus(
                  index,
                  selectedOptions,
                  visitedQuestions,
                  markedQuestions
                )

                let bgColor = "bg-[#D9D9D9]"
                if (status === "answered") bgColor = "bg-[#CCEEAA]"
                if (status === "markedForReview") bgColor = "bg-[#AACCFF]"
                if (status === "markedAndAnswered") bgColor = "bg-[#AACCFF]"
                if (status === "notAnswered") bgColor = "bg-[#FFB1AA]"

                return (
                  <div
                    key={index}
                    className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-xs
                    font-semibold sm:h-7 sm:w-7 ${bgColor} relative z-10`}
                    onClick={() => {
                      setActiveQuestion(index)
                      // Scroll to the corresponding question
                      const questionElement = document.getElementById(
                        `question-${index}`
                      )
                      if (questionElement) {
                        questionElement.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        })
                      }
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </div>
                )
              })}
            </div>
          </ScrollContainer>
        </div>

        {/* Submit Button*/}
        <div className="mt-auto mb-2 ml-5 flex justify-center sticky bottom-2">  <motion.div
    className="relative flex justify-center"
    onHoverStart={() => setSubmitHovered(true)}
    onHoverEnd={() => setSubmitHovered(false)}
  >
    <motion.div
      className="absolute z-0 h-10 w-35 rounded-full"
      initial={{
        rotate: -3,
        backgroundColor: theme === "dark" ? "#FFCC66" : "#000000",
      }}
      animate={{
        backgroundColor: submitHovered
          ? "#FFCC66"
          : theme === "dark"
            ? "#000000"
            : "#000000",
      }}
      transition={{
        backgroundColor: {
          duration: 0.3,
          ease: "easeInOut",
        },
      }}
      style={{ transformOrigin: "center" }}
    />

    <button
      className="relative z-8 flex h-10 w-35 items-center justify-center rounded-full border-2 border-black bg-white text-sm font-medium text-gray-800 hover:bg-white md:text-base"
      onClick={() => handleSubmit(false)}
      disabled={submitted}
    >
      {submitted ? "Submitting..." : "Submit"}
    </button>
  </motion.div>
</div>

      </div>
    </>
  )
}

type Props = {
  title: string
  category: string
}
export default function Exam2({ title, category }: Props) {
  const router = useRouter()

  const [startTime, setStartTime] = useState<number>(0)
  const [examData, setExamData] = useState<ExamData | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(300)
  const [selectedOptions, setSelectedOptions] = useState<
    Record<number, string | null>
  >({})
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [showResultPage, setShowResultPage] = useState(false)

  // NEW STATES for question statuses
  const [visitedQuestions, setVisitedQuestions] = useState<number[]>([])
  const [markedQuestions, setMarkedQuestions] = useState<number[]>([])
  const [activeQuestion, setActiveQuestion] = useState<number>(0)

  const [hovered, setHovered] = useState<boolean>(false)
  const [submitHovered, setSubmitHovered] = useState(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [theme, setTheme] = useState<string>("light")

  // Check for mobile on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth <= 1024)
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 1024)
      }

      window.addEventListener("resize", handleResize)
      return () => {
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [])

  // Fetch exam data
  useEffect(() => {
    if (!category || !title) {
      toast.error("Invalid exam parameters. Please try again.")
      return
    }
    const encodedCategory = encodeURIComponent(category)
    const encodedTitle = encodeURIComponent(title)

    const fetchQuestions = async () => {
      try {
        const response = await fetch(
          `/api/questions?category=${encodedCategory}&title=${encodedTitle}`
        )
        if (!response.ok) throw new Error("Failed to load data")
        const data: ExamData = await response.json()
        setExamData(data)
        setTimeLeft(data.timer || 300)
      } catch (error) {
        console.error("Error loading questions:", error)
        toast.error("Failed to load questions. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    fetchQuestions()
  }, [category, title])

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !submitted) {
      const interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000)
      return () => clearInterval(interval)
    } else if (timeLeft === 0) {
      handleSubmit(true)
    }
  }, [timeLeft, submitted])

  useEffect(() => {
    setStartTime(Date.now())
  }, [])

  // Format timer
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Handle selecting an option
  const handleOptionSelect = (index: number, option: string) => {
    setSelectedOptions((prev) => ({ ...prev, [index]: option }))
    // Mark question as visited once the user interacts
    if (!visitedQuestions.includes(index)) {
      setVisitedQuestions((prev) => [...prev, index])
    }
  }

  // Mark question
  const handleMarkQuestion = (index: number) => {
    if (!markedQuestions.includes(index)) {
      setMarkedQuestions((prev) => [...prev, index])
    } else {
      // unmark if it is already marked
      setMarkedQuestions((prev) => prev.filter((qIndex) => qIndex !== index))
    }
  }

  // Handle final submit
  const handleSubmit = async (isAutoSubmit: boolean = false) => {
    if (!examData) return
    const allAnswered = examData.questions.every(
      (_, index: number) => selectedOptions[index] !== undefined
    )

    if (!isAutoSubmit && !allAnswered) {
      toast.error("Please answer all questions before submitting.", {
        duration: 3000,
        position: "top-center",
      })
      return
    }

    setSubmitted(true)

    // Calculate completion time in seconds
    const completionTime = Math.round((Date.now() - startTime) / 1000)

    // Calculate score
    let correctAnswers = 0
    examData.questions.forEach((question, index) => {
      if (selectedOptions[index] === question.correctAnswer) {
        correctAnswers++
      }
    })
    const score = Math.round((correctAnswers / examData.questions.length) * 100)

    // Get currentAttempt data from localStorage
    const currentAttemptStr = localStorage.getItem("currentAttempt")
    if (!currentAttemptStr) {
      toast.error("Attempt information not found.")
      return
    }

    const currentAttempt = JSON.parse(currentAttemptStr)
    const { deviceId, title, category } = currentAttempt

    try {
      // Save attempt data to API
      const response = await fetch("/api/saveAttempt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deviceId,
          title,
          category,
          score,
          completionTime,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error saving attempt:", errorData)
        toast.error("Failed to save your attempt. " + (errorData.error || ""))
      } else {
        toast.success("Quiz submitted successfully!", {
          duration: 2000,
          position: "top-center",
        })
      }
    } catch (error) {
      console.error("Error saving attempt:", error)
      toast.error("Failed to save your attempt due to a network error.")
    }

    // Store data for result page
    localStorage.setItem("selectedOptions", JSON.stringify(selectedOptions))
    localStorage.setItem("examData", JSON.stringify(examData))
    localStorage.setItem("completionTime", completionTime.toString())

    // Navigate to results page
setTimeout(() => {
  setShowResultPage(true)
}, 1500)

  }

  // Option labels
  const optionLabels = ["A", "B", "C", "D"]
  
  if (showResultPage) {
    return <ResultPage />
  }
  return (
<div className="flex min-h-screen flex-col overflow-y-hidden bg-gray-100 md:flex-row md:relative">
{/* Main content */}
  <div className="flex flex-1 flex-col items-center px-4 md:px-8 pb-4 md:pb-8">
{/* Title Card */}
        <motion.div
          className="relative z-20 -mb-4 flex justify-center py-2 md:-mb-6 md:py-4"
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          style={{ marginTop: "1.5rem" }}
        >
          <motion.div
            className="absolute z-0 h-10 w-[80%] rounded-full md:h-12 md:w-[500px]"
            initial={{ rotate: -2 }}
            animate={{
              backgroundColor: hovered
                ? "#FFCC66"
                : theme === "dark"
                  ? "#ffffff"
                  : "#000000",
            }}
            transition={{
              backgroundColor: {
                duration: 0.3,
                ease: "easeInOut",
              },
            }}
          />

          {/* Title */}
          <div
            className="relative z-10 flex h-10 w-[80%] items-center justify-center rounded-full
              border-2 border-black bg-white px-3 text-base font-bold text-gray-800 shadow-md
              md:h-12 md:w-[500px] md:px-6 md:text-2xl"
          >
            <span className="truncate">
              {loading ? "Loading..." : examData?.title || title}
            </span>
          </div>
        </motion.div>

        {/* Main Question Container */}
        <div
      className="relative z-10 w-full max-w-full md:max-w-2xl lg:max-w-3xl flex-grow flex flex-col"
      style={{ marginTop: "-1.5rem" }}
    >
          {/* Timer */}
          {isMobile && (
    <div className="absolute top-2 right-4 z-30 flex items-center justify-center">
              <div className="relative">
                <svg
                  className="w-20 sm:w-22 md:w-28"
                  width="100"
                  height="50"
                  viewBox="0 0 140 70"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="1"
                    y="11"
                    width="138"
                    height="58"
                    rx="29"
                    fill={theme === "dark" ? "#1F2937" : "white"}
                    stroke={theme === "dark" ? "#E5E7EB" : "#0C0C0C"}
                    strokeWidth="2"
                  />
                  <rect
                    x="5"
                    y="15"
                    width="130"
                    height="50"
                    rx="25"
                    stroke="#FFCC66"
                    strokeWidth="4"
                  />
                  <line
                    x1="70"
                    y1="10.5"
                    x2="70"
                    y2="2.5"
                    stroke={theme === "dark" ? "#E5E7EB" : "#0C0C0C"}
                    strokeWidth="2"
                  />
                  <path
                    d="M44 2H94"
                    stroke={theme === "dark" ? "#E5E7EB" : "#0C0C0C"}
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                <div
                  className="absolute inset-0 flex items-center justify-center pt-2 text-xs font-semibold
                    text-gray-800 sm:text-sm md:text-base"
                >
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
          )}

          {/* Questions Container */}
          <div className="mb-4 flex flex-col rounded-4xl bg-white px-3 pt-12 pb-6 shadow-lg md:px-5 md:pt-16 flex-grow md:h-full">
        <div className="flex-grow flex flex-col justify-between">
          <div className="flex-grow">
            {loading || !examData ? (
              <p className="text-center text-black">Loading questions...</p>
            ) : (
              <div
                key={activeQuestion}
                id={`question-${activeQuestion}`}
                className="flex flex-col h-full"
                onMouseEnter={() => {
                  if (!visitedQuestions.includes(activeQuestion)) {
                    setVisitedQuestions((prev) => [...prev, activeQuestion])
                  }
                }}
              >
                <h2 className="text-black-800 mb-4 text-xl font-semibold">
                  {activeQuestion + 1}. {examData?.questions?.[activeQuestion]?.question}
                </h2>

                <div className="flex-grow">
                  {examData?.questions?.[activeQuestion]?.options?.map(
                    (option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`my-2 cursor-pointer rounded-4xl border p-3 pl-10 ${
                          selectedOptions[activeQuestion] === option
                            ? "border-black bg-[#FFCC66] text-gray-800"
                            : "border-black bg-white text-black"
                          }`}
                        onClick={() =>
                          handleOptionSelect(activeQuestion, option)
                        }
                      >
                        <span className="mr-2 font-bold text-black">
                          {optionLabels[optionIndex]}.
                        </span>
                        <span className="font-medium text-black">{option}</span>
                      </div>
                    )
                  )}
</div>
              </div>
            )}
          </div>
                  {/* Buttons */}
<div className="mt-auto pt-4 mb-2 flex justify-end gap-4">
  {activeQuestion < (examData?.questions?.length ?? 0) - 1 && (
    <button
      className={`rounded-full border px-4 py-2 text-sm ${
        markedQuestions.includes(activeQuestion)
          ? "bg-[#AACCFF] text-black"
          : "bg-black text-white"
      }`}
      onClick={() => {
        handleMarkQuestion(activeQuestion);
        setActiveQuestion((prev) => prev + 1);
      }}
    >
      {markedQuestions.includes(activeQuestion)
        ? "Unmark & Next"
        : "Mark for Review & Next"}
    </button>
  )}

  {activeQuestion < (examData?.questions?.length ?? 0) - 1 && (
    <button
      className="rounded-full bg-black px-5 py-2 text-sm text-white"
      onClick={() => setActiveQuestion((prev) => prev + 1)}
    >
      Save & Next
    </button>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>

      {/* Sidebar*/}
      <ExamSidebar
    examData={examData}
    selectedOptions={selectedOptions}
    visitedQuestions={visitedQuestions}
    markedQuestions={markedQuestions}
    setMarkedQuestions={setMarkedQuestions}
    activeQuestion={activeQuestion}
    setActiveQuestion={setActiveQuestion}
    theme={theme}
    submitHovered={submitHovered}
    setSubmitHovered={setSubmitHovered}
    handleSubmit={handleSubmit}
    submitted={submitted}
    timeLeft={timeLeft}
    formatTime={formatTime}
  />

      <Toaster />
    </div>
  )
}
