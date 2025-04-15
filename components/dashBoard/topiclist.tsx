import React, { useEffect, useState } from 'react';
import SearchBar from "@/components/dashBoard/searchbarelements"; 
import { useRouter } from 'next/navigation';

interface ProblemItem {
  id: number;
  title: string;
  timeInMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string; 
  level?: string;
}

const ProblemList: React.FC = () => {
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<ProblemItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        
        //parameters for filters
        let queryParams = new URLSearchParams({
          page: currentPage.toString(),
        });
        
        if (selectedDifficulty) {
          queryParams.append('difficulty', selectedDifficulty);
        }
        
        if (selectedDuration) {
          queryParams.append('duration', selectedDuration);
        }
        
        if (selectedLevel) {
          queryParams.append('level', selectedLevel);
        }
        
        if (selectedCategory) {
          queryParams.append('category', encodeURIComponent(selectedCategory));
        }
        
        if (searchTerm) {
          queryParams.append('search', searchTerm);
        }
        
        const response = await fetch(`/api/topics?${queryParams.toString()}`);
        const data = await response.json();
        setProblems(data.problems);
        setFilteredProblems(data.problems);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error('Error fetching problems:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [currentPage, selectedDifficulty, selectedDuration, selectedLevel, selectedCategory, searchTerm]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-[#F3FFE7] text-[#567F2D]';
      case 'Medium':
        return 'bg-[#FFF8D0] text-[#CCA028]';
      case 'Hard':
        return 'bg-[#FFEAE7] text-[#7F352D]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const handleDifficultyChange = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    setCurrentPage(1); 
  };
  
  const handleDurationChange = (duration: string) => {
    setSelectedDuration(duration);
    setCurrentPage(1);
  };
  
  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    setCurrentPage(1);
  };
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); 
  };
  
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); 
  };

  const router = useRouter();

const handleProblemClick = (problem: ProblemItem) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('descriptionData', JSON.stringify(problem));
    router.push('/description');
  }
};

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 md:px-6">
      <SearchBar 
        onDifficultyChange={handleDifficultyChange}
        onDurationChange={handleDurationChange}
        onLevelChange={handleLevelChange}
        onCategoryChange={handleCategoryChange}
        onSearchChange={handleSearchChange}
      />
      <div className="rounded-lg py-2">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="spinner">Loading...</div>
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500 text-lg text-center">No problems found matching your criteria.</p>
          </div>
        ) : (
          <>
            {filteredProblems.map((problem, index) => {
              const itemNumber = (currentPage - 1) * itemsPerPage + index + 1;
              return (
                <React.Fragment key={problem.id}>
                  <div className="relative group flex flex-col sm:flex-row justify-between sm:items-center px-4 sm:px-6 py-4 cursor-pointer gap-2 sm:gap-0" onClick={() => handleProblemClick(problem)}>
                    <div className="absolute left-2 right-2 h-12 top-1/2 -translate-y-1/2 bg-white opacity-0 group-hover:opacity-100 group-hover:shadow-md rounded-3xl transition-all duration-300"></div>
                    <div className="flex items-center z-10">
                      <span className="font-medium text-gray-700 text-base sm:text-lg mr-2 group-hover:font-bold transition-all">{String(itemNumber).padStart(2, '0')}.</span>
                      <span className="text-gray-800 font-medium text-base sm:text-lg group-hover:font-bold transition-all">{problem.title}</span>
                    </div>
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 z-10">
                      <div className="flex items-center gap-2 min-w-[80px]">
                        <img src="/media/clock.png" alt="Time Icon" className="w-5 h-5" />
                        <span className="text-gray-700 text-base sm:text-lg font-medium">{problem.timeInMinutes} min</span>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-4 py-1 w-[110px] sm:w-[130px] text-center rounded-full text-base sm:text-lg font-medium group-hover:font-bold transition-all ${getDifficultyColor(problem.difficulty)}`}>{problem.difficulty}</span>
                      </div>
                    </div>
                  </div>
                  {index < filteredProblems.length - 1 && (
                    <div className="w-full mx-4 sm:mx-6">
                      <svg width="100%" height="1" className="dark:stroke-theme-300 mx-auto stroke-black">
                        <path strokeDasharray="7 7" strokeLinecap="round" strokeWidth="3" d="M1.5 1.5h1397" />
                      </svg>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
            <div className="flex flex-wrap justify-center items-center gap-2 mt-6 pb-4">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6 rotate-180">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                </svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => handlePageChange(page)} className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center ${currentPage === page ? 'bg-black text-white' : 'hover:bg-gray-200 text-gray-700'}`}>{page}</button>
              ))}
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

};

export default ProblemList;