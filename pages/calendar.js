import { useEffect } from 'react';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';

function CalendarPage() {
  useEffect(() => {
    async function fetchEvents() {
      const response = await fetch('./api/sheets');
      const data = await response.json();

      const eventArray = data.mappedData.map((event) => ({
        title: event.event_name,
        start: new Date(event.start_date),
        end: new Date(event.end_date),
        allDay: false,
        extendedProps: {
          category: event.category,
          location: event.location,
          cost: event.cost,
          additional_information: event.additional_information,
        },
      }));

      const calendarEl = document.getElementById('calendar');
      const calendar = new Calendar(calendarEl, {
        plugins: [dayGridPlugin],
        events: eventArray,
        headerToolbar: {
            left: 'prev,next',
            center: 'title',
            right: 'resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth'
          },
      });
      calendar.render();
    }

    fetchEvents();
  }, []);

  return <div id="calendar" />;
}

export default CalendarPage;
