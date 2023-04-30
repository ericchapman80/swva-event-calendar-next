import { useState } from 'react'
import Image from 'next/image'
import Head from 'next/head'
import { Inter } from 'next/font/google'
//import { getDataFromSheets } from './libs/sheets';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

//import "@fullcalendar/core/main.css";
//import "@fullcalendar/daygrid/main.css";

const inter = Inter({ subsets: ['latin'] })

export default function Home({ data }) {
  return (
    <div>
      <Head>
        <title>SWVA Event Calendar</title>
        <meta
          name="description"
          content="Connecting NextJS with Google Spreadsheets as Database"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {/* <h1>SWVA Event Calendar</h1>
        <p>Example fetched from Google Spreadsheet:</p>
        <ul>
          {data && data.length ? (
            data.map((item) => (
              <li key={item}>
                {item.event_name} - {item.category} - {item.location} - {item.cost} - {item.start_date} - {item.end_date}
              </li>
            ))
          ) : (
            <li>Error: do not forget to setup your env variables 👇</li>
          )}
        </ul> */}
        <div>
          <h1>SWVA Event Calendar</h1>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              //plugins={[timeGridPlugin, interactionPlugin]}
              initialView='dayGridMonth'
              weekends={true}
              events={getEventData}
              displayEventTime={false}
              background-color={'#white'}
              eventColor={'gray'}
              //eventContent={renderEventContent}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek,timeGridDay'
              }}
              eventClick={
                function(arg){
                  alert(arg.event.title)
                  alert(arg.event.start)
                  alert(arg.event.end)
                }
              }
            />
        </div>
      </main>
    </div>
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

  /* function handleEventClick(info) {
    const { event, jsEvent, view } = info;
    console.log('Event clicked:', event);
    console.log('JS event:', jsEvent);
    console.log('View:', view);
  
    // You can do whatever you want with the event here, such as showing a modal
    // or navigating to another page.
     $("#edit_delete").html(
                          '<a href="<?php echo base_url(); ?>timetable/edit_professor_classes/'+event.id+'" style="margin-right: 5px;"><i class="fa fa-edit btn btn-success"></i></a>'+'<a href="<?php echo base_url(); ?>timetable/delete_professor_classes/'+event.id+'"><i class="fa fa-trash btn btn-danger"></i></a>'
                      ),
      $('#modalTitle').html(event.title);
      $('#classes').html(event.classes);
      $('#semester').html(event.semester);
      $('#subject').html(event.subject);
      $('#startdate').html(event.dates);
      $('#timestart').html(event.times);
     $('#fullCalModal').modal('show');
} */