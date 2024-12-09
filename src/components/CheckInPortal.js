'use client';

import React, { useState, useEffect } from 'react';
import { Search, UserCheck, UserX } from 'lucide-react';

const CheckInPortal = ({ event, onUpdateEvent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    registered: 0,
    checkedIn: 0,
    noShow: 0
  });

  useEffect(() => {
    if (event?.attendees) {
      calculateStats();
    }
  }, [event?.attendees]);

  const calculateStats = () => {
    if (!event?.attendees) return;
    
    setStats({
      registered: event.attendees.filter(a => a.status === 'Registered').length,
      checkedIn: event.attendees.filter(a => a.status === 'Checked-in').length,
      noShow: event.attendees.filter(a => a.status === 'No-show').length
    });
  };

  const handleStatusUpdate = (attendeeId, newStatus) => {
    if (!event?.attendees) return;

    const updatedAttendees = event.attendees.map(attendee =>
      attendee.id === attendeeId
        ? {
            ...attendee,
            status: newStatus,
            checkInTime: newStatus === 'Checked-in' ? new Date().toISOString() : null
          }
        : attendee
    );

    onUpdateEvent({
      ...event,
      attendees: updatedAttendees
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredAttendees = event?.attendees?.filter(attendee =>
    `${attendee.firstName} ${attendee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (!event) return null;

  return (
<div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header Section */}
      <div className="p-4 sm:p-6 border-b space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900">
            Event Check-in: {event.name}
          </h2>
          <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
            {formatDate(event.date)}
          </div>
        </div>

        {/* Search and Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search attendees..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-6 bg-gray-50 p-3 rounded-lg">
            <div className="text-center sm:text-left">
              <div className="text-xs text-gray-500">Registered</div>
              <div className="font-bold text-gray-900">{stats.registered}</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-xs text-gray-500">Checked-in</div>
              <div className="font-bold text-green-600">{stats.checkedIn}</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-xs text-gray-500">No-show</div>
              <div className="font-bold text-red-600">{stats.noShow}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Email
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendees.map((attendee, index) => (
                <tr key={attendee.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {`${attendee.firstName} ${attendee.lastName}`}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                    {attendee.email}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      attendee.status === 'Checked-in' 
                        ? 'bg-green-100 text-green-800'
                        : attendee.status === 'No-show'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {attendee.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleStatusUpdate(attendee.id, 'Checked-in')}
                        className={`inline-flex items-center p-1.5 rounded-full transition-colors ${
                          attendee.status === 'Checked-in'
                            ? 'bg-gray-100 cursor-not-allowed'
                            : 'hover:bg-green-100'
                        }`}
                        disabled={attendee.status === 'Checked-in'}
                        title="Check-in"
                      >
                        <UserCheck className={`h-5 w-5 ${
                          attendee.status === 'Checked-in' 
                            ? 'text-gray-400'
                            : 'text-green-600'
                        }`} />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(attendee.id, 'No-show')}
                        className={`inline-flex items-center p-1.5 rounded-full transition-colors ${
                          attendee.status === 'No-show'
                            ? 'bg-gray-100 cursor-not-allowed'
                            : 'hover:bg-red-100'
                        }`}
                        disabled={attendee.status === 'No-show'}
                        title="Mark as no-show"
                      >
                        <UserX className={`h-5 w-5 ${
                          attendee.status === 'No-show'
                            ? 'text-gray-400'
                            : 'text-red-600'
                        }`} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CheckInPortal;