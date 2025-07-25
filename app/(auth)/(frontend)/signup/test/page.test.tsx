import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Signup from '../page';
import { useRouter } from 'next/navigation';

// Mock next/router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock react-hot-toast (optional)
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Toaster: () => <div />,
}));

// Mock AOS to avoid initialization issues during tests
jest.mock('aos', () => ({
  init: jest.fn(),
}));

describe('Signup Page', () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.MockedFunction<typeof useRouter>).mockReturnValue({
      push: pushMock,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });

    // Mock fetch for API calls
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: 'mock-token' }),
      })
    ) as jest.Mock;

    pushMock.mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders the main title and sections', () => {
    render(<Signup />);

    expect(screen.getByText('Create an account')).toBeInTheDocument();
    expect(screen.getByText(/Personal Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Position Details/i)).toBeInTheDocument();
  });

  it('shows validation error on invalid email domain', async () => {
    render(<Signup />);

    await userEvent.type(screen.getByPlaceholderText(/First Name/i), 'John');
    await userEvent.type(screen.getByPlaceholderText(/Last Name/i), 'Doe');
    await userEvent.type(screen.getByPlaceholderText(/Email/i), 'john@gmail.com'); // invalid domain
    await userEvent.type(screen.getByPlaceholderText(/Create Password/i), 'Password1!');
    await userEvent.type(screen.getByPlaceholderText(/Confirm Password/i), 'Password1!');
    await userEvent.type(screen.getByPlaceholderText(/Mobile No/i), '09123456789');

    await userEvent.selectOptions(screen.getByRole('combobox', { name: /Sex/i }), 'Male');
    await userEvent.type(screen.getByPlaceholderText(/Employee ID/i), '12345');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /Department/i }), '1');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /Position/i }), 'Clerk');

    await userEvent.click(screen.getByRole('button', { name: /Create/i }));

    await waitFor(() => {
      expect(screen.getByText(/Email must end with @cvsu.edu.ph/i)).toBeInTheDocument();
    });
  });

  it('submits the form and navigates on valid data', async () => {
    render(<Signup />);

    await userEvent.type(screen.getByPlaceholderText(/First Name/i), 'John');
    await userEvent.type(screen.getByPlaceholderText(/Last Name/i), 'Doe');
    await userEvent.type(screen.getByPlaceholderText(/Email/i), 'john@cvsu.edu.ph');
    await userEvent.type(screen.getByPlaceholderText(/Create Password/i), 'Password1!');
    await userEvent.type(screen.getByPlaceholderText(/Confirm Password/i), 'Password1!');
    await userEvent.type(screen.getByPlaceholderText(/Mobile No/i), '09123456789');

    await userEvent.selectOptions(screen.getByRole('combobox', { name: /Sex/i }), 'Male');
    await userEvent.type(screen.getByPlaceholderText(/Employee ID/i), '12345');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /Department/i }), '1');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /Position/i }), 'Clerk');

    await userEvent.click(screen.getByRole('button', { name: /Create/i }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/signup/OTP');
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/user/signup',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.any(String),
      })
    );
  });
});
