"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { toast, Toaster } from "sonner"
import TestPage from "@/components/testPage/testPage"

type ExamData = {
  title: string
  timer: number
  level: string
  difficulty: string
  category: string
  whyTakeExam: string
  whoShouldTake: string
  totalQuestions: number
  skill: string
  knowledge: string
  application: string
  why: string
}

type AttemptData = {
  title: string
  category: string
  attemptsLeft: number
  totalAttempts: number
  bestScore: number
  averageCompletionTime?: number
  isLocked?: boolean
  lockoutEndTime?: string | null
  attemptHistory?: Array<{
    date: Date | string
    score: number
    completionTime: number
  }>
}

const Description = () => {
  const searchParams = useSearchParams()
  const category = decodeURIComponent(
    searchParams?.get("category") || ""
  ).trim()
  const title = decodeURIComponent(searchParams?.get("title") || "").trim()

  const [showFullText, setShowFullText] = useState(false)
  const [hovered, setHovered] = useState<boolean>(false)
  const [theme, setTheme] = useState<string>("light")
  const [examData, setExamData] = useState<ExamData | null>(null)
  const [attemptData, setAttemptData] = useState<AttemptData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [deviceId, setDeviceId] = useState<string>("")
  const [showTestPage, setShowTestPage] = useState<boolean>(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const isLocked =
    attemptData?.isLocked || (attemptData?.attemptsLeft ?? 0) <= 0

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768) // 768px is typical md breakpoint
    }

    // Initial check
    checkScreenSize()

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize)

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  // Toggle menu function
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // percentage string to no
  const parsePercentage = (value: string): number => {
    if (!value) return 0
    const match = value.match(/(\d+)/)
    return match && match[1] ? parseInt(match[1]) : 0
  }

  const limitWords = (text: string, wordLimit: number) => {
    const words = text.split(" ")
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : text
  }

  // Generate or retrive id
  useEffect(() => {
    let storedDeviceId = localStorage.getItem("deviceId")
    if (!storedDeviceId) {
      storedDeviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      localStorage.setItem("deviceId", storedDeviceId)
    }
    setDeviceId(storedDeviceId)
  }, [])

  useEffect(() => {
    const fetchProblemDetails = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `/api/description?title=${encodeURIComponent(title)}&category=${encodeURIComponent(category)}`
        )
        if (!response.ok) {
          throw new Error("Failed to fetch exam details")
        }
        const data = await response.json()
        setExamData(data)
      } catch (error) {
        console.error("Error fetching exam details:", error)
      } finally {
        setLoading(false)
      }
    }

    if (title && category) {
      fetchProblemDetails()
    }
  }, [title, category])

  // Fetch attempt data
  useEffect(() => {
    const fetchAttemptData = async () => {
      if (!deviceId || !title || !category) return

      console.log("Fetching attempt data with:", { deviceId, title, category })

      try {
        const url = `/api/attempts?deviceId=${encodeURIComponent(deviceId)}&title=${encodeURIComponent(title)}&category=${encodeURIComponent(category)}`
        console.log("Request URL:", url)

        const response = await fetch(url)
        console.log("Response status:", response.status)

        if (!response.ok) {
          throw new Error(`Failed to fetch attempt data: ${response.status}`)
        }

        const data = await response.json()
        console.log("Attempt data received:", data)

        // Make sure we have all the required fields
        setAttemptData({
          title: data.title || title,
          category: data.category || category,
          attemptsLeft: data.attemptsLeft ?? 3,
          totalAttempts: data.totalAttempts ?? 3,
          bestScore: data.bestScore ?? 0,
          averageCompletionTime: data.averageCompletionTime ?? 0,
          attemptHistory: data.attemptHistory || [],
          isLocked: false, // Add this field if you want to use it
        })
      } catch (error) {
        console.error("Error fetching attempt data:", error)
        // Default values
        setAttemptData({
          title,
          category,
          attemptsLeft: 3,
          totalAttempts: 3,
          bestScore: 0,
          averageCompletionTime: 0,
          attemptHistory: [],
          isLocked: false,
        })
      }
    }

    fetchAttemptData()
  }, [deviceId, title, category])

  const handleStartTest = () => {
    if (!examData || !attemptData) return

    // Check if test is locked
    if (attemptData.isLocked) {
      const lockoutEndTime = new Date(attemptData.lockoutEndTime || "")
      const now = new Date()

      if (now < lockoutEndTime) {
        // Calculate time remaining in the lockout
        const timeRemaining = Math.ceil(
          (lockoutEndTime.getTime() - now.getTime()) / (1000 * 60 * 60)
        )
        toast.error(
          `This test is locked for ${timeRemaining} more hour(s). Please try again later.`
        )
        return
      }
    }

    // Check if attempts are available
    if (attemptData.attemptsLeft <= 0) {
      toast.error("You have no attempts left for this exam!")
      return
    }

    // Save current attempt data to localStorage for access during the test
    localStorage.setItem(
      "currentAttempt",
      JSON.stringify({
        deviceId,
        title: examData.title,
        category: examData.category,
        attemptsLeft: attemptData.attemptsLeft - 1,
      })
    )

    // Instead of routing, show the test page component
    setShowTestPage(true)
  }

  // If the user wants to go back from test to description
  const handleBackToDescription = () => {
    setShowTestPage(false)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#E6E9F0]">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-black"></div>
      </div>
    )
  }

  // If showTestPage is true, render the TestPage component
  if (showTestPage && examData) {
    return <TestPage title={examData.title} category={examData.category} />
  }
  

  // Parse the percentage values
  const skillPercent = examData?.skill ? parsePercentage(examData.skill) : 0
  const knowledgePercent = examData?.knowledge
    ? parsePercentage(examData.knowledge)
    : 0
  const applicationPercent = examData?.application
    ? parsePercentage(examData.application)
    : 0

  return (
    <div
      className="mx-auto flex min-h-screen max-w-screen flex-col items-center justify-center
        overflow-x-hidden bg-[#E6E9F0] p-4 px-4 sm:px-6 lg:px-8"
    >
      <Toaster position="top-center" />
      <motion.div
        className="relative w-full max-w-2xl"
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
      >
        {/* Tilted Background */}
        <motion.div
          className="absolute z-0 h-16 w-full rounded-full"
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

        {/* Title Card*/}
        <div
          className={`relative z-10 flex h-16 w-full items-center justify-center rounded-full border-2
            border-black text-3xl font-bold text-gray-800
            ${theme === "dark" ? "bg-[#333333] text-white" : "bg-white text-black"}`}
        >
          {examData?.title || title}
        </div>
      </motion.div>

      {/* left & right grid*/}
      <div
        className="mx-auto mt-10 flex w-full max-w-full flex-col items-start gap-4 px-4
          sm:max-w-2xl sm:px-6 md:max-w-4xl md:flex-row md:px-8 lg:max-w-5xl xl:max-w-6xl"
      >
        {" "}
        <div
          className="relative flex flex-1 items-center justify-between rounded-3xl bg-white p-6
            shadow-lg"
        >
          {/* Left */}
          <div className="w-full flex-1 space-y-5 px-2 sm:px-3 md:px-3">
            {/* Skill */}
            <div className="relative">
              <span className="text-lg font-medium">Skill</span>
              <div className="relative mt-2 h-4 w-56 rounded-full bg-[#AAF0EE]">
                <div
                  className="h-full rounded-full bg-[#AAF0EE]"
                  style={{ width: `${skillPercent}%` }}
                ></div>
                <div
                  className="absolute -top-2 flex h-8 w-8 items-center justify-center rounded-full border-2
                    border-black bg-[#AAF0EE] text-xs font-bold"
                  style={{
                    left: `${skillPercent}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  {skillPercent}%
                </div>
              </div>
            </div>

            {/* Knowledge */}
            <div className="relative">
              <span className="text-lg font-medium">Knowledge</span>
              <div className="relative mt-2 h-4 w-56 rounded-full bg-[#CCEEAA]">
                <div
                  className="h-full rounded-full bg-[#CCEEAA]"
                  style={{ width: `${knowledgePercent}%` }}
                ></div>
                <div
                  className="absolute -top-2 flex h-8 w-8 items-center justify-center rounded-full border-2
                    border-black bg-[#CCEEAA] text-xs font-bold"
                  style={{
                    left: `${knowledgePercent}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  {knowledgePercent}%
                </div>
              </div>
            </div>

            {/* Application */}
            <div className="relative">
              <span className="text-lg font-medium">Application</span>
              <div className="relative mt-2 h-4 w-56 rounded-full bg-[#DDBBF1]">
                <div
                  className="h-full rounded-full bg-[#DDBBF1]"
                  style={{ width: `${applicationPercent}%` }}
                ></div>
                <div
                  className="absolute -top-2 flex h-8 w-8 items-center justify-center rounded-full border-2
                    border-black bg-[#DDBBF1] text-xs font-bold"
                  style={{
                    left: `${applicationPercent}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  {applicationPercent}%
                </div>
              </div>
            </div>
          </div>

          {/* Dashed Line */}
          <div className="ml-3 flex h-full justify-center">
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

          {/* Right */}
          <div className="ml-6 flex flex-col items-center space-y-2">
            {/* Attempts */}
            <div className="flex flex-col items-center">
              <div className="flex items-center space-x-2">
                <img
                  src="/media/attemptarrow.png"
                  alt="Arrow Icon"
                  className="h-10 w-18"
                />
              </div>
              <span className="mt-2 text-black">
                <span className="font-bold text-black">
                  {attemptData
                    ? `${attemptData.totalAttempts - (attemptData.attemptsLeft || 0)}/${attemptData.totalAttempts}`
                    : "0/3"}
                </span>{" "}
                Attempt
              </span>

              {attemptData?.isLocked && attemptData?.lockoutEndTime && (
                <div className="mt-2 text-sm font-medium text-red-600">
                  Locked until:{" "}
                  {new Date(attemptData.lockoutEndTime).toLocaleString()}
                </div>
              )}
            </div>

            {/* Dashed Line */}
            <div className="w-full">
              <svg
                width="100%"
                height="2.5"
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

            {/* Difficulty Section*/}
            <div className="text-1sm font-semibold text-black dark:text-white">
              {examData?.level || "Loading Level..."}
            </div>
            <div className="relative flex items-center">
              <img
                src="/media/staricon.png"
                alt="Star Icon"
                className="-top-0.4 absolute left-0 z-10 h-9 w-9"
              />

              {/* Difficulty Pill */}
              <div
                className={`relative z-0 flex items-center rounded-full py-1 pr-5 pl-11 text-lg ${
                  examData?.difficulty?.toLowerCase() === "easy"
                    ? "bg-[#F3FFE7] text-[#567F2D]"
                    : examData?.difficulty?.toLowerCase() === "medium"
                      ? "bg-[#FFF8D0] text-[#CCA028]"
                      : examData?.difficulty?.toLowerCase() === "hard"
                        ? "bg-[#FFEAE7] text-[#7F352D]"
                        : "bg-gray-100 text-gray-800"
                  }`}
              >
                <span className="font-semibold">
                  {examData?.difficulty || "Medium"}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Right grid*/}
        <div className="flex-1 rounded-3xl bg-white p-6 shadow-lg">
          <h2 className="mb-3 text-xl font-bold">Why take this Exam?</h2>
          <p className="font-100 text-lg text-black">
            {examData && showFullText
              ? examData.why
              : examData
                ? limitWords(examData.why, 20)
                : ""}
          </p>
          {examData && (
            <>
              {!showFullText && examData.why.split(" ").length > 20 && (
                <button
                  className="mt-2 block text-gray-400"
                  onClick={() => setShowFullText(true)}
                >
                  Read More...
                </button>
              )}
              {showFullText && (
                <button
                  className="mt-2 block text-gray-400"
                  onClick={() => setShowFullText(false)}
                >
                  Read Less
                </button>
              )}
            </>
          )}
        </div>
      </div>
      {/* who will*/}
      <div className="mt-6 text-center">
        <h3 className="mb-4 text-3xl font-medium">Who will take this exam?</h3>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="rounded-full border border-black px-4 py-2 text-lg font-bold">
            B.Tech/B.E. (all specializations)
          </button>
          <button className="rounded-full border border-black px-4 py-2 text-lg font-bold">
            BSc IT
          </button>
          <button className="rounded-full border border-black px-4 py-2 text-lg font-bold">
            BCA
          </button>
          <button className="rounded-full border border-black px-4 py-2 text-lg font-bold">
            MCA
          </button>
        </div>

        {/* start button */}
        <div className="mt-10 flex justify-center">
          <div
            className={`relative cursor-pointer ${isLocked ? "cursor-not-allowed opacity-50" : ""}`}
            onClick={isLocked ? undefined : handleStartTest}
          >
            <svg
              width="150"
              height="120"
              viewBox="0 0 120 100"
            >
              <path
                d="M10 10 L110 10 L60 90 Z"
                fill={isLocked ? "gray" : "black"}
                stroke={isLocked ? "gray" : "black"}
                strokeWidth="20"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div
              className="pointer-events-none absolute inset-0 mb-3 flex flex-col items-center
                justify-center text-xl font-medium text-white"
            >
              {isLocked ? "Locked" : "Start"} <br />
              {isLocked ? "" : "Test"}
            </div>
          </div>
        </div>
      </div>

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
              {examData?.timer ? `${examData.timer}:00` : "Loading..."}
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
            {examData?.totalQuestions
              ? Array.from({ length: examData.totalQuestions }, (_, i) => (
                  <div
                    key={i}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D9D9D9] text-sm
                      font-semibold"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                ))
              : "Loading..."}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Description
