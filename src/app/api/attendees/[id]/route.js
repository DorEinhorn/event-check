import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request) {
  try {
    const id = request.url.split('/').pop();
    const data = await request.json();
    console.log('Updating attendee:', id, data);

    const updatedAttendee = await prisma.attendee.update({
      where: {
        id: parseInt(id)
      },
      data: {
        status: data.status,
        checkInTime: data.status === 'Checked-in' ? new Date() : null
      }
    });

    return NextResponse.json(updatedAttendee);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update attendee' },
      { status: 500 }
    );
  }
}