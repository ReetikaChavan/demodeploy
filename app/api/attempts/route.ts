import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/database/connection"
import Attempt from "@/database/models/attempt"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { deviceId, title, category, score, completionTime } = body

    if (
      !deviceId ||
      !title ||
      !category ||
      score === undefined ||
      completionTime === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    await dbConnect()

    // Simply record the attempt without checking if it's locked
    const attemptData = await Attempt.findOneAndUpdate(
      { deviceId, title, category },
      {
        $set: {
          lastAttemptDate: new Date(),
          // Decrement attempts left by 1
          attemptsLeft: { $subtract: ["$attemptsLeft", 1] }
        },
        $push: { attemptHistory: { date: new Date(), score, completionTime } },
        $max: { bestScore: score },
      },
      { upsert: true, new: true }
    )

    // Calculate average completion time
    const totalTime = attemptData.attemptHistory.reduce(
      (sum: number, attempt: { completionTime?: number }) =>
        sum + (attempt.completionTime || 0),
      0
    )
    attemptData.averageCompletionTime =
      totalTime / attemptData.attemptHistory.length

    await attemptData.save()

    return NextResponse.json({
      title: attemptData.title,
      category: attemptData.category,
      attemptsLeft: attemptData.attemptsLeft,
      totalAttempts: attemptData.totalAttempts || 3,
      bestScore: attemptData.bestScore,
      averageCompletionTime: attemptData.averageCompletionTime,
    })
  } catch (error) {
    console.error("Error saving attempt data:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}