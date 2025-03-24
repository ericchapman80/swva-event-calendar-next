import React from 'react'
import { createRoot } from 'react-dom/client';
import { useEffect, useState, useRef } from 'react';
//import { Combobox } from '@headlessui/react'
import Image from 'next/image'
import Head from 'next/head'
//import moment from 'moment';
import moment from 'moment-timezone';
import { Inter } from 'next/font/google'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import Modal from 'react-modal';
import { Calendar } from '@fullcalendar/core'
//import { Table } from "@nextui-org/react";
import { Table, TableHead, TableRow, TableCell, TableBody, TableContainer, TablePagination, Paper } from '@mui/material';

const inter = Inter({ subsets: ['latin'] })

const DEBUG_LEVEL = process.env.NEXT_PUBLIC_DEBUG || 'none';

const log = (level, ...args) => {
  const levels = ['none', 'error', 'warn', 'info'];
  if (levels.indexOf(level) <= levels.indexOf(DEBUG_LEVEL)) {
    if (level === 'error') {
      console.error(...args);
    } else if (level === 'warn') {
      console.warn(...args);
    } else if (level === 'info') {
      console.log(...args);
    }
  }
};

export async function getStaticProps() {
  const events = await getEventData();
  return {
    props: {
      data: events,
    },
  };
}

