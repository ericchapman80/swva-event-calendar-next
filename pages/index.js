import React from 'react'
import { useEffect, useState } from 'react';
import { useRef } from 'react';
//import { Combobox } from '@headlessui/react'
import Image from 'next/image'
import Head from 'next/head'
import { Inter } from 'next/font/google'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import Modal from 'react-modal';
import { Calendar } from '@fullcalendar/core'
import ReactDOM from 'react-dom';


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

    // Get the unique categories from the event data
    const categories = [...new Set(eventData.map(event => event.extendedProps.category))];
    categories.sort();
    
    // Set the eventCategoryList state variable
    setEventCategoryList(["All", ...categories]);

    const filteredEvents = events.filter((event) => {
      return category === 'All' || event.extendedProps.category === category;
    });
    setFilteredEvents(filteredEvents);
  };

    fetchEvents();
}, [category]);

useEffect(() => {
  const fetchEvents = async () => {
  const eventData = await getEventData();
  setEvents(eventData);
  setFilteredEvents(eventData);

  };

  //if (eventCategoryList.length === 1 && eventCategoryList[0] === 'All') {
    fetchEvents();
  //} 
}, []);
  
useEffect(() => {
  const calendarApi = calendarRef.current.getApi();
  
  const handleWindowResize = () => {
    const screenWidth = window.innerWidth;
    //const calendarView = screenWidth < 800 ? 'listWeek' : 'dayGridMonth';
    var calendarView = 'dayGridMonth'
    
    if (screenWidth && screenWidth < 800) {
      calendarApi.setOption('headerToolbar', {
        left: 'prev,next today',
        center: 'title',
        end: 'timeGridDay,listWeek',
      });
      calendarView = 'listWeek'
    } else {
      calendarApi.setOption('headerToolbar', {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek,timeGridDay,listWeek',
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

    // Render the event information in a modal or populate a div
    const modal = document.getElementById('eventModal');
    modal.innerHTML = `
      <h3>${title}</h3>
      <p><strong>Start:</strong> ${start} - <strong>End:</strong> ${end} </p>
      <p><strong>Category:</strong> ${event.extendedProps.category}</p>
      <p><strong>Location:</strong> ${event.extendedProps.location}</p>
      <p><strong>Cost:</strong> ${event.extendedProps.cost}</p>
      <p><strong>Additional Info:</strong> ${event.extendedProps.additional_information}</p>
    `;

    // Show the modal or update the display of the div
    modal.style.display = 'block';

    // You can customize the modal closing behavior (e.g., clicking outside the modal)
    // or close it programmatically when needed
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  //Custom style for Header / Title
    const headerTitleStyle = {
      h1:{

        fontFamily: 'Chalkduster, fantasy',
        fontSize: '40px',
        textAlign: 'center',
        marginBottom: '5px', // Adjust the value as needed
      },
      h2:{
        fontFamily: 'DejaVu Sans Mono, monospace',
        fontSize: '20px',
        textAlign: 'center',
        fontWeight: 'normal', // Remove the bold style
        marginTop: '0', // Reset the default margin if necessary
      }
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
          <h1 style={headerTitleStyle.h1}>SWVA</h1>
          <h2 style={headerTitleStyle.h2}>CAMPS & ACTIVITIES</h2>          
         {/*  <select onChange={handleCategoryChange} value={category}>
        {eventCategoryList.map((eventCategory) => (
          <option key={eventCategory} value={eventCategory}>{eventCategory}</option>
        ))}
      </select> */}
      <span>List Events By Category: </span>

      <select onChange={handleCategoryChange} value={category}>
        {eventCategoryList.map((eventCategory) => (
          <option key={eventCategory} value={eventCategory}>
            {eventCategory}
          </option>
        ))}
      </select>
      {/* <div id="eventModal" style={{ display: 'none' }}></div> */}

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
              //dateClick={handleDateClick}
              displayEventTime={false}
              eventColor={'black'}
              //eventDisplay={'list-item'}
              //handleWindowResize={handleWindowResize}
              dayMaxEvents={true}
              //eventContent={renderEventContent}
              ref={calendarRef}
              //headerToolbar - being dynamically set based on screenWidth for more mobile friendly experience
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
      {/* <h2>Events</h2>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Start</th>
              <th>End</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.title}>
                <td>{event.title}</td>
                <td>{event.start}</td>
                <td>{event.end}</td>
              </tr>
            ))}
          </tbody>
        </table> */}
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

// A custom render function - dot is still not working - need to fix that
function renderEventContent(eventInfo) {
  // Determine the current calendar view
  const calendarView = eventInfo.view.type;

  // Set the class name for the dot based on the calendar view
  let dotClassName = "fc-daygrid-dot";
  if (calendarView === "dayGridMonth") {
    dotClassName += " fc-daygrid-dot-month";
  } else if (calendarView === "timeGridWeek") {
    dotClassName += " fc-daygrid-dot-week";
  } else if (calendarView === "timeGridDay") {
    dotClassName += " fc-daygrid-dot-day";
  }

  //Add a hyphen if not in listWeek
  var eventTitleString = eventInfo.event.title;
  if (calendarView !== 'listWeek'){
    eventTitleString = '-' + eventTitleString;
  }

  return (
    <div style={eventRenderStyle.eventTitle} className="fc-event">
      <div className={dotClassName}></div>
      {eventTitleString}
    </div>
  );
};


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
              endDate = startDate;
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