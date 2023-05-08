import { useEffect } from 'react';
import { initGA, logPageView } from './utils/analytics';
import { useRouter } from 'next/router';


//import '../styles/globals.css'
import "@fullcalendar/common/main.min.css";
//import "@fullcalendar/daygrid/main.css";
//import "@fullcalendar/timegrid/main.css";



export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    if (!window.GA_INITIALIZED) {
      initGA();
      window.GA_INITIALIZED = true;
    }
    logPageView();

    const handleRouteChange = (url) => {
      logPageView();
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, []);


  return <Component {...pageProps} />
}

