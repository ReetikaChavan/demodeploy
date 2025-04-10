"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ThemeToggle from "./themeToggle"
import { toast, Toaster } from "sonner"

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
// Sidebar Component
function ExamSidebar({
  examData,
  selectedOptions,
  visitedQuestions,
  markedQuestions,
  setMarkedQuestions,
  activeQuestion,
  setActiveQuestion,
  theme,
  submitHovered,
  setSubmitHovered,
  handleSubmit,
  submitted,
  timeLeft, // Add this prop
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
  timeLeft: number // Add this type
  formatTime: (seconds: number) => string // Add this type
  submitted: boolean
}) {
  const [isMobile, setIsMobile] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  if (!examData) return null

  return (
    <>
      {/* Mobile Menu Toggle Button */}
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
          className="bg-opacity-50 fixed inset-0 z-30 bg-black"
          onClick={toggleMenu}
        />
      )}

      {/* sidebar - Responsive */}
      <div
        className={` ${
          isMobile
            ? `fixed inset-y-0 right-0 z-40 w-[280px] transition-transform duration-300
              ease-in-out`
            : "absolute top-20 right-0 w-[280px]"
          } ${isMobile && !isMenuOpen ? "translate-x-full" : "translate-x-0"} flex
          max-h-[910px] min-h-[650px] flex-col overflow-auto rounded-l-3xl bg-white p-4
          shadow-lg`}
      >
        {/* category name */}
        <div
          className="absolute top-0 left-7 rounded-t-none rounded-b-3xl bg-black px-6 py-0.5 pb-0
            text-lg text-white"
        >
          {examData?.category || "Loading..."}
        </div>

        {/* Title */}
        <h2 className="absolute right-4 mt-8 text-lg font-bold">
          {examData?.title || "Loading..."}
        </h2>

        {/* Timer and Divider Container - Reorganized */}
        <div className="mt-20 flex items-center">
          {/* Timer - On left side */}
          <div className="relative z-20">
            <svg
              width="130"
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

          {/* Divider - Now to the right of timer */}
          <div className="ml-2 flex-1">
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
        <div className="mt-4 space-y-3 pl-10">
          <div className="flex items-center justify-end gap-3">
            <span className="w-40 text-right text-lg">Not visited</span>
            <span className="h-5 w-5 rounded-full bg-[#D9D9D9]"></span>
          </div>
          <div className="flex items-center justify-end gap-3">
            <span className="w-40 text-right text-lg">Saved answers</span>
            <span className="h-5 w-5 rounded-full bg-[#CCEEAA]"></span>
          </div>
          <div className="flex items-center justify-end gap-3">
            <span className="w-40 text-right text-lg">Marked for Review</span>
            <span className="h-5 w-5 rounded-full bg-[#AACCFF]"></span>
          </div>
          <div className="flex items-center justify-end gap-3">
            <span className="w-40 text-right text-lg">Not answered</span>
            <span className="h-5 w-5 rounded-full bg-[#FFB1AA]"></span>
          </div>
        </div>

        {/* Question no */}
        <div className="relative left-10 mt-6 w-fit rounded-3xl bg-[#F7F7F7] p-4">
          <h3 className="mb-2 text-right text-xl font-semibold">Questions</h3>
          <div className="relative left-3 grid grid-cols-5 gap-2">
            {examData?.questions?.map((_, index) => {
              const status = getQuestionStatus(
                index,
                selectedOptions,
                visitedQuestions,
                markedQuestions
              )

              let bgColor = "bg-[#D9D9D9]" // not visited
              if (status === "answered") bgColor = "bg-[#CCEEAA]"
              if (status === "markedForReview") bgColor = "bg-[#AACCFF]"
              if (status === "markedAndAnswered") bgColor = "bg-[#AACCFF]"
              if (status === "notAnswered") bgColor = "bg-[#FFB1AA]"

              return (
                <div
                  key={index}
                  className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-sm
                  font-semibold ${bgColor}`}
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
        </div>

        {/* Submit Button - We'll keep the original one with Framer Motion */}
        <div className="mt-10 flex justify-center">
          <motion.div
            className="relative flex justify-center"
            onHoverStart={() => setSubmitHovered(true)}
            onHoverEnd={() => setSubmitHovered(false)}
          >
            <motion.div
              className="absolute z-0 h-10 w-40 rounded-full md:h-12 md:w-48"
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
              className="relative z-10 flex h-10 w-40 items-center justify-center rounded-full border-2
                border-black bg-white text-sm font-medium text-gray-800 hover:bg-white md:h-12
                md:w-48 md:text-base lg:text-lg"
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
      setIsMobile(window.innerWidth < 768)

      const handleResize = () => {
        setIsMobile(window.innerWidth < 768)
      }

      window.addEventListener("resize", handleResize)
      return () => {
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [])

  // Load and listen for theme changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") || "light"
      setTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
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

  // Save theme changes
  useEffect(() => {
    localStorage.setItem("theme", theme)
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

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
    // Set start time when exam begins
    setStartTime(Date.now())
  }, [])

  // Format timer - This function moved here so it can be used by the ExamSidebar component
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

  // Mark question as flagged (if you have a button for it)
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
      router.push("/result")
    }, 1500)
  }

  // Option labels
  const optionLabels = ["A", "B", "C", "D"]

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 md:flex-row">
      {/* Main content */}
      <div className="flex flex-1 flex-col items-center pr-4 md:pr-8">
        {/* Theme Toggle */}
        <div className="flex w-full justify-end">
          <ThemeToggle />
        </div>

        {/* Title Card with animation */}
        <motion.div
          className="relative flex justify-center py-4 md:py-8"
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
        >
          <motion.div
            className="absolute z-0 h-12 w-full rounded-full md:h-16 md:w-[716px]"
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
            className="relative z-10 flex h-12 w-full items-center justify-center rounded-full border-2
              border-black bg-white text-lg font-bold text-gray-800 md:h-16 md:w-[716px]
              md:text-3xl"
          >
            {loading ? "Loading..." : examData?.title || title}
          </div>
        </motion.div>

        {/* Main Question Container */}
        <div className="relative mt-6 w-full max-w-full md:max-w-5xl">
          {/* Timer - Only show this timer on smaller screens where sidebar might not be visible */}
          {isMobile && (
            <div className="absolute -top-8 right-4 z-20 flex items-center justify-center">
              <div className="relative">
                <svg
                  className="w-28 md:w-36"
                  width="140"
                  height="70"
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
                  className="absolute inset-0 flex items-center justify-center pt-2 text-base font-semibold
                    text-gray-800 md:text-xl"
                >
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
          )}

          {/* Questions Container */}
          <div
            className="flex min-h-[calc(100vh-200px)] flex-col rounded-4xl border border-gray-300
              bg-white p-4 shadow-lg md:p-6"
          >
            <div
              className="custom-scrollbar flex-grow overflow-y-auto px-4 pt-6 md:px-6 md:pt-12"
              style={{ maxHeight: "70vh" }}
            >
              {loading ? (
                <p className="text-center text-gray-600">
                  Loading questions...
                </p>
              ) : (
                examData?.questions.map(
                  (question: QuestionType, index: number) => (
                    <div
                      key={index}
                      id={`question-${index}`}
                      className="mb-8"
                      onMouseEnter={() => {
                        // Mark question as visited on hover or scroll
                        if (!visitedQuestions.includes(index)) {
                          setVisitedQuestions((prev) => [...prev, index])
                        }
                      }}
                    >
                      <h2 className="text-black-800 mb-4 text-xl font-semibold">
                        {index + 1}. {question.question}
                      </h2>
                      {question.options.map(
                        (option: string, optionIndex: number) => (
                          <div
                            key={optionIndex}
                            className={`my-3 cursor-pointer rounded-4xl border p-4 pl-12 ${
                              selectedOptions[index] === option
                                ? "border-gray-950 bg-[#FFCC66] text-gray-800"
                                : "border-gray-300 bg-white text-black"
                              }`}
                            onClick={() => handleOptionSelect(index, option)}
                          >
                            <span className="mr-2 font-bold text-black">
                              {optionLabels[optionIndex]}.
                            </span>{" "}
                            <span className="font-medium text-black">
                              {option}
                            </span>
                          </div>
                        )
                      )}

                      {/* Example "Mark" button to illustrate flagged logic */}
                      <button
                        className={`mt-2 rounded-full border px-4 py-2 text-sm ${
                          markedQuestions.includes(index)
                            ? "bg-[#AACCFF] text-black"
                            : "bg-black text-white"
                          }`}
                        onClick={() => handleMarkQuestion(index)}
                      >
                        {markedQuestions.includes(index)
                          ? "Unmark"
                          : "Mark & Answer"}
                      </button>
                    </div>
                  )
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Now using our redesigned component */}
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
        timeLeft={timeLeft} // Pass the timeLeft state
        formatTime={formatTime}
      />

      <Toaster />
    </div>
  )
}
