import ReactGA from 'react-ga4';

export const initGA = () => {
  ReactGA.initialize(process.env.NEXT_PUBLIC_MEASUREMENT_ID);
};

export const logPageView = () => {
  ReactGA.set({ page: window.location.pathname });
  //ReactGA.pageview(window.location.pathname);
};