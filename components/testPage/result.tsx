"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"

type QuestionType = {
  question: string
  options: string[]
  correctAnswer: string
}

type QuestionReviewType = {
  question: string
  options: string[]
  correctAnswer: string
  userAnswer: string
  index: number
}

type ExamData = {
  title: string
  timer: number
  level: string
  category: string
  difficulty: string
  questions: QuestionType[]
}

type AttemptData = {
  title: string
  category: string
  attemptsLeft: number
  totalAttempts: number
  bestScore: number
  averageCompletionTime: number
}

type RecommendedExam = {
  id: string
  title: string
  category: string
  level: string
  difficulty: string
  estimatedTime?: number
}

const ResultPage = () => {
  const [score, setScore] = useState<number | null>(null)
  const [correctAnswers, setCorrectAnswers] = useState<number>(0)
  const [wrongAnswers, setWrongAnswers] = useState<number>(0)
  const [examTitle, setExamTitle] = useState<string>("")
  const [examCategory, setExamCategory] = useState<string>("")
  const [completionTime, setCompletionTime] = useState<number | null>(null)
  const [timeDiffMs, setTimeDiffMs] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [retakeHovered, setRetakeHovered] = useState(false)
  const [theme, setTheme] = useState<string>("light")
  const [attemptData, setAttemptData] = useState<AttemptData | null>(null)
  const [wrongQuestions, setWrongQuestions] = useState<
    Array<{
      question: string
      options: string[]
      correctAnswer: string
      userAnswer: string
      index: number
    }>
  >([])
  const [recommendedExams, setRecommendedExams] = useState<RecommendedExam[]>(
    []
  )
  const [hovered, setHovered] = useState<boolean>(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [allQuestions, setAllQuestions] = useState<QuestionReviewType[]>([])
  const [activeTab, setActiveTab] = useState<"results" | "review-all" | "review-wrong">("results")


  // Get title, category and deviceId
  const [deviceId, setDeviceId] = useState<string>("")

  // Skill percentages calculated based on the score
  const skillPercent = score ? Math.min(100, Math.max(0, score + 10)) : 0
  const knowledgePercent = score ? Math.min(100, Math.max(0, score - 5)) : 0
  const applicationPercent = score ? Math.min(100, Math.max(0, score - 10)) : 0

  useEffect(() => {
    // Get theme from localStorage
    const storedTheme = localStorage.getItem("theme") || "light"
    setTheme(storedTheme)
    document.documentElement.classList.toggle("dark", storedTheme === "dark")

    // Get deviceId from localStorage
    const storedDeviceId = localStorage.getItem("deviceId")
    if (storedDeviceId) {
      setDeviceId(storedDeviceId)
    }

    // Try to get title and category from URL params first
    const urlTitle = searchParams?.get("title")
    const urlCategory = searchParams?.get("category")

    if (urlTitle && urlCategory) {
      setExamTitle(decodeURIComponent(urlTitle).trim())
      setExamCategory(decodeURIComponent(urlCategory).trim())
    }

    // Retrieve selected answers and exam data from localStorage
    const storedAnswers = JSON.parse(
      localStorage.getItem("selectedOptions") || "{}"
    )
    const examData: ExamData = JSON.parse(
      localStorage.getItem("examData") || "null"
    )
    const currentAttempt = JSON.parse(
      localStorage.getItem("currentAttempt") || "null"
    )

    // If URL params aren't available, use exam data from localStorage
    if (!urlTitle || !urlCategory) {
      if (examData) {
        setExamTitle(examData.title)
        setExamCategory(examData.category)
      } else if (currentAttempt) {
        setExamTitle(currentAttempt.title || "")
        setExamCategory(currentAttempt.category || "")
      }
    }

    if (!storedAnswers || !examData) {
      router.push("/")
      return
    }

    const storedCompletionTime = localStorage.getItem("completionTime")
    if (storedCompletionTime) {
      setCompletionTime(parseInt(storedCompletionTime, 10))
    }

    let correctCount = 0
    let totalQuestions = examData.questions.length
    const wrongQuestionsData: QuestionReviewType[] = []
    const allQuestionsData: QuestionReviewType[] = []

    examData.questions.forEach((question, index) => {
      const userAnswer = storedAnswers[index] || "Not answered"

      // Populate all questions data
      allQuestionsData.push({
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        userAnswer: userAnswer,
        index: index,
      })

      // Populate wrong questions data
      if (userAnswer === question.correctAnswer) {
        correctCount++
      } else {
        wrongQuestionsData.push({
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          userAnswer: userAnswer,
          index: index,
        })
      }
    })

    const wrongCount = totalQuestions - correctCount

    // Calculate percentage score
    const percentage = (correctCount / totalQuestions) * 100

    setScore((correctCount / totalQuestions) * 100)
    setCorrectAnswers(correctCount)
    setWrongAnswers(wrongCount)
    setWrongQuestions(wrongQuestionsData)
    setAllQuestions(allQuestionsData)

    // Trigger confetti if score is good
    if (percentage >= 70) {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      }, 500)
    }

    // Save the attempt result to the database
    const saveAttemptResult = async () => {
      if (currentAttempt && percentage !== null && completionTime !== null) {
        try {
          const response = await fetch("/api/saveAttempt", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              deviceId: currentAttempt.deviceId || storedDeviceId,
              title: examData.title,
              category: examData.category,
              score: percentage,
              completionTime: completionTime,
            }),
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(
              `Failed to save attempt: ${response.status} - ${errorText}`
            )
          }

          const data = await response.json()
          setAttemptData(data)
        } catch (error) {
          console.error("Error saving attempt:", error)
        }
      }
    }

    // Fetch attempt data
    const fetchAttemptData = async () => {
      const title = examData?.title || urlTitle
      const category = examData?.category || urlCategory

      if (!deviceId || !title || !category) return

      console.log("Fetching attempt data with:", { deviceId, title, category })

      try {
        const response = await fetch(
          `/api/attempts?deviceId=${encodeURIComponent(deviceId)}&title=${encodeURIComponent(title)}&category=${encodeURIComponent(category)}`
        )

        if (!response.ok) {
          throw new Error(`Error fetching attempt data: ${response.status}`)
        }

        const data = await response.json()
        console.log("Attempt data received:", data)

        setAttemptData(data)
      } catch (error) {
        console.error("Error:", error)
      }
    }

    // Fetch recommended exams
    const fetchRecommendedExams = async () => {
      try {
        const category = examData?.category || urlCategory
        if (!category || !percentage) return

        const response = await fetch(
          `/api/recommendExams?category=${encodeURIComponent(category)}&score=${percentage}`
        )
        if (response.ok) {
          const data = await response.json()
          setRecommendedExams(data.recommendedExams || [])
        }
      } catch (error) {
        console.error("Error fetching recommended exams:", error)
        // Fallback mock data
        setRecommendedExams([
          {
            id: "1",
            title: "Advanced " + (examData?.category || examCategory),
            category: examData?.category || examCategory,
            level: "Advanced",
            difficulty: "Hard",
          },
          {
            id: "2",
            title: (examData?.category || examCategory) + " Certification",
            category: examData?.category || examCategory,
            level: "Professional",
            difficulty: "Medium",
          },
        ])
      }
    }

    saveAttemptResult()
    fetchAttemptData()
    fetchRecommendedExams()
    setLoading(false)
  }, [router, searchParams, deviceId, timeDiffMs])

  // const handleReturnToDashboard = () => {
  //   // Clear result data but keep deviceId
  //   localStorage.removeItem("selectedOptions")
  //   localStorage.removeItem("examData")
  //   localStorage.removeItem("currentAttempt")
  //   localStorage.removeItem("examStartTime")
  //   localStorage.removeItem("examEndTime")
  //   router.push("/")
  // }

  const handleRetakeExam = () => {
    // Keep exam data but clear answers
    localStorage.removeItem("selectedOptions")
    localStorage.removeItem("examStartTime")
    localStorage.removeItem("examEndTime")
    
    // Pass title and category as URL parameters
    router.push(`/testPage?title=${encodeURIComponent(examTitle)}&category=${encodeURIComponent(examCategory)}`)
  }

  // const navigateToExam = (title: string, category: string) => {
  //   router.push(
  //     `/description?title=${encodeURIComponent(title)}&category=${encodeURIComponent(category)}`
  //   )
  // }

  // const getDifficultyColor = (difficulty: string) => {
  //   if (!difficulty) return { bg: "bg-gray-100", text: "text-gray-800" }

  //   difficulty = difficulty.toLowerCase()
  //   if (difficulty === "easy")
  //     return { bg: "bg-[#F3FFE7]", text: "text-[#567F2D]" }
  //   if (difficulty === "medium")
  //     return { bg: "bg-[#FFF8D0]", text: "text-[#CCA028]" }
  //   if (difficulty === "hard")
  //     return { bg: "bg-[#FFEAE7]", text: "text-[#7F352D]" }
  //   return { bg: "bg-gray-100", text: "text-gray-800" }
  // }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }

  return (
    <div
      className="mx-auto flex min-h-screen max-w-screen flex-col items-center overflow-x-hidden
        bg-[#E6E9F0] p-4 px-4 sm:px-5 lg:px-8"
    >
      <motion.div
        className="relative w-full max-w-2xl"
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Tilted Background */}
        <motion.div
          className="absolute z-0 mx-auto h-16 w-full max-w-full rounded-full px-4 sm:max-w-2xl
            sm:px-6 md:max-w-3xl md:px-8 lg:max-w-5xl xl:max-w-7xl"
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

        {/* Title Card */}
        <div
          className={`relative z-10 flex h-16 w-full items-center justify-center rounded-full border-2
            border-black bg-white text-3xl font-bold text-black`}
        >
          {examTitle}
        </div>
      </motion.div>

      {loading ? (
        <div className="mt-8 flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-black"></div>
        </div>
      ) : (
        <>
          {/* Tabs */}
          {/* <div className="mt-8 flex w-full max-w-lg overflow-hidden rounded-3xl border border-gray-200">
            <button
              className={`flex-1 py-3 font-medium transition-colors
                ${activeTab === "results" ? "bg-[#FFCC66] text-black" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              onClick={() => setActiveTab("results")}
            >
              Overview
            </button>
            <button
              className={`flex-1 py-3 font-medium transition-colors
                ${activeTab === "details" ? "bg-[#FFCC66] text-black" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              onClick={() => setActiveTab("details")}
            >
              Review
            </button>
            <button
              className={`flex-1 py-3 font-medium transition-colors
                ${activeTab === "recommended" ? "bg-[#FFCC66] text-black" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              onClick={() => setActiveTab("recommended")}
            >
              Next Exam
            </button>
          </div> */}

          {/* Main Content Area */}
          <motion.div
            className="mt-10 w-full max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {activeTab === "results" && (
              <div className="flex w-full flex-col gap-4 md:flex-row">
                {/* Left: Skill Metrics */}
                <div
                  className="relative flex flex-1 items-center justify-between rounded-3xl bg-white p-6
                    shadow-lg"
                >
                  {/* Score */}
                  <div className="flex flex-col items-center">
                    <div className="relative ml-6 flex h-28 w-28 items-center justify-center">
                      <svg
                        viewBox="0 0 100 100"
                        className="h-full w-full"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#e6e6e6"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke={
                            score! >= 70
                              ? "#4ade80"
                              : score! >= 40
                                ? "#FFCC66"
                                : "#ef4444"
                          }
                          strokeWidth="8"
                          strokeDasharray={`${(score! / 100) * 283} 283`}
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <span className="absolute text-2xl font-bold text-gray-800">
                        {score!.toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-1sm mt-2 text-black font-bold ml-2">Score</p>
                  </div>

                  {/* Dashed Line */}
                  <div className="ml-10 flex h-full justify-center">
                    <svg
                      width="2.5"
                      height="200px"
                      className="stroke-black"
                    >
                      <path
                        strokeDasharray="9 9"
                        strokeLinecap="round"
                        strokeWidth="2.5"
                        d="M1 0V200"
                      />
                    </svg>
                  </div>

                  {/* Right Side */}
                  <div className="ml-6 flex flex-col items-center space-y-2">
                    {/* Time Taken */}
                    <div className="relative flex flex-col items-center text-center">
                      <div className="relative flex items-center justify-center">
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

                        {/* Centered Time Display */}
                        <p className="absolute mt-2 text-2xl font-semibold text-gray-700">
                          {completionTime
                            ? formatTime(completionTime)
                            : attemptData?.averageCompletionTime
                              ? formatTime(attemptData.averageCompletionTime)
                              : "N/A"}
                        </p>
                      </div>
                      <p className="text-black font-bold">Time Taken</p>
                    </div>
                    {/* <div className="flex flex-col items-center">
                      <div className="flex items-center space-x-2">
                        <img
                          src="/media/attemptarrow.png"
                          alt="Arrow Icon"
                          className="h-12 w-20"
                        />
                      </div>
                      <span className="mt-2 text-black">
                        <span className="font-bold text-black">
                          {attemptData
                            ? `${Math.max(0, attemptData.totalAttempts - attemptData.attemptsLeft)}/${attemptData.totalAttempts}`
                            : "0/3"}
                        </span>{" "}
                        Attempt
                      </span>
                    </div> */}

                    {/* Dashed Line */}
                    <div className="w-full">
                      <svg
                        width="195%"
                        height="2.5"
                        className="stroke-black"
                      >
                        <path
                          strokeDasharray="9 9"
                          strokeLinecap="round"
                          strokeWidth="3"
                          d="M1.5 1.5h195"
                        />
                      </svg>
                    </div>

                    <div className="flex flex-col items-center">
  <span className="mt-2 text-black text-center">
    <span className="block text-xl font-bold text-black">
      {attemptData
        ? `${Math.max(0, attemptData.totalAttempts - attemptData.attemptsLeft)}/${attemptData.totalAttempts}`
        : "0/3"}
    </span>
    <span className="block text-sm text-black font-bold">Attempts</span>
  </span>
</div>

                  </div>
                </div>

                {/* Right: Results Summary */}
                <div className="flex-1 rounded-3xl bg-white p-6 shadow-lg">
                  <h2 className="mb-6 text-center text-xl font-bold">
                    Result Summary
                  </h2>

                  <div className="mt-4 grid w-full grid-cols-3 gap-4 text-center">
                    {/* Total */}
                    <motion.div
                      className="flex h-30 flex-col justify-between rounded-3xl bg-gray-100 p-6"
                      whileHover={{ scale: 1.05 }}
                    >
                      <p className="text-4xl font-bold text-gray-900">
                        {correctAnswers + wrongAnswers}
                      </p>
                      <p className="text-base font-medium text-gray-700">
                        Total
                      </p>
                    </motion.div>

                    {/* Correct */}
                    <motion.div
                      className="flex h-30 flex-col justify-between rounded-2xl bg-green-100 p-6"
                      whileHover={{ scale: 1.05 }}
                    >
                      <p className="text-4xl font-bold text-green-800">
                        {correctAnswers}
                      </p>
                      <p className="text-base font-medium text-green-700">
                        Correct
                      </p>
                    </motion.div>

                    {/* Wrong */}
                    <motion.div
                      className="flex h-30 cursor-pointer flex-col justify-between rounded-2xl bg-red-100 p-6
                        transition-colors hover:bg-red-200"
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setActiveTab("review-wrong")}
                    >
                      <p className="text-4xl font-bold text-red-800">
                        {wrongAnswers}
                      </p>
                      <p className="text-base font-medium text-red-700">
                        Wrong
                      </p>
                    </motion.div>
                  </div>
                </div>
              </div>
            )}
            <div className="mt-8 text-center">
              <p
                className="cursor-pointer text-lg font-semibold text-black underline hover:text-blue-900"
                onClick={() => setActiveTab("review-all")}
              >
                Review All Answers
              </p>
            </div>

            {/* Review Section */}
            {(activeTab === "review-all" || activeTab === "review-wrong") && (
  <div className="w-full rounded-3xl bg-white p-6 shadow-lg">
    <h2 className="mb-4 text-2xl font-bold text-gray-800">
  {activeTab === "review-all" ? "Review All Answers" : "Wrong Answers Marked"}
</h2>

    <p
      className="mb-4 cursor-pointer text-lg font-semibold text-black underline hover:text-blue-800"
      onClick={() => setActiveTab("results")}
    >
      Back to Result
    </p>

    {(activeTab === "review-all" ? allQuestions : wrongQuestions).length > 0 ? (
      <div className="space-y-6">
        {(activeTab === "review-all" ? allQuestions : wrongQuestions).map(
          (item, idx) => (
            <motion.div
              key={idx}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <p className="mb-3 text-lg font-semibold">
                Question {item.index + 1}: {item.question}
              </p>
              <div className="mb-4 grid grid-cols-1 gap-2">
                {item.options.map((option: string, optIdx: number) => (
                  <div
                    key={optIdx}
                    className={`rounded-lg p-3 ${
                      option === item.correctAnswer
                        ? "border-l-4 border-green-500 bg-green-100"
                        : option === item.userAnswer
                        ? "border-l-4 border-red-500 bg-red-100"
                        : "border border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <span
                        className={`mr-2 flex h-6 w-6 items-center justify-center rounded-full ${
                          option === item.correctAnswer
                            ? "bg-green-500 text-white"
                            : option === item.userAnswer
                            ? "bg-red-500 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{option}</span>

                      {option === item.correctAnswer && (
                        <span className="ml-auto flex items-center text-green-700">
                          ✅ Correct
                        </span>
                      )}
                      {option === item.userAnswer &&
                        option !== item.correctAnswer && (
                          <span className="ml-auto flex items-center text-red-700">
                            ❌ Your Answer
                          </span>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )
        )}
      </div>
    ) : (
      <div className="py-16 text-center">
        <svg
          className="mx-auto mb-4 h-16 w-16 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mb-2 text-2xl font-bold text-gray-800">
          Perfect Score!
        </h3>
        <p className="text-gray-600">
          You answered all questions correctly. Amazing job!
        </p>
      </div>
    )}
  </div>
)}


            {/* Recommended Exams Section */}
            {/* {activeTab === "recommended" && ( */}
            {/* <div className="w-full rounded-3xl bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-2xl font-bold text-gray-800">
                  Recommended Next Steps
                </h2>
                {recommendedExams.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {recommendedExams.map((exam, idx) => (
                      <motion.div
                        key={idx}
                        className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-5
                          transition-all hover:shadow-lg"
                        whileHover={{ scale: 1.02 }}
                        onClick={() =>
                          navigateToExam(exam.title, exam.category)
                        }
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      > */}
            {/* Exam Header */}
            {/* <div className="mb-3 flex items-start justify-between">
                          <h3 className="text-lg font-bold text-gray-800 transition-colors group-hover:text-blue-700">
                            {exam.title}
                          </h3>
                          <div
                            className={`flex items-center rounded-full px-2 py-1 text-xs
                              ${getDifficultyColor(exam.difficulty).bg}
                              ${getDifficultyColor(exam.difficulty).text}`}
                          >
                            <img
                              src="/media/staricon.png"
                              alt="Star Icon"
                              className="mr-1 h-4 w-4"
                            />
                            {exam.difficulty}
                          </div>
                        </div> */}

            {/* Tags Section */}
            {/* <div className="mb-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs">
                            {exam.category}
                          </span>
                          <span className="rounded-full bg-purple-100 px-2 py-1 text-xs">
                            {exam.level}
                          </span>
                        </div> */}

            {/* Description */}
            {/* <p className="text-sm text-gray-600">
                          Take this exam to continue improving your skills.
                        </p> */}

            {/* Start Exam Button */}
            {/* <div className="mt-3 flex justify-end">
                          <span className="flex items-center text-sm text-blue-600 group-hover:underline">
                            Start Exam
                            <svg
                              className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                              ></path>
                            </svg>
                          </span>
                        </div>
                      </motion.div>
                    ))} */}
            {/* </div>
                ) : (
                  // <div className="rounded-xl bg-gray-50 p-6 text-center">
                  //   <p className="text-gray-600">
                  //     No recommended exams available at this time.
                  //   </p>
                  //   <p className="mt-2 text-sm text-gray-500">
                  //     Check back later for new content!
                  //   </p>
                  // </div> */}
            {/* )} */}
            {/* </div> */}
            {/* )} */}
          </motion.div>

          {/* Action Buttons */}
          <div className="mt-10 flex justify-center gap-6">
            {/* Retake Exam Button with Submit Button Styling */}
            <motion.div
              className="relative flex justify-center"
              onHoverStart={() => setRetakeHovered(true)}
              onHoverEnd={() => setRetakeHovered(false)}
            >
              <motion.div
                className="absolute z-0 h-10 w-35 rounded-full"
                initial={{
                  rotate: -3,
                  backgroundColor: theme === "dark" ? "#FFCC66" : "#000000",
                }}
                animate={{
                  backgroundColor: retakeHovered
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
                className="relative z-8 flex h-10 w-35 items-center justify-center rounded-full border-2
                  border-black bg-[#FFCC66] text-sm font-medium text-gray-800 hover:bg-white
                  md:text-base"
                onClick={handleRetakeExam}
              >
                Retake Exam
              </button>
            </motion.div>
          </div>
        </>
      )}
    </div>
  )
}

export default ResultPage
