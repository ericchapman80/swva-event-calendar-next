// tests/CalendarPage.test.js
import React from 'react';
import { render } from '@testing-library/react';
import CalendarPage from '../pages/calendar';

// Add these lines to use the mock implementations
jest.mock('@fullcalendar/core');
jest.mock('@fullcalendar/daygrid');

test('renders without crashing', () => {
  render(<CalendarPage />);
});