import React from 'react'
import ReactDOM from 'react-dom';
import { useEffect, useState } from 'react';
import { useRef } from 'react';
//import { Combobox } from '@headlessui/react'
import Image from 'next/image'
import Head from 'next/head'
import moment from 'moment';
import { Inter } from 'next/font/google'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import Modal from 'react-modal';
import { Calendar } from '@fullcalendar/core'
import { Table } from "@nextui-org/react";

const inter = Inter({ subsets: ['latin'] })

export default function Home({ data }) {
  const calendarRef =   useRef(null);
  const [screenWidth, setScreenWidth] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [eventInfo, setEventInfo] = useState(null);

  const [events, setEvents] = useState([]);
  const [category, setCategory] = useState("All");
  const [filteredEvents, setFilteredEvents] = useState([]);
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
  }, []);

  useEffect(() => {
    const categories = [...new Set(events.map((event) => event.extendedProps.category))];
    categories.sort();
    setEventCategoryList(["All", ...categories]);

    const filteredEvents = events.filter(
      (event) => category === "All" || event.extendedProps.category === category
    );
    setFilteredEvents(filteredEvents);
    updateEventTable(filteredEvents);
  }, [category, events]);

useEffect(() => {
  const calendarApi = calendarRef.current.getApi();
  
  const handleWindowResize = () => {
    const screenWidth = window.innerWidth;
    //const calendarView = screenWidth < 800 ? 'listWeek' : 'dayGridMonth';
    var calendarView = 'dayGridMonth'
    
    if (screenWidth && screenWidth < 800) {
      calendarApi.setOption('headerToolbar', {
        //left: 'prev,next today',
        //end: 'timeGridDay,listWeek',
        left: '',
        center: 'title,prev,next',
        end: '',
      });
      /* calendarApi.setOption('footerToolbar', {
        left: 'prev',
        center: '',
        //right: 'dayGridMonth,dayGridWeek,timeGridDay,listWeek',
        right: 'next',
      }); */
      calendarView = 'listWeek'
    } else {
      calendarApi.setOption('headerToolbar', {
        left: 'prev,next today',
        center: 'title',
        //right: 'dayGridMonth,dayGridWeek,timeGridDay,listWeek',
        right: 'dayGridMonth,dayGridWeek,listWeek',
      });
      calendarView = 'dayGridMonth'
    }

    if (calendarApi.view.type !== calendarView) {
      calendarApi.changeView(calendarView);
    }
    calendarApi.render(); // Re-render the calendar after updating the width
  };
  
  //Set the invitial view on mount
  handleWindowResize();

  //Attach event listner to window to handle resizing
  window.addEventListener('resize', handleWindowResize);

  //Cleanup Function
  return () => {
    window.removeEventListener('resize', handleWindowResize);
  };
}, []);
  
  //Add the handleWindowResize to the eventlistner
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', useEffect.handleWindowResize);
  }

  const updateEventTable = (categorizedEvents) => {
    // Check if categorizedEvents exists or is an empty array
    if (!categorizedEvents || categorizedEvents.length === 0) {
      //const eventTable = document.getElementById('eventTable');
      //eventTable.innerHTML = '';
      //eventTable.style.display = 'none';
      return;
    }
  
    // Render the event information in a modal or populate a div
    const eventTable = document.getElementById('eventTable');
  
    if (category === "All") {
      //eventTable = document.getElementById('eventTable')
      eventTable.innerHTML = '';
      eventTable.style.display = 'none';
      return; // no need to render innerHTML
    } else {
      eventTable.innerHTML = `
        <h2 align=center>${category} Events</h2>
        <table border=1 width=100%>
          <thead>
            <tr>
              <th>Title</th>
              <th>Start</th>
              <th>End</th>
              <th>Location</th>
              <th>Cost</th>
              <th>Additional Information</th>
            </tr>
          </thead>
          <tbody>
            ${categorizedEvents
              .map(
                (eventItemByCategory) => `
                  <tr key="${eventItemByCategory?.title}">
                    <td>${eventItemByCategory?.title}</td>
                    <td>${moment(eventItemByCategory?.start).format('MM-DD-YYYY HH:mm')}</td>
                    <td>${moment(eventItemByCategory?.end).format('MM-DD-YYYY HH:mm')}</td>
                    <td>${eventItemByCategory.extendedProps?.location}</td>
                    <td>${eventItemByCategory.extendedProps?.cost}</td>
                    <td>${eventItemByCategory.extendedProps?.additional_information}</td>
                  </tr>
                `
              )
              .join('')}
          </tbody>
        </table>
      `;
  
      // Show the modal or update the display of the div
      eventTable.style.display = 'block';
    }
  };

