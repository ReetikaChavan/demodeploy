import { ChevronDown } from "lucide-react"
import React, { useState, useRef, useEffect } from "react"

interface SearchBarProps {
  onDifficultyChange: (difficulty: string) => void
  onDurationChange: (duration: string) => void
  onLevelChange: (level: string) => void
  onCategoryChange: (category: string) => void
  onSearchChange: (searchTerm: string) => void
}

const SearchBar: React.FC<SearchBarProps> = ({
  onDifficultyChange,
  onDurationChange,
  onLevelChange,
  onCategoryChange,
  onSearchChange,
}) => {
  const [difficultyOpen, setDifficultyOpen] = useState(false)
  const [durationOpen, setDurationOpen] = useState(false)
  const [levelOpen, setLevelOpen] = useState(false)

  const [selectedDifficulty, setSelectedDifficulty] =
    useState<string>("Difficulty")
  const [selectedDuration, setSelectedDuration] = useState<string>("Duration")
  const [selectedLevel, setSelectedLevel] = useState<string>("Level")

  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")

  const difficultyRef = useRef<HTMLDivElement | null>(null)
  const durationRef = useRef<HTMLDivElement | null>(null)
  const levelRef = useRef<HTMLDivElement | null>(null)

  const difficultyOptions: string[] = ["Easy", "Medium", "Hard", "All"]
  const durationOptions: string[] = [
    "10min-20min",
    "30min-40min",
    "50min-60min ",
    "All",
  ]
  const levelOptions: string[] = ["Beginner", "Intermediate", "Advanced", "All"]

  const categories: string[] = [
    "Data Science",
    "AI & Machine Learning",
    // "Aptitude Test",
    "CET",
    "DSA",
    "Interview Preparation",
    "Prompt Engineering",
  ]

  const toggleDifficultyDropdown = () => {
    setDifficultyOpen(!difficultyOpen)
    setDurationOpen(false)
    setLevelOpen(false)
  }

  const toggleDurationDropdown = () => {
    setDurationOpen(!durationOpen)
    setDifficultyOpen(false)
    setLevelOpen(false)
  }

  const toggleLevelDropdown = () => {
    setLevelOpen(!levelOpen)
    setDifficultyOpen(false)
    setDurationOpen(false)
  }

  const handleDifficultyClick = (option: string) => {
    setSelectedDifficulty(option)
    setDifficultyOpen(false)
    onDifficultyChange(option === "All" ? "" : option)
  }

  const handleDurationClick = (option: string) => {
    setSelectedDuration(option)
    setDurationOpen(false)
    onDurationChange(option === "All" ? "" : option)
  }

  const handleLevelClick = (option: string) => {
    setSelectedLevel(option)
    setLevelOpen(false)
    onLevelChange(option === "All" ? "" : option)
  }

  const handleCategoryClick = (category: string) => {
    const newCategory = selectedCategory === category ? "" : category
    setSelectedCategory(newCategory)
    onCategoryChange(newCategory)
  }

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    onSearchChange(e.target.value)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        difficultyRef.current &&
        !difficultyRef.current.contains(event.target as Node)
      ) {
        setDifficultyOpen(false)
      }
      if (
        durationRef.current &&
        !durationRef.current.contains(event.target as Node)
      ) {
        setDurationOpen(false)
      }
      if (
        levelRef.current &&
        !levelRef.current.contains(event.target as Node)
      ) {
        setLevelOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="w-full space-y-1 px-4 py-10">
      <div className="flex w-full flex-wrap items-center justify-between">
        {/* Left side filters */}
        <div className="mb-0 flex space-x-1 md:space-x-1">
          {/* Difficulty dropdown */}
          <div
            ref={difficultyRef}
            className="relative"
          >
            <button
              onClick={toggleDifficultyDropdown}
              className="flex items-center px-7 py-1"
            >
              <span className="text-lg font-semibold text-black">
                {selectedDifficulty}
              </span>
              <ChevronDown
                size={25}
                className="ml-1 text-black"
              />
            </button>

            {difficultyOpen && (
              <div className="shadow-3xl absolute z-50 mt-1 w-48 rounded-3xl border border-gray-200 bg-white">
                {difficultyOptions.map((option) => (
                  <div
                    key={option}
                    className={`cursor-pointer rounded-full px-6 py-3 transition hover:bg-gray-300
                    hover:font-bold`}
                    onClick={() => handleDifficultyClick(option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Duration dropdown */}
          <div
            ref={durationRef}
            className="relative"
          >
            <button
              onClick={toggleDurationDropdown}
              className="flex items-center px-3 py-1"
            >
              <span className="text-lg font-semibold text-black">
                {selectedDuration}
              </span>
              <ChevronDown
                size={25}
                className="ml-2 text-black"
              />
            </button>

            {durationOpen && (
              <div className="absolute z-50 mt-1 w-48 rounded-3xl border border-gray-200 bg-white shadow-xl">
                {durationOptions.map((option) => (
                  <div
                    key={option}
                    className={`cursor-pointer rounded-full px-6 py-3 transition hover:bg-gray-300
                    hover:font-bold`}
                    onClick={() => handleDurationClick(option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Level dropdown */}
          <div
            ref={levelRef}
            className="relative"
          >
            <button
              onClick={toggleLevelDropdown}
              className="flex items-center px-3 py-1"
            >
              <span className="text-lg font-semibold text-black">
                {selectedLevel}
              </span>
              <ChevronDown
                size={25}
                className="ml-2 text-black"
              />
            </button>

            {levelOpen && (
              <div className="absolute z-50 mt-1 w-48 rounded-3xl border border-gray-200 bg-white shadow-lg">
                {levelOptions.map((option) => (
                  <div
                    key={option}
                    className={`cursor-pointer rounded-full px-6 py-3 transition hover:bg-gray-300
                    hover:font-bold`}
                    onClick={() => handleLevelClick(option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* searchbar  */}
        <div className="mt-3 mr-7 flex w-full items-center border-b border-black md:mt-0 md:w-64">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 25 25"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-black"
          >
            <circle
              cx="11"
              cy="11"
              r="8"
            ></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>

          <input
            type="text"
            className="w-full bg-transparent px-2 py-1 outline-none"
            value={searchTerm}
            onChange={handleSearchInput}
          />
        </div>
      </div>

      <div className="w-full">
        <svg
          width="95%"
          height="2.6"
          className="dark:stroke-theme-300 mx-auto mb-5 stroke-black"
        >
          <path
            strokeDasharray="12 12"
            strokeLinecap="round"
            strokeWidth="3"
            d="M1.5 1.5h1397"
          />
        </svg>
      </div>

      <div className="flex flex-wrap gap-2 px-4 md:px-3">
        {categories.map((category) => (
          <button
            key={category}
            className={`rounded-full px-4 py-0 text-lg font-semibold transition-colors ${
            selectedCategory === category
                ? "bg-black text-white"
                : "bg-transparent hover:bg-black hover:text-white"
            }`}
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SearchBar
