import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      try {
        const events = await prisma.event.findMany({
          include: {
            attendees: true
          }
        });
        res.status(200).json(events);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch events' });
      }
      break;

    case 'POST':
      try {
        const { name, date, attendees } = req.body;
        
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
        
        res.status(201).json(event);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create event' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}