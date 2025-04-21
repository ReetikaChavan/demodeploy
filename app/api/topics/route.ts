import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const dataDir = path.join(process.cwd(), "data");
    let problems: any[] = [];

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const difficulty = searchParams.get("difficulty") || "";
    const category = searchParams.get("category") || "";
    const level = searchParams.get("level") || "";
    const searchTerm = searchParams.get("search") || "";
    const duration = searchParams.get("duration") || "";
    const pageSize = 10;

    const categoryMapping: Record<string, string> = {
      "data-science": "Data Science",
      "ai-&-machine-learning": "AI & Machine Learning",
      // "aptitude-test": "Aptitude Test",
      "cet": "CET",
      "dsa": "DSA",
      "interview-preparation": "Interview Preparation",
      "prompt-engineering": "Prompt Engineering",
    };

    const topics = fs.readdirSync(dataDir);
    topics.forEach((topic) => {
      const topicPath = path.join(dataDir, topic);
      if (!fs.statSync(topicPath).isDirectory()) return;

      const displayCategory = categoryMapping[topic] || topic;
      
      try {
        const stages = fs.readdirSync(topicPath);

        stages.forEach((stage) => {
          const stagePath = path.join(topicPath, stage);
          if (!fs.statSync(stagePath).isDirectory()) return;

          const subtopics = fs.readdirSync(stagePath);

          subtopics.forEach((file) => {
            if (!file.endsWith(".json")) return;

            const filePath = path.join(stagePath, file);
            const relativePath = path.relative(process.cwd(), filePath);

            try {
              const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));

              let timeInMinutes = 10;
              if (content.timer) {
                if (content.timer.includes("minutes")) {
                  timeInMinutes = parseInt(content.timer);
                } else if (content.timer.includes("hour")) {
                  timeInMinutes = parseInt(content.timer) * 60;
                }
              }

              problems.push({
                id: problems.length + 1,
                title: content.title,
                totalQuestions: content.questions ? content.questions.length : 0,
                timeInMinutes: timeInMinutes,
                difficulty: content.Difficulty || "Medium",
                level: content.level || "Intermediate",
                category: content.category || displayCategory,
                path: relativePath.replace(/\\/g, "/"),
              });
            } catch (error) {
              console.error(`Error parsing file ${filePath}:`, error);
            }
          });
        });
      } catch (error) {
        console.error(`Error reading directory ${topicPath}:`, error);
      }
    });

    problems = problems.sort(() => Math.random() - 0.5);

    let filteredProblems = problems;

    if (difficulty && difficulty !== "All") {
      filteredProblems = filteredProblems.filter((problem) => problem.difficulty === difficulty);
    }

    if (category) {
      const decodedCategory = decodeURIComponent(category);
      filteredProblems = filteredProblems.filter((problem) => problem.category === decodedCategory);
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredProblems = filteredProblems.filter((problem) => problem.title.toLowerCase().includes(searchLower));
    }

    if (level && level !== "All") {
      filteredProblems = filteredProblems.filter((problem) => problem.level === level);
    }

    if (duration) {
      switch (duration) {
        case '10min-20min':
          filteredProblems = filteredProblems.filter((problem) => 
            problem.timeInMinutes >= 10 && problem.timeInMinutes <= 20
          );
          break;
        case '30min-40min':
          filteredProblems = filteredProblems.filter((problem) => 
            problem.timeInMinutes >= 30 && problem.timeInMinutes <= 40
          );
          break;
        case '50min-1hr':
          filteredProblems = filteredProblems.filter((problem) => 
            problem.timeInMinutes >= 50 && problem.timeInMinutes <= 60
          );
          break;
        default:
          const [minDuration, maxDuration] = duration.split('-').map(d => {
            const value = parseInt(d.replace(/[^0-9]/g, ''));
            if (d.includes('hour')) {
              return value * 60;
            }
            return value;
          });
    
          if (!isNaN(minDuration) && !isNaN(maxDuration)) {
            filteredProblems = filteredProblems.filter((problem) => 
              problem.timeInMinutes >= minDuration && problem.timeInMinutes <= maxDuration
            );
          }
      }
    }
    const totalPages = Math.ceil(filteredProblems.length / pageSize) || 1;
    const paginatedProblems = filteredProblems.slice((page - 1) * pageSize, page * pageSize);

    return NextResponse.json({
      problems: paginatedProblems,
      totalPages,
      totalResults: filteredProblems.length,
    });
  } catch (error) {
    console.error("Error fetching problems:", error);
    return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 });
  }
}
