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
    // Check if categorizedEvents exists or is an empty array
    if (!categorizedEvents || categorizedEvents.length === 0) {
      return;
    }
  
    // Render the event information in a modal or populate a div
    const eventTable = document.getElementById('eventTable');
  
    if (category === "All") {
      eventTable.style.display = 'none';
      return; // no need to render innerHTML
    } else {
      const currentDate = new Date();
      // Filter out events that are not in the future
      const tableRows = categorizedEvents
        .filter((eventItemByCategory) => {
          const eventDate = new Date(eventItemByCategory.start);
          return (
            eventItemByCategory.extendedProps?.category === category &&
            eventDate >= currentDate
          );
        })
        .map((eventItemByCategory) => (
          <TableRow key={eventItemByCategory?.title}>
            <TableCell>{eventItemByCategory?.title}</TableCell>
            <TableCell>{moment.utc(eventItemByCategory?.start).local().format('MM-DD-YYYY')}</TableCell>
            <TableCell>{moment.utc(eventItemByCategory?.end).local().format('MM-DD-YYYY')}</TableCell>
            <TableCell>{moment.utc(eventItemByCategory?.start).local().format('h:mm A')}</TableCell>
            <TableCell>{moment.utc(eventItemByCategory?.end).local().format('h:mm A')}</TableCell>
            <TableCell>{eventItemByCategory.extendedProps?.location}</TableCell>
            <TableCell>{eventItemByCategory.extendedProps?.cost}</TableCell>
            <TableCell>{eventItemByCategory.extendedProps?.additional_information}</TableCell>
          </TableRow>
        ));
  
      if (tableRows.length > 0) {
        const root = createRoot(eventTable);
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
              <TableBody>
                {tableRows}
              </TableBody>
            </Table>
          </TableContainer>
        );
  
        eventTable.style.display = 'block';
      } else {
        const root = createRoot(eventTable);
        root.render(
          <div style={{ textAlign: 'center' }}>No scheduled items for the selected category: {category}</div>
        );
        eventTable.style.display = 'block';
      }
    }
  };
     
  const handleEventClick = (info) => {
    log('info', "🔍 Event Clicked (Raw FullCalendar Event):", info.event);
  
    const { title, start, end, extendedProps } = info.event;
  
    if (start) {
      log('info', "📌 Event Raw Start (UTC):", start.toISOString());
    } else {
      log('warn', "⚠️ Event Start is null or undefined");
    }
  
    if (end) {
      log('info', "📌 Event Raw End (UTC):", end.toISOString());
    } else {
      log('warn', "⚠️ Event End is null or undefined");
    }
  
    // Convert only for display in modal (FullCalendar still uses UTC)
    let formattedStartDate = start ? moment.utc(start).local().format("ddd MM-DD-YY hh:mm a") : "N/A";
    let formattedEndDate = end ? moment.utc(end).local().format("ddd MM-DD-YY hh:mm a") : "N/A";
  
    log('info', "✅ Formatted Local Start:", formattedStartDate);
    log('info', "✅ Formatted Local End:", formattedEndDate);
  
    setEventInfo({ 
      title, 
      formattedStartDate, 
      formattedEndDate, 
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
          displayEventTime={false} // Ensure event time is displayed
          eventColor={'black'}
          dayMaxEvents={true}
          ref={calendarRef}
          timeZone='local' // Ensure FullCalendar uses UTC
        />
        <Modal
          isOpen={isOpen}
          onRequestClose={closeModal}
          contentLabel="Event Details"
          style={modalStyle} // Apply custom styles to the modal
        >
          <h3>{eventInfo?.title}</h3>
          <p>
            <strong>Start:</strong> {eventInfo?.formattedStartDate} - <strong>End:</strong> {eventInfo?.formattedEndDate}
          </p>
          <p>
            <strong>Category:</strong> {eventInfo?.category}
          </p>
          <p>
            <strong>Location:</strong> {eventInfo?.location}
          </p>
          <p>
            <strong>Cost:</strong> {eventInfo?.cost}
          </p>
          <p>
            <strong>Additional Info:</strong> {eventInfo?.additional_information}
          </p>
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

// A custom render function
function renderEventContent(eventInfo) {
  // Determine the current calendar view
  const calendarView = eventInfo.view.type;

  // Define the class names for each calendar view
  const dotClassNames = {
    dayGridMonth: "fc-daygrid-dot fc-daygrid-dot-month",
    timeGridWeek: "fc-daygrid-dot fc-daygrid-dot-week",
    timeGridDay: "fc-daygrid-dot fc-daygrid-dot-day",
  };

  // Set the class name for the dot based on the calendar view
  const dotClassName = dotClassNames[calendarView] || "fc-daygrid-dot";

  // Add a hyphen if not in listWeek
  const eventTitleString = calendarView !== 'listWeek' ? '-' + eventInfo.event.title : eventInfo.event.title;

  return (
    <div style={eventRenderStyle.eventTitle} className="fc-event">
      <div className={dotClassName}></div>
      {eventTitleString}
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

    dbevents.forEach((item) => {
      // Parse the Eastern Time input and convert to UTC
      const startDate = moment.tz(item.start_date, "M/D/YYYY h:mm A", "America/New_York").utc();
      const endDate = item.end_date
        ? moment.tz(item.end_date, "M/D/YYYY h:mm A", "America/New_York").utc()
        : startDate;

      events.push({
        title: item.event_name,
        start: startDate.toISOString(), // UTC ISO string
        end: endDate.toISOString(),
        extendedProps: {
          category: item.category,
          location: item.location,
          cost: item.cost,
          additional_information: item.additional_information,
        },
      });
    });

    return events;
  } catch (error) {
    console.error("🚨 Error fetching event data:", error);
    return [];
  }
}
