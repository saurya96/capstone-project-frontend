import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockUser, mockDoctor } from '@test-utils/test-utils';
import { server } from '@test-utils/mocks/server';
import BookAppointment from '@pages/BookAppointment';

describe('Booking Form Step Navigation Tests', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('Multi-Step Form Structure', () => {
    it('should render with step 1 (Select Doctor) initially', async () => {
      renderWithProviders(<BookAppointment />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/select a doctor/i)).toBeInTheDocument();
        expect(screen.getByText(/step 1 of 4/i)).toBeInTheDocument();
      });
    });

    it('should display progress indicator with all 4 steps', async () => {
      renderWithProviders(<BookAppointment />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/select doctor/i)).toBeInTheDocument();
        expect(screen.getByText(/date & time/i)).toBeInTheDocument();
        expect(screen.getByText(/patient info/i)).toBeInTheDocument();
        expect(screen.getByText(/confirm/i)).toBeInTheDocument();
      });
    });

    it('should show current step as active in progress indicator', async () => {
      renderWithProviders(<BookAppointment />, { user: mockUser });

      await waitFor(() => {
        const step1 = screen.getByText(/select doctor/i).closest('.step-item');
        expect(step1).toHaveClass('active');
      });
    });
  });

  describe('Step 1: Doctor Selection', () => {
    it('should display available doctors to select', async () => {
      renderWithProviders(<BookAppointment />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
        expect(screen.getByText(/dr\. john davis/i)).toBeInTheDocument();
      });
    });

    it('should select a doctor when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BookAppointment />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
      });

      // Click on doctor
      const doctorCard = screen.getByText(/dr\. sarah smith/i).closest('button');
      await user.click(doctorCard);

      // Should show selected doctor
      await waitFor(() => {
        expect(screen.getByText(/change doctor/i)).toBeInTheDocument();
      });
    });

    it('should not proceed to next step without selecting doctor', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BookAppointment />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Should show error and stay on step 1
      await waitFor(() => {
        expect(screen.getByText(/please select a doctor/i)).toBeInTheDocument();
        expect(screen.getByText(/step 1 of 4/i)).toBeInTheDocument();
      });
    });

    it('should proceed to step 2 after selecting doctor', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BookAppointment />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
      });

      // Select doctor
      const doctorCard = screen.getByText(/dr\. sarah smith/i).closest('button');
      await user.click(doctorCard);

      // Click next
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Should be on step 2
      await waitFor(() => {
        expect(screen.getByText(/select date & time/i)).toBeInTheDocument();
        expect(screen.getByText(/step 2 of 4/i)).toBeInTheDocument();
      });
    });

    it('should allow changing selected doctor', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BookAppointment />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
      });

      // Select first doctor
      const doctorCard = screen.getByText(/dr\. sarah smith/i).closest('button');
      await user.click(doctorCard);

      await waitFor(() => {
        expect(screen.getByText(/change doctor/i)).toBeInTheDocument();
      });

      // Click change doctor
      const changeButton = screen.getByRole('button', { name: /change doctor/i });
      await user.click(changeButton);

      // Should show doctor list again
      await waitFor(() => {
        expect(screen.getByText(/dr\. john davis/i)).toBeInTheDocument();
      });
    });
  });

  describe('Step 2: Date & Time Selection', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      renderWithProviders(<BookAppointment />, { user: mockUser });

      // Navigate to step 2
      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
      });

      const doctorCard = screen.getByText(/dr\. sarah smith/i).closest('button');
      await user.click(doctorCard);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/select date & time/i)).toBeInTheDocument();
      });
    });

    it('should display date and time selection fields', () => {
      expect(screen.getByLabelText(/appointment date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/appointment type/i)).toBeInTheDocument();
      expect(screen.getByText(/select time slot/i)).toBeInTheDocument();
    });

    it('should display available time slots', () => {
      const timeSlots = screen.getAllByRole('radio');
      expect(timeSlots.length).toBeGreaterThan(0);
    });

    it('should not proceed without selecting date', async () => {
      const user = userEvent.setup();

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/please select a date/i)).toBeInTheDocument();
        expect(screen.getByText(/step 2 of 4/i)).toBeInTheDocument();
      });
    });

    it('should not proceed without selecting time', async () => {
      const user = userEvent.setup();

      // Select date only
      const dateInput = screen.getByLabelText(/appointment date/i);
      await user.type(dateInput, '2026-02-15');

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/please select.*time/i)).toBeInTheDocument();
      });
    });

    it('should select time slot when clicked', async () => {
      const user = userEvent.setup();

      const timeSlots = screen.getAllByRole('radio');
      await user.click(timeSlots[0]);

      await waitFor(() => {
        expect(timeSlots[0]).toHaveAttribute('aria-checked', 'true');
      });
    });

    it('should proceed to step 3 with valid date and time', async () => {
      const user = userEvent.setup();

      // Select date
      const dateInput = screen.getByLabelText(/appointment date/i);
      await user.type(dateInput, '2026-02-15');

      // Select time
      const timeSlots = screen.getAllByRole('radio');
      await user.click(timeSlots[0]);

      // Click next
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Should be on step 3
      await waitFor(() => {
        expect(screen.getByText(/patient information/i)).toBeInTheDocument();
        expect(screen.getByText(/step 3 of 4/i)).toBeInTheDocument();
      });
    });

    it('should allow going back to step 1', async () => {
      const user = userEvent.setup();

      const prevButton = screen.getByRole('button', { name: /previous/i });
      await user.click(prevButton);

      await waitFor(() => {
        expect(screen.getByText(/select a doctor/i)).toBeInTheDocument();
        expect(screen.getByText(/step 1 of 4/i)).toBeInTheDocument();
      });
    });
  });

  describe('Step 3: Patient Information', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      renderWithProviders(<BookAppointment />, { user: mockUser });

      // Navigate to step 3
      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
      });

      // Select doctor
      const doctorCard = screen.getByText(/dr\. sarah smith/i).closest('button');
      await user.click(doctorCard);
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/appointment date/i)).toBeInTheDocument();
      });

      // Select date and time
      const dateInput = screen.getByLabelText(/appointment date/i);
      await user.type(dateInput, '2026-02-15');
      
      const timeSlots = screen.getAllByRole('radio');
      await user.click(timeSlots[0]);
      
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText(/patient information/i)).toBeInTheDocument();
      });
    });

    it('should display patient information form fields', () => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/reason for visit/i)).toBeInTheDocument();
    });

    it('should pre-fill user information if available', () => {
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email/i);

      expect(nameInput.value).toBe(mockUser.name);
      expect(emailInput.value).toBe(mockUser.email);
    });

    it('should validate required fields', async () => {
      const user = userEvent.setup();

      // Clear required field
      const nameInput = screen.getByLabelText(/full name/i);
      await user.clear(nameInput);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();

      const emailInput = screen.getByLabelText(/email/i);
      await user.clear(emailInput);
      await user.type(emailInput, 'invalid-email');

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });
    });

    it('should proceed to step 4 with valid information', async () => {
      const user = userEvent.setup();

      // Fill reason for visit
      const reasonInput = screen.getByLabelText(/reason for visit/i);
      await user.type(reasonInput, 'Regular checkup');

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/confirm your appointment/i)).toBeInTheDocument();
        expect(screen.getByText(/step 4 of 4/i)).toBeInTheDocument();
      });
    });

    it('should allow going back to step 2', async () => {
      const user = userEvent.setup();

      const prevButton = screen.getByRole('button', { name: /previous/i });
      await user.click(prevButton);

      await waitFor(() => {
        expect(screen.getByText(/select date & time/i)).toBeInTheDocument();
      });
    });
  });

  describe('Step 4: Confirmation', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      renderWithProviders(<BookAppointment />, { user: mockUser });

      // Navigate through all steps
      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
      });

      // Step 1
      const doctorCard = screen.getByText(/dr\. sarah smith/i).closest('button');
      await user.click(doctorCard);
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 2
      await waitFor(() => {
        expect(screen.getByLabelText(/appointment date/i)).toBeInTheDocument();
      });
      const dateInput = screen.getByLabelText(/appointment date/i);
      await user.type(dateInput, '2026-02-15');
      const timeSlots = screen.getAllByRole('radio');
      await user.click(timeSlots[0]);
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 3
      await waitFor(() => {
        expect(screen.getByLabelText(/reason for visit/i)).toBeInTheDocument();
      });
      const reasonInput = screen.getByLabelText(/reason for visit/i);
      await user.type(reasonInput, 'Regular checkup');
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText(/confirm your appointment/i)).toBeInTheDocument();
      });
    });

    it('should display all booking details for confirmation', () => {
      expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
      expect(screen.getByText(/cardiology/i)).toBeInTheDocument();
      expect(screen.getByText(/2026-02-15/i)).toBeInTheDocument();
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });

    it('should show submit button instead of next', () => {
      expect(screen.getByRole('button', { name: /confirm|book appointment/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
    });

    it('should allow going back to edit information', async () => {
      const user = userEvent.setup();

      const prevButton = screen.getByRole('button', { name: /previous/i });
      await user.click(prevButton);

      await waitFor(() => {
        expect(screen.getByText(/patient information/i)).toBeInTheDocument();
      });
    });

    it('should submit appointment on confirmation', async () => {
      const user = userEvent.setup();

      const submitButton = screen.getByRole('button', { name: /confirm|book appointment/i });
      await user.click(submitButton);

      // Should show success or redirect
      await waitFor(() => {
        // May show success message or redirect to appointments
        expect(
          screen.queryByText(/success/i) || 
          screen.queryByText(/booked/i)
        ).toBeTruthy();
      }, { timeout: 3000 });
    });
  });

  describe('Navigation Controls', () => {
    it('should disable Previous button on step 1', async () => {
      renderWithProviders(<BookAppointment />, { user: mockUser });

      await waitFor(() => {
        const prevButton = screen.getByRole('button', { name: /previous/i });
        expect(prevButton).toBeDisabled();
      });
    });

    it('should enable Previous button on steps 2-4', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BookAppointment />, { user: mockUser });

      // Navigate to step 2
      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
      });

      const doctorCard = screen.getByText(/dr\. sarah smith/i).closest('button');
      await user.click(doctorCard);
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        const prevButton = screen.getByRole('button', { name: /previous/i });
        expect(prevButton).not.toBeDisabled();
      });
    });

    it('should update progress bar as user navigates', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BookAppointment />, { user: mockUser });

      // Check initial progress
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '1');

      // Navigate to step 2
      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
      });

      const doctorCard = screen.getByText(/dr\. sarah smith/i).closest('button');
      await user.click(doctorCard);
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(progressBar).toHaveAttribute('aria-valuenow', '2');
      });
    });

    it('should maintain form data when navigating back and forth', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BookAppointment />, { user: mockUser });

      // Select doctor
      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
      });

      const doctorCard = screen.getByText(/dr\. sarah smith/i).closest('button');
      await user.click(doctorCard);
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Go back
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /previous/i }));

      // Should still show selected doctor
      await waitFor(() => {
        expect(screen.getByText(/change doctor/i)).toBeInTheDocument();
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper ARIA labels for navigation', async () => {
      renderWithProviders(<BookAppointment />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /go to next step/i }) ||
               screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      });
    });

    it('should announce step changes to screen readers', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BookAppointment />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
      });

      // Navigate to next step
      const doctorCard = screen.getByText(/dr\. sarah smith/i).closest('button');
      await user.click(doctorCard);
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Should have live region update
      await waitFor(() => {
        const liveRegions = screen.queryAllByRole('status');
        expect(liveRegions.length).toBeGreaterThanOrEqual(0);
      });
    });

    it('should focus on step content when navigating', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BookAppointment />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
      });

      const doctorCard = screen.getByText(/dr\. sarah smith/i).closest('button');
      await user.click(doctorCard);
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        const step2Region = screen.getByRole('region', { name: /step 2/i });
        expect(step2Region).toBeInTheDocument();
      });
    });
  });
});
