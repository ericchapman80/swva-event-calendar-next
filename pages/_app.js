import { useEffect, useState, useMemo } from 'react';
import { initGA, logPageView } from '../analytics';
import { useRouter } from 'next/router';
import CookieConsent from 'react-cookie-consent';
import Cookies from 'universal-cookie';
import Navbar from '../components/Navbar';
import Head from 'next/head';

import '@fullcalendar/common/main.min.css';
import '../styles/calendar.css';
import '../styles/global.css'; // Import global CSS

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [cookieConsentGiven, setCookieConsentGiven] = useState(false);
  const cookies = useMemo(() => new Cookies(), []);

  useEffect(() => {
    if (!window.GA_INITIALIZED) {
      initGA();
      window.GA_INITIALIZED = true;
    }

    const handleRouteChange = (url) => {
      if (cookieConsentGiven && window.gtag) {
        logPageView();
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {  
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [cookieConsentGiven, router.events]); // Add cookieConsentGiven and router.events as dependencies

  useEffect(() => {
    const consent = cookies.get('cookieConsent') === 'true';
    setCookieConsentGiven(consent);
  }, [cookies]);

  const handleCookieConsent = () => {
    cookies.set('cookieConsent', 'true', { path: '/' });
    setCookieConsentGiven(true);
  };

  const handleDenyCookieConsent = () => {
    cookies.set('cookieConsent', 'false', { path: '/' });
    setCookieConsentGiven(false);
  };

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <Component {...pageProps} />
      <CookieConsent
        enableDeclineButton='true'
        flipButtons='true'
        location='bottom'
        buttonText='I Agree'
        declineButtonText='No Thanks'
        cookieName='cookieConsent'
        style={{ background: '#2B373B' }}
        buttonStyle={{ color: '#FFFFFF', fontSize: '13px', background: '#000000' }}
        declineButtonStyle={{ color: '#FFFFFF', fontSize: '13px', background: '#000000' }}
        expires={365}
        onAccept={handleCookieConsent}
        onDecline={handleDenyCookieConsent}
      >
        This website uses cookies to enhance our user experience, site navigation, and to analyze site usage.
      </CookieConsent>
    </>
  );
  //TODO: Add link to Privacy Policy
}