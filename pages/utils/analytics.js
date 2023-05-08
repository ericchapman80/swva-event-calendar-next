import ReactGA from 'react-ga';

export const initGA = () => {
  ReactGA.initialize('G-GM8GH5GV3C');
};

export const logPageView = () => {
  ReactGA.set({ page: window.location.pathname });
  ReactGA.pageview(window.location.pathname);
};