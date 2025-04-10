import { NextRequest, NextResponse } from 'next/server';
import dbConnect from "@/database/connection";
import Attempt from "@/database/models/attempt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, title, category } = body;

    if (!deviceId || !title || !category) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    await dbConnect();

    // Find attempt record
    const attemptData = await Attempt.findOne({ deviceId, title, category });

    if (!attemptData) {
      return NextResponse.json({ error: 'Attempt record not found' }, { status: 404 });
    }

    // Reset attempts but keep history
    attemptData.attemptsLeft = attemptData.totalAttempts;
    await attemptData.save();

    return NextResponse.json({
      title: attemptData.title,
      category: attemptData.category,
      attemptsLeft: attemptData.attemptsLeft,
      totalAttempts: attemptData.totalAttempts,
      bestScore: attemptData.bestScore,
      averageCompletionTime: attemptData.averageCompletionTime ?? 0, 
      attemptHistory: attemptData.attemptHistory, 
      message: 'Attempts reset successfully'
    });
  } catch (error) {
    console.error('Error resetting attempts:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
