"use client"

import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
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

interface DescriptionProps {
  title: string;
  category: string;
  onBack: () => void;
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

const Description = ({ title, category, onBack }: DescriptionProps) => {


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
  const [sidebarOffset, setSidebarOffset] = useState({ top: 0, right: 0 })

  // Create refs for key elements
  const titleCardRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const mainContainerRef = useRef<HTMLDivElement>(null)

  const isLocked =
    attemptData?.isLocked || (attemptData?.attemptsLeft ?? 0) <= 0

  // Function to update sidebar position
  const updateSidebarPosition = () => {
    if (titleCardRef.current && mainContainerRef.current && !isMobile) {
      const titleCardRect = titleCardRef.current.getBoundingClientRect()
      const containerRect = mainContainerRef.current.getBoundingClientRect()

      const rightOffset = window.innerWidth - containerRect.right

      setSidebarOffset({
        top: titleCardRect.bottom + 20,
        right: Math.max(rightOffset, 20),
      })
    }
  }

  useEffect(() => {
    const checkScreenSize = () => {
      const newIsMobile = window.innerWidth <= 1024
      setIsMobile(newIsMobile)
      if (!newIsMobile) {
        updateSidebarPosition()
      }
    }

    checkScreenSize()

    const handleResize = () => {
      checkScreenSize()
    }

    const handleScroll = () => {
      if (!isMobile) {
        updateSidebarPosition()
      }
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("scroll", handleScroll)

    const observer = new MutationObserver(() => {
      updateSidebarPosition()
    })

    if (document.body) {
      observer.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true,
      })
    }

    // Call sidebar
    const timeoutId = setTimeout(updateSidebarPosition, 500)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleScroll)
      observer.disconnect()
      clearTimeout(timeoutId)
    }
  }, [isMobile])

  // Called after exam data loads to update positions
  useEffect(() => {
    if (!loading && examData) {
      updateSidebarPosition()
    }
  }, [loading, examData])

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

  // Generate or retrieve id
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

      try {
        const url = `/api/attempts?deviceId=${encodeURIComponent(deviceId)}&title=${encodeURIComponent(title)}&category=${encodeURIComponent(category)}`

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Failed to fetch attempt data: ${response.status}`)
        }

        const data = await response.json()

        setAttemptData({
          title: data.title || title,
          category: data.category || category,
          attemptsLeft: data.attemptsLeft ?? 3,
          totalAttempts: data.totalAttempts ?? 3,
          bestScore: data.bestScore ?? 0,
          averageCompletionTime: data.averageCompletionTime ?? 0,
          attemptHistory: data.attemptHistory || [],
          isLocked: false,
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
    return (
      <TestPage
        title={examData.title}
        category={examData.category}
      />
    )
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
      ref={mainContainerRef}
      className="mx-auto flex min-h-screen w-full flex-col items-center justify-center
        overflow-x-hidden bg-[#E6E9F0] px-4 py-6 sm:px-6 lg:px-8"
    >
      <Toaster position="top-center" />
      <motion.div
        className="relative w-full max-w-full px-4 sm:max-w-sm sm:px-6 md:max-w-lg md:px-0
          lg:max-w-2xl"
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
      >
        {/* Tilted Background */}
        <motion.div
          className="absolute z-0 h-12 w-full rounded-full sm:h-14 md:h-16"
          style={{
            transform: "rotate(-2deg)",
            width: "100%",
            left: "0",
            right: "0",
          }}
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
          ref={titleCardRef}
          className={`relative z-10 flex h-12 w-full items-center justify-center rounded-full border-2
            border-black text-xl font-bold text-gray-800 sm:h-14 sm:text-2xl md:h-16
            md:text-3xl
            ${theme === "dark" ? "bg-[#333333] text-white" : "bg-white text-black"}`}
        >
          <span className="max-w-full truncate px-4 text-center">
            {examData?.title || title}
          </span>
        </div>
      </motion.div>

      {/* left & right grid */}
      <div
        className="mx-auto mt-10 flex h-full w-full max-w-full flex-col items-start gap-4 px-4
          sm:max-w-xl sm:px-6 md:max-w-2xl md:flex-row md:px-8 lg:max-w-3xl xl:max-w-4xl"
      >
        {/* Left grid - Skill metrics */}
        <div
          className="relative flex w-full flex-1 flex-col items-start justify-between rounded-3xl
            bg-white p-4 shadow-lg sm:p-6 md:flex-row"
        >
          {/* Left content */}
          <div className="w-full space-y-5 md:w-2/5 md:flex-1 md:pr-6">
            {/* Skill */}
            <div className="relative">
              <span className="text-base font-medium sm:text-lg">Skill</span>
              <div
                className="relative mt-2 h-4 w-full min-w-[80px] rounded-full bg-[#AAF0EE] sm:min-w-[120px]
                  md:min-w-[140px] lg:min-w-[160px]"
              >
                <div
                  className="h-full rounded-full bg-[#AAF0EE]"
                  style={{ width: `${skillPercent}%` }}
                ></div>
                <div
                  className="absolute -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2
                    border-black bg-[#AAF0EE] text-xs font-bold sm:h-8 sm:w-8"
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
              <span className="text-base font-medium sm:text-lg">
                Knowledge
              </span>
              <div
                className="relative mt-2 h-4 w-full min-w-[80px] rounded-full bg-[#CCEEAA] sm:min-w-[120px]
                  md:min-w-[140px] lg:min-w-[160px]"
              >
                <div
                  className="h-full rounded-full bg-[#CCEEAA]"
                  style={{ width: `${knowledgePercent}%` }}
                ></div>
                <div
                  className="absolute -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2
                    border-black bg-[#CCEEAA] text-xs font-bold sm:h-8 sm:w-8"
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
              <span className="text-base font-medium sm:text-lg">
                Application
              </span>
              <div
                className="relative mt-2 h-4 w-full min-w-[80px] rounded-full bg-[#DDBBF1] sm:min-w-[120px]
                  md:min-w-[140px] lg:min-w-[160px]"
              >
                <div
                  className="h-full rounded-full bg-[#DDBBF1]"
                  style={{ width: `${applicationPercent}%` }}
                ></div>
                <div
                  className="absolute -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2
                    border-black bg-[#DDBBF1] text-xs font-bold sm:h-8 sm:w-8"
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

          {/* Horizontal Dashed Line */}
          <div className="my-4 w-full md:hidden">
            <svg
              width="100%"
              height="2.5"
              className="stroke-black"
            >
              <path
                strokeDasharray="9 9"
                strokeLinecap="round"
                strokeWidth="2.5"
                d="M1.5 1.5h997"
              />
            </svg>
          </div>

          {/* Vertical Dashed Line */}
          <div className="hidden h-full md:mx-4 md:flex md:justify-center">
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

          {/* Right content - Attempts and Difficulty */}
          <div
            className="flex w-full flex-col items-center space-y-3 md:w-2/5 md:items-center
              md:space-y-2"
          >
            {/* Attempts */}
            <div className="mt-8 flex flex-col items-center">
              <div className="flex items-center justify-center">
                <img
                  src="/media/attemptarrow.png"
                  alt="Arrow Icon"
                  className="h-7 w-10 sm:h-8 sm:w-12 md:h-9 md:w-14"
                />
              </div>
              <span className="mt-2 text-sm text-black sm:text-base">
                <span className="font-bold text-black">
                  {attemptData
                    ? `${attemptData.totalAttempts - (attemptData.attemptsLeft || 0)}/${attemptData.totalAttempts}`
                    : "0/3"}
                </span>{" "}
                Attempt
              </span>
              {attemptData?.isLocked && attemptData?.lockoutEndTime && (
                <div className="mt-2 text-xs font-medium text-red-600 sm:text-sm">
                  Locked until:{" "}
                  {new Date(attemptData.lockoutEndTime).toLocaleString()}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-full px-4 sm:px-2 md:px-2">
              <svg
                width="100%"
                height="2.5"
                className="stroke-black"
              >
                <path
                  strokeDasharray="9 9"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                  d="M1.5 1.5h997"
                />
              </svg>
            </div>

            {/* Difficulty Section*/}
            <div className="text-center">
              <div className="text-xs font-semibold text-black sm:text-sm md:text-base dark:text-white">
                {examData?.level || "Intermediate"}
              </div>
              <div className="relative mt-1 flex items-center justify-center">
                <img
                  src="/media/staricon.png"
                  alt="Star Icon"
                  className="absolute left-0 z-10 h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"
                />
                <div
                  className={`relative z-0 flex items-center rounded-full py-1 pr-3 pl-7 text-sm sm:pr-4
                    sm:pl-8 sm:text-base md:pr-5 md:pl-10 md:text-lg ${
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
                    {examData?.difficulty || "Hard"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right grid - Exam description */}
        <div className="flex h-full w-full flex-1 flex-col rounded-3xl bg-white p-4 shadow-lg sm:p-6">
          <h2 className="text-base font-bold sm:text-lg md:text-xl">
            Why take this Exam?
          </h2>
          <div className="flex-grow overflow-y-auto">
            <p className="mt-2 text-sm text-black sm:text-base md:text-base">
              {examData && showFullText
                ? examData.why
                : examData
                  ? limitWords(examData.why, isMobile ? 15 : 35)
                  : ""}
            </p>
            {examData && (
              <>
                {!showFullText && examData.why.split(" ").length > 20 && (
                  <button
                    className="mt-0 block text-xs text-gray-400 sm:text-sm md:text-base"
                    onClick={() => setShowFullText(true)}
                  >
                    Read More...
                  </button>
                )}
                {showFullText && (
                  <button
                    className="mt-0 block text-xs text-gray-400 sm:text-sm md:text-base"
                    onClick={() => setShowFullText(false)}
                  >
                    Read Less
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Who will take exam section */}
      <div className="mt-6 w-full px-4 text-center">
        <h3 className="mb-4 text-xl font-medium sm:text-2xl md:text-3xl">
          Who will take this exam?
        </h3>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          <button
            className="rounded-full border border-black px-3 py-1 text-sm font-bold sm:px-4 sm:py-2
              sm:text-lg"
          >
            B.Tech/B.E. (all specializations)
          </button>
          <button
            className="rounded-full border border-black px-3 py-1 text-sm font-bold sm:px-4 sm:py-2
              sm:text-lg"
          >
            BSc IT
          </button>
          <button
            className="rounded-full border border-black px-3 py-1 text-sm font-bold sm:px-4 sm:py-2
              sm:text-lg"
          >
            BCA
          </button>
          <button
            className="rounded-full border border-black px-3 py-1 text-sm font-bold sm:px-4 sm:py-2
              sm:text-lg"
          >
            MCA
          </button>
        </div>

        {/* Start button */}
        <div className="mt-6 flex justify-center sm:mt-8 md:mt-10">
          <div
            className={`relative scale-75 cursor-pointer sm:scale-90 md:scale-100
              ${isLocked ? "cursor-not-allowed opacity-50" : ""}`}
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

      {/* Toggle Button */}
      {isMobile && (
        <button
          onClick={toggleMenu}
          className="fixed top-16 right-4 z-50 rounded-full bg-white p-2 shadow-lg"
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

      {/* Sidebar */}
      <div
        className={` ${
          isMobile
            ? `fixed inset-y-0 right-0 z-40 w-[200px] transition-transform duration-300
              ease-in-out`
            : "absolute top-8 right-0 w-[200px]"
          } ${isMobile && !isMenuOpen ? "translate-x-full" : "translate-x-0"} flex
          max-h-[480px] min-h-[480px] flex-col overflow-auto overflow-y-hidden
          rounded-l-3xl bg-white p-3 shadow-lg`}
      >
        {/* category name */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 rounded-t-none rounded-b-3xl bg-black
            px-3 py-0.5 pb-0 text-center text-sm whitespace-nowrap text-white"
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
              {examData?.timer ? `${examData.timer}:00` : "Loading..."}
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
                d="M1.5 1.5h997"
              />
            </svg>
          </div>
        </div>

        {/* Status */}
        <div className="mt-1 space-y-1 pl-3">
          <div className="flex items-center justify-end gap-2">
            <span className="text-2sm w-40 text-right">Not visited</span>
            <span className="h-4 w-4 rounded-full bg-[#D9D9D9]"></span>
          </div>
          <div className="flex items-center justify-end gap-2">
            <span className="text-2sm w-40 text-right">Saved answers</span>
            <span className="h-4 w-4 rounded-full bg-[#CCEEAA]"></span>
          </div>
          <div className="flex items-center justify-end gap-2">
            <span className="text-2sm w-40 text-right">Marked for Review</span>
            <span className="h-4 w-4 rounded-full bg-[#AACCFF]"></span>
          </div>
          <div className="flex items-center justify-end gap-2">
            <span className="text-2sm w-40 text-right">Not answered</span>
            <span className="h-4 w-4 rounded-full bg-[#FFB1AA]"></span>
          </div>
        </div>

        {/* Question no */}
        <div className="relative left-2 mt-3 w-fit rounded-3xl bg-[#F7F7F7] p-2">
          <h3 className="sm:text-2sm mr-2 mb-2 text-right text-base font-semibold">
            Questions
          </h3>
          <ScrollContainer>
            <div className="grid w-full grid-cols-5 gap-1 pr-1">
              {examData?.totalQuestions
                ? Array.from({ length: examData.totalQuestions }, (_, i) => (
                    <div
                      key={i}
                      className={`relative z-10 flex h-6 w-6 cursor-pointer items-center justify-center
                        rounded-full bg-[#D9D9D9] text-xs font-semibold sm:h-7 sm:w-7`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                  ))
                : "Loading..."}
            </div>
          </ScrollContainer>
        </div>
      </div>
    </div>
  )
}

export default Description
