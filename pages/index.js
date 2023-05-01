import { useState } from 'react'
import Image from 'next/image'
import Head from 'next/head'
import { Inter } from 'next/font/google'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import ReactModal from 'react-modal';

//import "@fullcalendar/core/main.css";
//import "@fullcalendar/daygrid/main.css";

const inter = Inter({ subsets: ['latin'] })

export default function Home({ data }) {
  return (

    <main className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}> 
      <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
          <h1>SWVA Event Calendar</h1>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView='dayGridMonth'
              weekends={true}
              events={getEventData}
              //eventClick={handleEventClick}
              //dateClick={handleDateClick}
              displayEventTime={false}
              background-color={'#white'}
              eventColor={'gray'}
              handleWindowResize={true}
              dayMaxEvents={true}
              //height={'100%'}
              //mobileFriendly={true}
              //responsive={true}
              //eventContent={renderEventContent}
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