/*   const updateEventTable = (categorizedEvents) => {
    if (!categorizedEvents || categorizedEvents.length === 0) {
      return;
    }
  
    const eventTable = document.getElementById('eventTable');
  
    if (category === "All") {
      eventTable.innerHTML = '';
      eventTable.style.display = 'none';
      return;
    } else {
      const tableRows = categorizedEvents.map((eventItemByCategory) => (
        <TableRow key={eventItemByCategory?.title}>
          <TableCell>{eventItemByCategory?.title}</TableCell>
          <TableCell>{moment(eventItemByCategory?.start).format('MM-DD-YYYY HH:mm')}</TableCell>
          <TableCell>{moment(eventItemByCategory?.end).format('MM-DD-YYYY HH:mm')}</TableCell>
          <TableCell>{eventItemByCategory.extendedProps?.location}</TableCell>
          <TableCell>{eventItemByCategory.extendedProps?.cost}</TableCell>
          <TableCell>{eventItemByCategory.extendedProps?.additional_information}</TableCell>
        </TableRow>
      ));
  
      setTimeout(() => {
        ReactDOM.render(
          <Table striped sticked aria-label="Event table" selectionMode="multiple" css={{ height: "auto", minWidth: "100%" }}>
            <Table.Header>
              <Table.Column>Title</Table.Column>
              <Table.Column>Start</Table.Column>
              <Table.Column>End</Table.Column>
              <Table.Column>Location</Table.Column>
              <Table.Column>Cost</Table.Column>
              <Table.Column>Additional Information</Table.Column>
            </Table.Header>
            <Table.Body>{tableRows}</Table.Body>
          </Table>,
          eventTable
        );
      }, 0);
  
      eventTable.style.display = 'block';
    }
  }; */
    
  const handleEventClick = (info) => {
    const event = info.event;
    // Extract event information
    var { title, start, end, extendedProps } = event;
    // Extract extended properties
    var { category, location, cost, additional_information } = extendedProps;
    
    //check for null for non-string items
    if (start ? start = start.toString() : "");
    if (end ? end = end.toString() : "");
    if (cost ? cost = cost.toString() : "");

    setEventInfo({ title, start, end, category, location, cost, additional_information });
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

  return (

    <main className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}> 
      <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
          <h1>SWVA</h1>
          <h2>CAMPS & ACTIVITIES</h2>
          <div style={{ display: "flex", justifyContent: "center", height: "8vh" }}>
      <div>
        <span>Events By Category: </span>
        <select onChange={handleCategoryChange} value={category}>
          {eventCategoryList.map((eventCategory) => (
            <option key={eventCategory} value={eventCategory}>
              {eventCategory}
            </option>
          ))}
        </select>
      </div>
    </div>
      <div id="eventTable" style={{ display: 'none'}}>
        <br></br>
        <br></br>
      </div>

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
              nextDayThreshold={'00:00:00'}
              //headerToolbar={false}
              //footerToolbar={true}
              //dateClick={handleDateClick}
              displayEventTime={false}
              eventColor={'black'}
              //eventDisplay={'list-item'}
              //handleWindowResize={handleWindowResize}
              dayMaxEvents={true}
              //eventContent={renderEventContent}
              ref={calendarRef}
              //headerToolbar - being dynamically set based on screenWidth for more mobile friendly experience
              //titleFormat={titleFormatHandler} 
            />
            <Modal
              isOpen={isOpen}
              onRequestClose={closeModal}
              contentLabel="Event Details"
              style={modalStyle} // Apply custom styles to the modal
            >
              <h3>{eventInfo?.title}</h3>
              <p>
                <strong>Start:</strong> {eventInfo?.start} - <strong>End:</strong> {eventInfo?.end}
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

/* function titleFormatHandler(eventInfo) {
  const eventTitle = eventInfo.event && eventInfo.event.title;
  const isLongTitle = eventTitle && eventTitle.length > 15;
  alert(eventTitle);

  if (isLongTitle) {
    alert(eventTitle);
    return eventTitle.replace(/\s+/g, '<br>');
  }
  return eventTitle;
}; */

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
  const events = [] 
 
  try {
      const response = await fetch(`./api/sheets`);
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const result = await response.json();

      var dbevents = result.mappedData;
      //remove header row from sheet
      if (dbevents) {
        dbevents.shift();
      }
          //var newItems = [];
          dbevents.forEach(item => {
            var startDate = new Date(item.start_date);
            var endDate;
            if (item.end_date) {
              endDate = new Date(item.end_date);
            } else {
              endDate = startDate //TODO -do I need this + 86400000; // Add 1 day to the end date
            }
            var newItem = {
              title: item.event_name,
              start: startDate,
              end: endDate,
              extendedProps: {
                category: item.category,
                location: item.location,
                cost: item.cost,
                additional_information: item.additional_information
              },
            };
            events.push(newItem);
          });
          return events;

    } catch (error) {
    }
  };