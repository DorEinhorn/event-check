import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(request) {
  try {
    const id = request.url.split('/').pop();
    console.log('Deleting event:', id);
    
    // First delete all attendees for this event
    await prisma.attendee.deleteMany({
      where: {
        eventId: parseInt(id)
      }
    });

    // Then delete the event
    await prisma.event.delete({
      where: {
        id: parseInt(id)
      }
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Event deleted successfully',
      id: parseInt(id)
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}