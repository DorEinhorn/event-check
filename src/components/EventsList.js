'use client';

import React, { useState } from 'react';
import { Calendar, Users, ArrowRight, Download, Trash2, Search } from 'lucide-react';

const EventsList = ({ events = [], onEventSelect, onExport, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredEvents = events?.filter(event => 
    event?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getAttendeeStats = (attendees = []) => {
    return {
      total: attendees.length,
      checkedIn: attendees.filter(a => a.status === 'Checked-in').length,
      noShow: attendees.filter(a => a.status === 'No-show').length
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 sm:p-6 border-b space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Events Management</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Calendar className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No events found</h3>
              <p className="text-gray-500">Try adjusting your search terms</p>
            </div>
          ) : (
            filteredEvents.map(event => {
              const stats = getAttendeeStats(event.attendees);
              
              return (
                <div 
                  key={event.id} 
                  className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(event.date)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{stats.total} attendees</span>
                          </div>
                        </div>

                        <div className="flex gap-6">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span className="text-sm text-gray-600">
                              Checked-in: <span className="font-medium text-gray-900">{stats.checkedIn}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-500"></div>
                            <span className="text-sm text-gray-600">
                              No-show: <span className="font-medium text-gray-900">{stats.noShow}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col gap-2 justify-end">
                        <button
                          onClick={() => onDelete(event)}
                          className="inline-flex items-center justify-center p-2 text-gray-600 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => onExport(event)}
                          className="inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                          title="Export to Excel"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-6 flex justify-end">
                      <button
                        onClick={() => onEventSelect(event)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Manage Event
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsList;