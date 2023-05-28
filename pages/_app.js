import { useEffect } from 'react';
import { initGA, logPageView } from '../analytics';
import { useRouter } from 'next/router';
import { useGA4React } from 'ga-4-react';

//import '../styles/globals.css'
import "@fullcalendar/common/main.min.css";
//import "@fullcalendar/daygrid/main.css";
//import "@fullcalendar/timegrid/main.css";

import '../styles/calendar.css'; // Import the custom CSS file

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const ga4React = useGA4React();

  useEffect(() => {
    if (!window.GA_INITIALIZED) {
      initGA();
      window.GA_INITIALIZED = true;
    }

    const handleRouteChange = (url) => {
      if (ga4React.isInitialized()) {
        ga4React.pageview(url);
      } else {
        logPageView(); // Fallback to the previous GA implementation
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, []); // Run only once on initial render

  return <Component {...pageProps} />;
}