export default function Home({ data }) {
  const calendarRef = useRef(null);
  const [screenWidth, setScreenWidth] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [eventInfo, setEventInfo] = useState(null);

  const [events, setEvents] = useState(data || []);
  const [category, setCategory] = useState("All");
  const [filteredEvents, setFilteredEvents] = useState(data || []);
  const [eventCategoryList, setEventCategoryList] = useState(["All",]);

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      const eventData = await getEventData();
      setEvents(eventData);
      setFilteredEvents(eventData);
    };

    if (events.length === 0) {
      fetchEvents();
    }
  }, [events.length]);

  useEffect(() => {
    const categories = [...new Set(events.map((event) => event.extendedProps.category))];
    categories.sort();
    setEventCategoryList(["All", ...categories]);

    const filteredEvents = events
      .filter((event) => category === "All" || event.extendedProps.category === category)
      .sort((a, b) => new Date(a.start) - new Date(b.start)); // Sort by date and start time in ascending order

    setFilteredEvents(filteredEvents);
    updateEventTable(filteredEvents);
  }, [category, events]);

  useEffect(() => {
    const calendarApi = calendarRef.current.getApi();
    
    const handleWindowResize = () => {
      const screenWidth = window.innerWidth;
      var calendarView = 'dayGridMonth';
      
      if (screenWidth && screenWidth < 800) {
        calendarApi.setOption('headerToolbar', {
          left: '',
          center: 'title,prev,next',
          end: '',
        });
        calendarView = 'listWeek';
      } else {
        calendarApi.setOption('headerToolbar', {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek,listWeek',
        });
        calendarView = 'dayGridMonth';
      }
  
      if (calendarApi.view.type !== calendarView) {
        calendarApi.changeView(calendarView);
      }
      calendarApi.render(); // Re-render the calendar after updating the width
    };
    
    // Set the initial view on mount
    handleWindowResize();
  
    // Attach event listener to window to handle resizing
    window.addEventListener('resize', handleWindowResize);
  
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);
    
  const updateEventTable = (categorizedEvents) => {
    if (!categorizedEvents || categorizedEvents.length === 0) return;
  
    const eventTable = document.getElementById('eventTable');
  
    if (category === "All") {
      eventTable.style.display = 'none';
      return;
    }
  
    const currentDate = new Date();
  
    const tableRows = categorizedEvents
      .filter((eventItemByCategory) => {
        const eventDate = new Date(eventItemByCategory.start);
        return (
          eventItemByCategory.extendedProps?.category === category &&
          eventDate >= currentDate
        );
      })
      .map((eventItem) => {
        const { title, start, end, allDay, extendedProps } = eventItem;
  
        const hasEndDate = extendedProps?._hasEndDate && !!end;
  
        const formattedStartDate = moment.utc(start).local().format('MM-DD-YYYY');
        const formattedStartTime = !allDay ? moment.utc(start).local().format('h:mm A') : '';
  
        const formattedEndDate = hasEndDate ? moment.utc(end).local().format('MM-DD-YYYY') : '';
        const formattedEndTime = hasEndDate && !allDay ? moment.utc(end).local().format('h:mm A') : '';
  
        return (
          <TableRow key={title}>
            <TableCell>{title}</TableCell>
            <TableCell>{formattedStartDate}</TableCell>
            <TableCell>{formattedEndDate}</TableCell>
            <TableCell>{formattedStartTime}</TableCell>
            <TableCell>{formattedEndTime}</TableCell>
            <TableCell>{extendedProps?.location}</TableCell>
            <TableCell>{extendedProps?.cost}</TableCell>
            <TableCell>{extendedProps?.additional_information}</TableCell>
          </TableRow>
        );
      });
  
    const root = createRoot(eventTable);
    if (tableRows.length > 0) {
      root.render(
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Cost</TableCell>
                <TableCell>Additional Information</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{tableRows}</TableBody>
          </Table>
        </TableContainer>
      );
      eventTable.style.display = 'block';
    } else {
      root.render(
        <div style={{ textAlign: 'center' }}>
          No scheduled items for the selected category: {category}
        </div>
      );
      eventTable.style.display = 'block';
    }
  };
  
  const handleEventClick = (info) => {
    log('info', "🔍 Event Clicked (Raw FullCalendar Event):", info.event);
  
    const { title, start, end, extendedProps, allDay } = info.event;
  
    // Handle missing end dates safely
    const hasEnd = !!end;
    const hasEndDate = extendedProps?._hasEndDate && hasEnd;
  
    const formattedStartDate = moment.utc(start).local().format("MM-DD-YYYY");
    const formattedStartTime = !allDay ? moment.utc(start).local().format("h:mm A") : null;
  
    const formattedEndDate = hasEndDate ? moment.utc(end).local().format("MM-DD-YYYY") : null;
    const formattedEndTime = hasEndDate && !allDay ? moment.utc(end).local().format("h:mm A") : null;
  
    setEventInfo({
      title,
      formattedStartDate,
      formattedEndDate,
      formattedStartTime,
      formattedEndTime,
      allDay,
      hasEndDate,
      category: extendedProps?.category,
      location: extendedProps?.location,
      cost: extendedProps?.cost,
      additional_information: extendedProps?.additional_information
    });
  
    setIsOpen(true);
  };
        
  const closeModal = () => {
    setIsOpen(false);
  };
  
  // Custom styles for the modal
  const modalStyle = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 9999 // Higher z-index value to ensure it appears on to
    },
    content: {
      backgroundColor: '#fff',
      border: 'none',
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
      padding: '20px',
      color: '#333',
      zIndex: 10000 // Higher z-index value to ensure it appears on top
    }
  };
  
  //Override Full Calendar Default Button Text
  const buttonOptions = {
    prev: 'Prev',
    next: 'Next',
    today: 'Today',
    month: 'Month',
    week: 'Week',
    day: 'Day',
    list: 'List',
  };

  const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  log('info', "User's Local Timezone:", currentTimeZone);

  return (
    <main className={`flex min-h-screen flex-col items-center justify-between p-24`}>
      <Head>
        <title>SWVA Sports &  Activities</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
        {/*<div className="watermark-container">
          <img
            src="/watermark.png"
            alt="SWVA Watermark"
            className="watermark-image"
          />*/}
          <div style={{ display: "flex", justifyContent: "center", height: "8vh" }}>
            <div>
              <h3 style={{ color: 'white' }}><span>Events By Category: </span>
              <select onChange={handleCategoryChange} value={category}>
                {eventCategoryList.map((eventCategory) => (
                  <option key={eventCategory} value={eventCategory}>
                    {eventCategory}
                  </option>
                ))}
              </select></h3>
            </div>
          </div>
        {/*</div>*/}
        <div id="eventTable" style={{ display: 'none'}}>
          <br></br>
          <br></br>
          <Table id="eventTable" style={{ display: 'none' }}>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Cost</TableCell>
                <TableCell>Additional Information</TableCell>
              </TableRow>
            </TableHead>
            <TableBody></TableBody>
          </Table>
        </div>
        <br></br>
        <br></br>
        <FullCalendar
          selectable={true}
          themeSystem='Standard'
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView='dayGridMonth'
          weekends={true}
          events={filteredEvents}
          eventClick={handleEventClick}
          navLinks={true}
          buttonText={buttonOptions}
          displayEventTime={true} // Ensure event time is displayed
          eventColor={'black'}
          dayMaxEvents={true}
          ref={calendarRef}
          timeZone='local' // Ensure FullCalendar uses UTC
        />
        <Modal
          isOpen={isOpen}
          onRequestClose={closeModal}
          contentLabel="Event Details"
          style={modalStyle}
        >
          <h3>{eventInfo?.title}</h3>
          <p>
            <strong>Start:</strong> {eventInfo?.formattedStartDate}
            {!eventInfo?.allDay && eventInfo?.formattedStartTime && ` ${eventInfo.formattedStartTime}`}

            {eventInfo?.hasEndDate && eventInfo?.formattedEndDate && (
              <>
                <br />
                <strong>End:</strong> {eventInfo.formattedEndDate}
                {!eventInfo?.allDay && eventInfo?.formattedEndTime && ` ${eventInfo.formattedEndTime}`}
              </>
            )}
          </p>
          <p><strong>Category:</strong> {eventInfo?.category}</p>
          <p><strong>Location:</strong> {eventInfo?.location}</p>
          <p><strong>Cost:</strong> {eventInfo?.cost}</p>
          <p><strong>Additional Info:</strong> {eventInfo?.additional_information}</p>
          <button onClick={closeModal}>Close</button>
        </Modal>

      </div>
    </main>
  );
}

