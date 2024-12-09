import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        attendees: true
      }
    });
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { name, date, attendees } = await request.json();
    
    const event = await prisma.event.create({
      data: {
        name,
        date: new Date(date),
        attendees: {
          create: attendees.map(attendee => ({
            firstName: attendee.firstName,
            lastName: attendee.lastName,
            email: attendee.email,
            status: 'Registered'
          }))
        }
      },
      include: {
        attendees: true
      }
    });
    
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}