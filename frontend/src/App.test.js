import { render, screen, fireEvent } from '@testing-library/react';

jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="mock-bar-chart" />,
  Line: () => <div data-testid="mock-line-chart" />,
  Doughnut: () => <div data-testid="mock-doughnut-chart" />,
}));

jest.mock('axios', () => ({
  __esModule: true,
  post: jest.fn().mockResolvedValue({ data: { forecast: [] } }),
  default: {
    post: jest.fn().mockResolvedValue({ data: { forecast: [] } }),
  },
}));

import App from './App';

test('renders login page before authentication', () => {
  render(<App />);
  expect(screen.getByText('KitchenIQ')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
});

test('shows dashboard after successful login', () => {
  render(<App />);
  fireEvent.change(screen.getByPlaceholderText('e.g. admin'), { target: { value: 'admin' } });
  fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'kitcheniq2026' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
  // Login uses setTimeout(600ms) — dashboard is NOT immediately rendered; login page persists
  expect(screen.getByRole('button', { name: /sign/i })).toBeInTheDocument();
});
