import React from 'react'
import { useEffect, useState } from 'react';
import { useRef } from 'react';
import { Combobox } from '@headlessui/react'
import Image from 'next/image'
import Head from 'next/head'
import { Inter } from 'next/font/google'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import ReactModal from 'react-modal';
import { Calendar } from '@fullcalendar/core'

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
  //const calendarEl = calendarRef.current && calendarRef.current.el;

  
  
  /* if (calendarEl && typeof calendarEl.changeView === 'function') {
    const screenWidth = window.innerWidth;
    const calendarView = screenWidth > 768 ? 'dayGridMonth' : 'timeGridWeek';
  
    calendarEl.changeView(calendarView);
  } */
  

  //  const calendar = calendarRef.current;
useEffect(() => {
  const handleWindowResize = () => {
    const calendarEl = calendarRef.current && calendarRef.current.el;
    
    if (calendarEl && typeof calendarEl.changeView === 'function') {
      alert("true");
      if (window.clientWidth < 800) {
        calendarEl.changeView('timeGridDay');
        //calendarEl.eventColor('red');
      } else {
        calendarEl.changeView('dayGridMonth');
        //calendarEl.eventColor('green');
      }
      //calendarRef.current.render(); // Re-render the calendar after updating the width
      calendarRef.current.render(); // Re-render the calendar after updating the width
    }
  };
  window.addEventListener('resize', handleWindowResize);

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

  //const filteredEvents = events.filter(event => event.category === category);

  return (

    <main className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}> 
      <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
          <h1>SWVA Event Calendar</h1>
          
          <select onChange={handleCategoryChange} value={category}>
        {eventCategoryList.map((eventCategory) => (
          <option key={eventCategory} value={eventCategory}>{eventCategory}</option>
        ))}
      </select>

            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView='dayGridMonth'
              weekends={true}
              events={getEventData}
              //eventClick={handleEventClick}
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
                right: 'dayGridMonth,dayGridWeek,timeGridDay'
              }}
              /* eventClick={
                function(arg){
                  alert(arg.event.title)
                  alert(arg.event.start)
                  alert(arg.event.end)
                }
              } */
            />
        </div>
    </main>
  );
}

/* export async function getStaticProps(context) {
  const sheet = await getDataFromSheets();
  return {
    props: {
      data: sheet.slice(0, sheet.length), // remove sheet header
    },
    revalidate: 1, // In seconds
  };  
} */

// a custom render function
function renderEventContent(eventInfo) {
  return (
    <>
      <b>{eventInfo.timeText}</b>
      <i>{eventInfo.event.title}</i>
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
  }
