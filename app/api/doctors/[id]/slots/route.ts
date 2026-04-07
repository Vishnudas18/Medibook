import { NextRequest } from 'next/server';
import { getAvailableSlots } from '@/lib/slots';

/**
 * GET — Fetch available slots for a specific doctor on a specific date
 */
export async function GET(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const params = await context.params;
    const { searchParams } = request.nextUrl;
    const date = searchParams.get('date');

    if (!date) {
      return Response.json(
        { success: false, error: 'Date is required' },
        { status: 400 }
      );
    }

    const slots = await getAvailableSlots(params.id, date);

    return Response.json({
      success: true,
      data: slots,
    });
  } catch (error) {
    console.error('Fetch slots error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
