import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/database/connection"
import Attempt from "@/database/models/attempt"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get("deviceId")
    const title = searchParams.get("title")
    const category = searchParams.get("category")
    
    console.log("API received params:", { deviceId, title, category });

    if (!deviceId || !title || !category) {
      console.log("Missing parameters in request");
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    await dbConnect()
    
    // Find attempt data for this device and exam
    let attemptData = await Attempt.findOne({ deviceId, title, category })
    console.log("Database query result:", attemptData);

    // If no data exists, create a new default object
    if (!attemptData) {
      console.log("No attempt data found, creating default");
      const newAttemptData = new Attempt({
        deviceId,
        title,
        category,
        attemptsLeft: 3,
        totalAttempts: 3,
        bestScore: 0,
        averageCompletionTime: 0,
        attemptHistory: []
      });
      
      // Save the default attempt data to the database
      await newAttemptData.save();
      attemptData = newAttemptData;
    }

    // Convert to plain object if it's a Mongoose document
    const attemptObject = attemptData.toObject ? attemptData.toObject() : attemptData;

    const response = {
      title: attemptObject.title,
      category: attemptObject.category,
      attemptsLeft: attemptObject.attemptsLeft,
      totalAttempts: attemptObject.totalAttempts,
      bestScore: attemptObject.bestScore,
      averageCompletionTime: attemptObject.averageCompletionTime || 0,
      attemptHistory: attemptObject.attemptHistory || []
    }
    
    console.log("Sending response:", response);
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in attempts API:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}