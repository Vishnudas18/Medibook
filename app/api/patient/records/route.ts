import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import MedicalRecord from '@/models/MedicalRecord';
import { getAuthUser } from '@/lib/auth';

/**
 * GET — Fetch all medical records for the current patient
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'patient') {
      return Response.json(
        { success: false, error: 'Unauthorized — Patient access only' },
        { status: 401 }
      );
    }

    await connectDB();

    const records = await MedicalRecord.find({ patientId: user.userId })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return Response.json({
      success: true,
      data: records,
    });
  } catch (error) {
    console.error('Fetch medical records error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST — Upload a new medical record
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'patient') {
      return Response.json(
        { success: false, error: 'Unauthorized — Patient access only' },
        { status: 401 }
      );
    }

    const { title, category, fileUrl, issuedBy, date, notes } = await request.json();
    if (!title || !fileUrl) {
      return Response.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    const newRecord = await MedicalRecord.create({
      patientId: user.userId,
      title,
      category,
      fileUrl,
      issuedBy: issuedBy || '',
      date: date || undefined,
      notes: notes || '',
    });

    return Response.json({
      success: true,
      data: newRecord,
      message: 'Medical record added successfully',
    });
  } catch (error) {
    console.error('Add medical record error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
