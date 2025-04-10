import React from "react";
import { ChevronLeft, ChevronRight, HelpCircle, MoreHorizontal } from "lucide-react";
import Image from "next/image";

interface CardProps {
  category: string;
  title: string;
  bgColor: string;
  iconColor: string;
}

const categoryColors: { [key: string]: string } = {
  "#FFE8E6": "#FFB1AA", 
  "#E6F0FF": "#AACCFF", 
  "#E6F5FA": "#B0E3F2", 
};

const categoryImages: { [key: string]: string } = {
  "#FFE8E6": "/media/peach.png", 
  "#E6F0FF": "/media/blue.png",
  "#E6F5FA": "/media/green.png",
};

const Card = ({ category, title, bgColor, iconColor }: CardProps) => {
  const categoryBgColor = categoryColors[bgColor];
  const iconImage = categoryImages[bgColor];

  return (
    <div className="relative group w-full min-w-[300px] h-[110px] mx-0.5">
      <div className="absolute top-0 left-0 w-full h-full bg-black rounded-[20px] transition-all duration-300 
                      group-hover:translate-x-[3px] group-hover:translate-y-[3px] 
                      group-hover:skew-y-[-3deg] group-hover:skew-x-[2deg]"></div>

      {/* Card */}
      <div
        className="relative flex flex-col h-full rounded-[20px] px-6 py-7 transition-all duration-300 
                   group-hover:translate-x-[1px] group-hover:translate-y-[1px] 
                   group-hover:shadow-lg border border-black"
        style={{ backgroundColor: bgColor }}
      >
        {/* Category Label */}
        {categoryBgColor && (
          <span
            className="absolute top-0 left-5 rounded-t-none rounded-b-2xl px-6 py-0.5 pb-0 text-sm font-medium text-black
                        border-l border-r border-b border-black"
            style={{ backgroundColor: categoryBgColor }}
          >
            {category}
          </span>
        )}

        {/* Title*/}
        <h3 className="mt-4 text-lg font-bold text-black leading-tight text-left w-[180px] break-words">
          {title}
        </h3>

        {iconImage && (
          <div className="absolute top-3 right-3">
            <Image src={iconImage} alt="Category Icon" width={60} height={50} />
          </div>
        )}

        {/* Arrow Icon */}
        <div className="absolute bottom-3 right-3 group">
          <div className="w-6 h-6 flex items-center justify-center rounded-full transition-all duration-200 group-hover:bg-black">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 34 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-8 h-8 transform rotate-[10deg] text-black group-hover:text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

const TopPicks = () => {
  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <h2 className="text-3xl font-bold mb-4 text-left ml-11">Top Picks</h2>

      <div className="relative">
        <button className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
          <ChevronLeft size={30} />
        </button>

        {/* Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-10">
          <Card category="Design" title="Must-do List for Interview Prep" bgColor="#FFE8E6" iconColor="text-blue-400" />
          <Card category="Coding" title="Crack SQL Interview in 50 Qs" bgColor="#E6F0FF" iconColor="text-blue-400" />
          <Card category="Coding" title="Must-do List for Interview Prep" bgColor="#E6F5FA" iconColor="text-emerald-400" />
        </div>

        <button className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 ">
          <ChevronRight size={30} />
        </button>
      </div>
    </div>
  );
};

export default TopPicks;