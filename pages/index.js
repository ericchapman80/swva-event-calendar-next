import Image from 'next/image'
import Head from 'next/head';
import { Inter } from 'next/font/google';
import { getDataFromSheets } from './libs/sheets';

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
