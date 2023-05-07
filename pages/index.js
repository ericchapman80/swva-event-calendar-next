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

//import "@fullcalendar/core/main.css";
//import "@fullcalendar/daygrid/main.css";

const inter = Inter({ subsets: ['latin'] })

const eventCategoryList = [
  'Soccer',
  'Track',
  'Football',
  'Volleyball',
]


export default function Home({ data }) {
  const calendarRef =   useRef(null);
  const [screenWidth, setScreenWidth] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [eventInfo, setEventInfo] = useState(null);

useEffect(() => {
  const calendarApi = calendarRef.current.getApi();
  
  const handleWindowResize = () => {
    const screenWidth = window.innerWidth;
    const calendarView = screenWidth < 800 ? 'listWeek' : 'dayGridMonth';
    if (calendarApi.view.type !== calendarView) {
      calendarApi.changeView(calendarView);
    }
    //Not sure if this line is still needed
    //calendarApi.render(); // Re-render the calendar after updating the width
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
  
  const [category, setCategory] = useState("All", {
    initialValue: "All",
  });

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    alert(e.target.value);
  };

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

  return (

    <main className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}> 
      <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
          <h1>SWVA Event Calendar</h1>          
          <select onChange={handleCategoryChange} value={category}>
        {eventCategoryList.map((eventCategory) => (
          <option key={eventCategory} value={eventCategory}>{eventCategory}</option>
        ))}
      </select>
      <div id="eventModal" style={{ display: 'none' }}></div>

            <FullCalendar
              editable={true}
              selectable={true}
              themeSystem='Standard'
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
              initialView='dayGridMonth'
              weekends={true}
              events={getEventData}
              eventClick={handleEventClick}
              navLinks={true}
              //dateClick={handleDateClick}
              displayEventTime={false}
              eventColor={'gray'}
              //handleWindowResize={handleWindowResize}
              dayMaxEvents={true}
              //eventContent={renderEventContent}
              ref={calendarRef}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek,timeGridDay,listWeek'
              }}
              /* eventClick={
                function(arg){
                  alert(arg.event.title)
                  alert(arg.event.start)
                  alert(arg.event.end)
                }
              } */
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

// a custom render function
function renderEventContent(eventInfo) {
  return (
    <>
      <b>{eventInfo.timeText}</b>
      <i>{eventInfo.event.title}</i>
      <i>{eventInfo.event.extendedProps.category}</i>
    </>
  )
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