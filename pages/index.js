import Image from 'next/image'
import Head from 'next/head';
import { Inter } from 'next/font/google';
import { getDataFromSheets } from './libs/sheets';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'

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
        <h1>SWVA Event Calendar</h1>
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
        </ul>
        <div>
          <h1>Demo App</h1>
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView='dayGridMonth'
              weekends={false}
              events={getEventData()}
              eventContent={renderEventContent}
            />
        </div>
      </main>
    </div>
  );
}

export async function getStaticProps(context) {
  const sheet = await getDataFromSheets();
  return {
    props: {
      data: sheet.slice(0, sheet.length), // remove sheet header
    },
    revalidate: 1, // In seconds
  };
}

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
            //var startDate = Date.parse(item.start_date) / 1000;
            //var endDate;
            //if (item.end_date) {
            //  endDate = Date.parse(item.end_date);
            //} else {
            //  endDate = Date.parse(item.start_date);;
            //}
            var newItem = {
              title: item.event_name,
              start: item.start_date,
              //end: endDate,
              //content: item.additional_information,
              //category: item.category,
             // _id: item.id,
              //_rev: item._rid
            };
            events.push(newItem);
          });
          return events;

    } catch (error) {
    }
  }
