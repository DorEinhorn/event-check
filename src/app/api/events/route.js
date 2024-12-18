import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log("Attempting to fetch events...");
    const events = await prisma.event.findMany({
      include: { attendees: true },
    });
    console.log("Fetched events:", events);
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    console.log("Attempting to create an event...");
    const { name, date, attendees } = await request.json();
    console.log("Received data:", { name, date, attendees });

    const event = await prisma.event.create({
      data: {
        name,
        date: new Date(date),
        attendees: {
          create: attendees.map((attendee) => ({
            firstName: attendee.firstName,
            lastName: attendee.lastName,
            email: attendee.email,
            status: 'Registered',
          })),
        },
      },
      include: { attendees: true },
    });

    console.log("Created event:", event);
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event", details: error.message },
      { status: 500 }
    );
  }
}
