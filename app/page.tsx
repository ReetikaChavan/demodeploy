"use client"
import Image from "next/image"
import { Play } from "lucide-react";
import TopPick from "@/components/dashBoard/toppickcards";
import Problems from "@/components/dashBoard/topiclist";

const TakeExam = () => {
  return (
<div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-[#DFE1E8] overflow-hidden">
<div className="space-y-4 text-center md:space-y-6">
        {/* Books and Title Section */}
        <div className="relative mt-48 mb-2 flex flex-col items-center justify-center gap-2 md:flex-row">
          <Image
            src="/media/books.png"
            alt="Books Stack"
            width={80}
            height={80}
            className="md:h-[100px] md:w-[100px]"
          />
          <h1 className="font-extrathin text-3xl md:text-5xl">
            Sharpen Your Skills!
            <span className="mt-1 block font-extrathin text-3xl md:text-5xl">
              & <span className="font-bold ">Take an Exam</span>
            </span>
          </h1>
          <div className="-bottom-10 absolute right-60 hidden md:block">
            <svg
              width="70"
              height="67"
              viewBox="0 0 70 67"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="17.4881" cy="17.4881" r="17.4881" fill="#FFB1AA" />
              <circle cx="17.4914" cy="17.4875" r="13.4211" fill="#FDC8C4" />
              <circle cx="17.486" cy="17.4899" r="8.54069" fill="#FFDCD9" />
              <path
                d="M52.8755 63.4482C47.3444 66.3764 39.4544 64.6683 36.2008 63.4482L29.2869 60.194L20.3395 54.5002L17.8993 49.2131L23.5931 45.5528L33.3539 49.2131L26.0333 36.1987L17.0859 20.7441L19.1194 15.457L25.2199 16.2704L29.2869 24.405L34.1673 28.8781C34.818 24.6484 39.8611 25.4889 42.3013 26.4379C43.6027 21.5575 49.0796 23.0492 51.6554 24.405C51.6554 20.5007 55.1801 21.1514 56.9425 21.9648C59.7894 25.6251 65.9712 34.8979 67.9234 42.7065C70.3635 52.4673 59.7894 59.7879 52.8755 63.4482Z"
                fill="#FFCC66"
              />
              <path
                d="M67.5839 35.9748L59.8284 22.5433C59.0446 21.1859 57.7754 20.2145 56.2544 19.8081C54.7355 19.4022 53.1533 19.6106 51.8029 20.3929C50.9458 20.8868 50.2426 21.574 49.738 22.396C47.8464 21.1922 45.3626 21.0529 43.2874 22.2475C42.1906 22.8793 41.3145 23.8329 40.7776 24.9792C39.0003 24.1488 36.8588 24.1682 35.0366 25.2203C34.3033 25.6425 33.6765 26.199 33.1814 26.8571L26.8984 15.9712C26.0706 14.54 24.7304 13.515 23.1247 13.0849C21.5177 12.6545 19.8444 12.8737 18.4162 13.6998C16.9822 14.5252 15.9554 15.8649 15.5248 17.4721C15.0948 19.0771 15.3127 20.7497 16.1391 22.1824L29.8134 45.8679L28.0785 44.8665C26.0216 43.6776 23.6539 43.3823 21.4115 44.0351C19.2226 44.6723 17.369 46.1468 16.193 48.1857C14.9631 50.3145 15.6944 53.0467 17.8238 54.2769L35.6676 64.5767C38.4674 66.1941 41.4721 67.0027 44.4777 67.0024C47.4827 67.0023 50.4886 66.1936 53.2877 64.5767L61.132 60.0462C69.5467 55.1908 72.4411 44.3927 67.5839 35.9748ZM65.6737 48.3641C64.7155 51.9406 62.4301 54.9242 59.2383 56.766L51.3932 61.297C46.9981 63.8357 41.9569 63.8359 37.5614 61.2966L19.7176 50.997C19.4027 50.8151 19.2905 50.3954 19.4729 50.0794C20.1592 48.8897 21.2236 48.0347 22.4699 47.6719C22.8922 47.5486 23.3298 47.486 23.7697 47.4859C24.5993 47.4859 25.4268 47.709 26.1837 48.1464L34.0393 52.681C34.4004 52.8892 34.82 52.9726 35.2333 52.9181C35.6465 52.8636 36.0302 52.6743 36.325 52.3796C36.6197 52.0848 36.8089 51.7011 36.8634 51.2878C36.9178 50.8746 36.8344 50.4549 36.6261 50.0939L19.4195 20.2895C19.0987 19.7332 19.0149 19.0807 19.1833 18.4522C19.3516 17.8241 19.7502 17.3022 20.3091 16.9804C20.8641 16.6593 21.5161 16.5752 22.1448 16.7436C22.7741 16.9122 23.2979 17.3113 23.6187 17.866L36.9538 40.9678C37.3045 41.5754 37.9411 41.9152 38.5957 41.9152C38.9169 41.9152 39.2425 41.8334 39.5407 41.6613C40.4466 41.1385 40.7569 39.9802 40.2341 39.0744L36.0316 31.794C35.7184 31.2412 35.6369 30.5953 35.8037 29.9726C35.972 29.3445 36.3706 28.8226 36.9281 28.5015C38.0851 27.8335 39.5709 28.2311 40.2371 29.3831L40.2386 29.3858L40.2431 29.3936L44.4296 36.6513C44.7802 37.2592 45.4171 37.5991 46.0718 37.5991C46.3927 37.5991 46.7182 37.5174 47.0163 37.3454C47.9223 36.8229 48.2332 35.6648 47.7105 34.7588L44.2692 28.793C43.6393 27.6411 44.04 26.1864 45.1788 25.5287C46.3381 24.8615 47.8243 25.2597 48.4916 26.4155L51.9063 32.332C52.257 32.9396 52.8936 33.2793 53.5482 33.2793C53.8694 33.2793 54.195 33.1975 54.4932 33.0253C55.3989 32.5024 55.7094 31.3441 55.1865 30.4384L52.9246 26.5203C52.6508 26.0422 52.5794 25.4825 52.724 24.9434C52.8692 24.4018 53.2136 23.9511 53.6974 23.6723C54.175 23.3957 54.7357 23.3228 55.2765 23.4673C55.8191 23.6122 56.2707 23.9566 56.5481 24.4372L64.3034 37.8683C66.1452 41.0602 66.632 44.7877 65.6737 48.3641Z"
                fill="black"
              />
            </svg>
          </div>
        </div>

        {/* Description Text */}
        <div className="space-y-1 px-4 pt-3 sm:pt-9 md:px-0">
          <p className="dark: text-base text-black-700 md:text-xl">
            Practice makes perfect.
          </p>
          <p className="text-base text-gray-800 md:text-xl">
            <span className="font-semibold">
              Test your knowledge, track your progress,
            </span>{" "}
            and get <span className="font-semibold">interview-ready!</span>
          </p>
          </div>
          <div className="flex justify-center">
            <button className="flex items-center gap-2 rounded-full border border-black px-5 py-2 text-lg font-semibold text-black shadow-sm transition-all hover:bg-gray-100">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black">
                <Play size={14} fill="#FFC65A" stroke="none" />
              </div>
              <span>See how it works</span>
            </button>
          </div>
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <TopPick />
          </div>
          <div>
            <Problems />
          </div>      
      </div>
    </div>
  )
}

export default TakeExam