/// Event Render Style
const eventRenderStyle = {
  eventTitle: {
    whiteSpace: 'normal', /* Allow line breaks */
    overflow: 'hidden', /* Hide overflowing text */
    textOverflow: 'ellipsis', /* Add ellipsis (...) for long titles */
    maxHeight: '3em', /* Limit the maximum height to three lines */
  }
};

function FormatDate(rawDate) {
  if (!rawDate) return "";

  // Explicitly parse as UTC
  const utcMoment = moment.utc(rawDate);

  log('info', "⏰ Raw UTC Date (Before Conversion):", rawDate);
  log('info', "⏰ Converted Local Date:", utcMoment.local().format());

  return utcMoment.local().format("ddd MM-DD-YY hh:mm a"); // Convert to local for display
}

function renderEventContent(eventInfo) {
  const calendarView = eventInfo.view.type;
  const { title, start, allDay } = eventInfo.event;

  const dotClassNames = {
    dayGridMonth: "fc-daygrid-dot fc-daygrid-dot-month",
    timeGridWeek: "fc-daygrid-dot fc-daygrid-dot-week",
    timeGridDay: "fc-daygrid-dot fc-daygrid-dot-day",
  };
  const dotClassName = dotClassNames[calendarView] || "fc-daygrid-dot";

  const timeStr = !allDay ? moment.utc(start).local().format("h:mm A") + " - " : "";

  return (
    <div style={eventRenderStyle.eventTitle} className="fc-event">
      <div className={dotClassName}></div>
      {timeStr}{title}
    </div>
  );
}

async function getEventData() {
  const events = [];

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sheets`);
    if (!response.ok) throw new Error(response.statusText);

    const result = await response.json();
    let dbevents = result.mappedData;

    if (dbevents) dbevents.shift(); // Remove header row

    dbevents.forEach((item, index) => {
      const rawStart = item.start_date?.trim();
      const rawEnd = item.end_date?.trim();
      const title = item.event_name?.trim();

      if (!rawStart || !title) {
        console.warn(`⛔️ Skipped event at row ${index + 2}: Missing start date or title`, item);
        return;
      }

      const hasTime = rawStart.includes(':');
      const hasEndTime = rawEnd?.includes(':');

      const startMoment = hasTime
        ? moment.tz(rawStart, "M/D/YYYY h:mm A", "America/New_York")
        : moment.tz(rawStart, "M/D/YYYY", "America/New_York");

      if (!startMoment.isValid()) {
        console.warn(`⛔️ Skipped event at row ${index + 2}: Invalid start date`, item);
        return;
      }

      const hasEndDate = !!rawEnd;
      const endMoment = hasEndDate
        ? (hasEndTime
            ? moment.tz(rawEnd, "M/D/YYYY h:mm A", "America/New_York")
            : moment.tz(rawEnd, "M/D/YYYY", "America/New_York"))
        : startMoment;

      events.push({
        title,
        start: startMoment.toISOString(),
        end: endMoment.toISOString(),
        allDay: !hasTime,
        extendedProps: {
          category: item.category,
          location: item.location,
          cost: item.cost,
          additional_information: item.additional_information,
          _hasEndDate: hasEndDate // ✅ Inject the flag for easy access later
        },
      });
    });

    return events;
  } catch (error) {
    console.error("🚨 Error fetching event data:", error);
    return [];
  }
}