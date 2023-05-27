import { useEffect } from 'react';
import { initGA, logPageView } from '../analytics';
import { useRouter } from 'next/router';


//import '../styles/globals.css'
import "@fullcalendar/common/main.min.css";
//import "@fullcalendar/daygrid/main.css";
//import "@fullcalendar/timegrid/main.css";

import '../styles/calendar.css'; // Import the custom CSS file

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    if (!window.GA_INITIALIZED) {
      initGA();
      window.GA_INITIALIZED = true;
    }

    const handleRouteChange = (url) => {
      logPageView();
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  useEffect(() => {
    logPageView(); // Initial page view

    return () => {
      // Clean up the event listener
      router.events.off('routeChangeComplete', logPageView);
    };
  }, []); // Run only once on initial render

  return <Component {...pageProps} />;
}
