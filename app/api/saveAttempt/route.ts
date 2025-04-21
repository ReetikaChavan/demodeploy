import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/database/connection"
import Attempt from "@/database/models/attempt"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { deviceId, title, category, score, attemptsLeft, completionTime } = body

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

    const newAttemptsLeft = attemptsLeft - 1;

    // Simply update the attempt data without any locking checks
    const attemptData = await Attempt.findOneAndUpdate(
      { deviceId, title, category },
      {
        $set: {
          lastAttemptDate: new Date(),
          attemptsLeft: newAttemptsLeft  // Use server-calculated value
        },
        $push: { attemptHistory: { date: new Date(), score, completionTime } },
        $max: { bestScore: score },
      },
      { upsert: true, new: true }
    );

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