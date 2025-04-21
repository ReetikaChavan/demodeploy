import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

type Problem = {
  title: string;
  level: string;
  difficulty: string;
  category: string;
  path: string;
  timer: number;
  description: string;
  totalQuestions: number;
  skill?: string;          
  knowledge?: string;
  application?: string;
  why?: string;
};

export async function GET(req: NextRequest) {
  try {
    // Extract query parameters
    const searchParams = req.nextUrl.searchParams;
    const category = decodeURIComponent(searchParams.get("category") || "").trim().toLowerCase();
    const title = decodeURIComponent(searchParams.get("title") || "").trim().toLowerCase();

    if (!category || !title) {
      return NextResponse.json(
        { error: "Both category and title are required" },
        { status: 400 }
      );
    }

    console.log("Requested Category:", category);
    console.log("Requested Title:", title);

    // Fetch all problems
    const dataDir = path.join(process.cwd(), "data");
    const problemsIndex = getAllProblems(dataDir);

    // Find the problem matching category and title
    const problem = problemsIndex.find(
      (p) => p.category.toLowerCase() === category && p.title.toLowerCase() === title
    );

    console.log("Matching Problem:", problem);

    if (!problem || !problem.path) {
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 }
      );
    }

    // Read the problem file
    const filePath = path.join(process.cwd(), problem.path);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Problem file not found" },
        { status: 404 }
      );
    }

    const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    // Convert timer to minutes
    const timerValue = parseTimer(content.timer);

    
    const fullProblem = {
      title: content.title,
      level: content.level || "Intermediate",
      difficulty: content.difficulty || content.Difficulty || "Medium",
      category: problem.category,
      timer: timerValue,
      totalQuestions: content.questions?.length || 0,
      skill: content.skill || "0%",
      knowledge: content.knowledge || "0%",
      application: content.application || content.Application || "0%", 
      why: content.why,
    };

    return NextResponse.json(fullProblem, { status: 200 });
  } catch (error) {
    console.error("Error fetching problem description:", error);
    return NextResponse.json(
      { error: "Failed to fetch problem description" },
      { status: 500 }
    );
  }
}

// Function to parse timer value
function parseTimer(timer: string | number | undefined): number {
  if (!timer) return 10; 

  if (typeof timer === "string") {
    const match = timer.match(/(\d+)/);
    return match && match[1] ? parseInt(match[1]) : 10;
  }

  if (typeof timer === "number") {
    return timer;
  }

  return 10;
}

// Function to fetch all problems
function getAllProblems(dataDir: string): Problem[] {
  let problems: Problem[] = [];
  const categoryMapping: Record<string, string> = {
    "data-science": "Data Science",
    "ai-&-machine-learning": "AI & Machine Learning",
    // "aptitude-test": "Aptitude Test",
    "cet": "CET",
    "dsa": "DSA",
    "interview-preparation": "Interview Preparation",
    "prompt-engineering": "Prompt Engineering",
  };

  try {
    const topics = fs.readdirSync(dataDir);

    for (const topic of topics) {
      const topicPath = path.join(dataDir, topic);
      if (!fs.statSync(topicPath).isDirectory()) continue;

      const displayCategory = categoryMapping[topic.toLowerCase()] || topic;
      const stages = fs.readdirSync(topicPath);

      for (const stage of stages) {
        const stagePath = path.join(topicPath, stage);
        if (!fs.statSync(stagePath).isDirectory()) continue;

        const subtopics = fs.readdirSync(stagePath);

        for (const file of subtopics) {
          if (!file.endsWith(".json")) continue;

          const filePath = path.join(stagePath, file);
          const relativePath = path.relative(process.cwd(), filePath);

          try {
            const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
            const timerValue = parseTimer(content.timer);

            problems.push({
              title: content.title,
              level: content.level || "Intermediate",
              difficulty: content.difficulty || content.Difficulty || "Medium",
              category: displayCategory,
              path: relativePath.replace(/\\/g, "/"),
              timer: timerValue,
              description: content.description || "No description available.",
              totalQuestions: content.questions?.length || 0,
              skill: content.skill || "0%",
              knowledge: content.knowledge || "0%",
              application: content.application || content.Application || "0%", 
              why: content.why,
            });
          } catch (error) {
            console.error(`Error parsing file ${filePath}:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error reading data directory:", error);
  }

  return problems;
}
