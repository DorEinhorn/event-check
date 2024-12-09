'use client';

import React, { useState, useEffect } from 'react';
import CheckInPortal from './CheckInPortal';
import EventsList from './EventsList';
import { parseExcelFile, generateExcel } from '../utis/excelHandler'; // Fixed typo in path
import { ArrowLeft, Plus } from 'lucide-react';

const EventsDashboard = () => {
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents().catch(error => {
      setError('Failed to load events: ' + error.message);
    });
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/events');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data || []);
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (name, date, attendees) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, date, attendees })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event');
      }
      
      const event = await response.json();
      setEvents(current => [...current, event]);
      return event;
    } catch (error) {
      console.error('Create event error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateAttendeeStatus = async (attendeeId, status) => {
    try {
      const response = await fetch(`/api/attendees/${attendeeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update attendee');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Update attendee error:', error);
      throw error;
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      const attendees = await parseExcelFile(file);
      if (!attendees || attendees.length === 0) {
        throw new Error('No valid attendees found in file');
      }

      const newEvent = await createEvent(
        file.name.replace('.xlsx', ''),
        new Date().toISOString(),
        attendees
      );

      setCurrentEvent(newEvent);
    } catch (error) {
      setError('Error uploading file: ' + error.message);
      console.error('File upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (event) => {
    if (!event?.attendees) return;

    try {
      setLoading(true);
      setError(null);
      await generateExcel(event);
    } catch (error) {
      setError('Error exporting file: ' + error.message);
      console.error('Export error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async (updatedEvent) => {
    if (!currentEvent || !updatedEvent) return;

    try {
      setError(null);
      
      const changedAttendee = updatedEvent.attendees.find(
        attendee => attendee.status !== 
          currentEvent.attendees.find(a => a.id === attendee.id)?.status
      );
  
      if (!changedAttendee) return;
  
      const updatedAttendeeResponse = await updateAttendeeStatus(
        changedAttendee.id,
        changedAttendee.status
      );
  
      const updatedEvents = events.map(evt =>
        evt.id === updatedEvent.id ? {
          ...evt,
          attendees: evt.attendees.map(att =>
            att.id === updatedAttendeeResponse.id ? {
              ...att,
              ...updatedAttendeeResponse
            } : att
          )
        } : evt
      );
  
      setEvents(updatedEvents);
      setCurrentEvent(updatedEvents.find(evt => evt.id === updatedEvent.id));
    } catch (error) {
      setError('Error updating event: ' + error.message);
      console.error('Update error:', error);
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete event');
      }

      setEvents(current => current.filter(event => event.id !== eventId));
      if (currentEvent?.id === eventId) {
        setCurrentEvent(null);
      }
    } catch (error) {
      setError('Error deleting event: ' + error.message);
      console.error('Delete error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (event) => {
    if (!event?.id) return;
    
    if (window.confirm(`Are you sure you want to delete the event "${event.name}"?`)) {
      try {
        await deleteEvent(event.id);
      } catch (error) {
        // Error is already handled in deleteEvent
      }
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">Loading...</div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {currentEvent ? (
        <div>
          <button
            onClick={() => setCurrentEvent(null)}
            className="flex items-center gap-2 mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </button>
          <CheckInPortal
            event={currentEvent}
            onUpdateEvent={handleUpdateEvent}
          />
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Event Check-in System</h1>
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600">
              <Plus className="h-4 w-4" />
              New Event
              <input
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={handleFileUpload}
                disabled={loading}
              />
            </label>
          </div>
          
          <EventsList
            events={events}
            onEventSelect={setCurrentEvent}
            onExport={handleExport}
            onDelete={handleDeleteEvent}
          />
        </div>
      )}
    </div>
  );
};

export default EventsDashboard;