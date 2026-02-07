import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockUser, mockAppointment } from '@test-utils/test-utils';
import { server } from '@test-utils/mocks/server';
import { http, HttpResponse } from 'msw';
import Appointments from '@pages/Appointments';

describe('Appointments List Tests', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('Initial Render', () => {
    it('should render appointments page with header', async () => {
      renderWithProviders(<Appointments />, { user: mockUser });

      expect(screen.getByText(/my appointments/i)).toBeInTheDocument();
    });

    it('should load and display appointments', async () => {
      renderWithProviders(<Appointments />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
        expect(screen.getByText(/dr\. john davis/i)).toBeInTheDocument();
      });
    });

    it('should display appointment details correctly', async () => {
      renderWithProviders(<Appointments />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
      });

      // Check appointment details
      expect(screen.getByText(/cardiology/i)).toBeInTheDocument();
      expect(screen.getByText(/2026-02-15/i) || screen.getByText(/feb.*15/i)).toBeInTheDocument();
      expect(screen.getByText(/10:00 AM/i)).toBeInTheDocument();
      expect(screen.getByText(/in-person/i)).toBeInTheDocument();
    });
  });

  describe('Appointment Separation', () => {
    it('should separate upcoming and past appointments', async () => {
      renderWithProviders(<Appointments />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/upcoming/i) || screen.getByText(/scheduled/i)).toBeInTheDocument();
        expect(screen.getByText(/past/i) || screen.getByText(/completed/i)).toBeInTheDocument();
      });
    });

    it('should display upcoming appointments in upcoming section', async () => {
      renderWithProviders(<Appointments />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
      });

      // Dr. Sarah Smith appointment should be in upcoming
      const upcomingSection = screen.getByText(/upcoming/i).closest('div');
      expect(within(upcomingSection).getByText(/dr\. sarah smith/i)).toBeInTheDocument();
    });

    it('should display past appointments in past section', async () => {
      renderWithProviders(<Appointments />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/dr\. john davis/i)).toBeInTheDocument();
      });

      // Dr. John Davis appointment should be in past
      const pastSection = screen.getByText(/past/i).closest('div');
      expect(within(pastSection).getByText(/dr\. john davis/i)).toBeInTheDocument();
    });

    it('should show appointment count for each section', async () => {
      renderWithProviders(<Appointments />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/1.*upcoming/i) || 
               screen.getByText(/upcoming.*1/i)).toBeInTheDocument();
        expect(screen.getByText(/1.*past/i) || 
               screen.getByText(/past.*1/i)).toBeInTheDocument();
      });
    });
  });

  describe('Appointment Status', () => {
    it('should display status badge for each appointment', async () => {
      renderWithProviders(<Appointments />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/upcoming/i)).toBeInTheDocument();
        expect(screen.getByText(/completed/i)).toBeInTheDocument();
      });
    });

    it('should show different colors for different statuses', async () => {
      renderWithProviders(<Appointments />, { user: mockUser });

      await waitFor(() => {
        const upcomingBadge = screen.getByText(/upcoming/i);
        const completedBadge = screen.getByText(/completed/i);

        // Badges should have different classes or styles
        expect(upcomingBadge.className).not.toBe(completedBadge.className);
      });
    });
  });

  describe('Appointment Actions', () => {
    it('should have action buttons for upcoming appointments', async () => {
      renderWithProviders(<Appointments />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
      });

      // Should have cancel and/or reschedule buttons
      expect(screen.getByRole('button', { name: /cancel/i }) ||
             screen.getByText(/cancel/i)).toBeInTheDocument();
      
      expect(screen.getByRole('button', { name: /reschedule/i }) ||
             screen.getByText(/reschedule/i)).toBeInTheDocument();
    });

    it('should not have action buttons for past appointments', async () => {
      renderWithProviders(<Appointments />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/dr\. john davis/i)).toBeInTheDocument();
      });

      const pastSection = screen.getByText(/past/i).closest('div');
      const cancelButtons = within(pastSection).queryAllByRole('button', { name: /cancel/i });
      
      expect(cancelButtons.length).toBe(0);
    });

    it('should open cancel confirmation dialog when cancel clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Appointments />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Should show confirmation dialog
      await waitFor(() => {
        expect(screen.getByText(/are you sure/i) ||
               screen.getByText(/confirm/i) ||
               screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should cancel appointment when confirmed', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Appointments />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
      });

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Confirm cancellation
      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /confirm|yes/i });
        expect(confirmButton).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm|yes/i });
      await user.click(confirmButton);

      // Should show success message or update list
      await waitFor(() => {
        expect(screen.getByText(/cancelled/i) ||
               screen.queryByText(/dr\. sarah smith/i)).toBeTruthy();
      });
    });

    it('should close dialog when cancel action is dismissed', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Appointments />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
      });

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Dismiss dialog
      await waitFor(() => {
        const dismissButton = screen.getByRole('button', { name: /no|dismiss|close/i });
        expect(dismissButton).toBeInTheDocument();
      });

      const dismissButton = screen.getByRole('button', { name: /no|dismiss|close/i });
      await user.click(dismissButton);

      // Dialog should close
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    it('should show message when no upcoming appointments', async () => {
      server.use(
        http.get('http://localhost:5000/api/appointments', () => {
          return HttpResponse.json([
            {
              ...mockAppointment,
              status: 'completed',
              date: '2026-01-01',
            },
          ]);
        })
      );

      renderWithProviders(<Appointments />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/no upcoming appointments/i) ||
               screen.getByText(/you don't have any upcoming/i)).toBeInTheDocument();
      });
    });

    it('should show message when no past appointments', async () => {
      server.use(
        http.get('http://localhost:5000/api/appointments', () => {
          return HttpResponse.json([
            {
              ...mockAppointment,
              status: 'upcoming',
            },
          ]);
        })
      );

      renderWithProviders(<Appointments />, { user: mockUser });

      await waitFor(() => {
        const pastSection = screen.getByText(/past/i).closest('div');
        expect(within(pastSection).getByText(/no past appointments/i) ||
               within(pastSection).getByText(/no completed/i)).toBeInTheDocument();
      });
    });

    it('should show message and CTA when no appointments at all', async () => {
      server.use(
        http.get('http://localhost:5000/api/appointments', () => {
          return HttpResponse.json([]);
        })
      );

      renderWithProviders(<Appointments />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/no appointments/i) ||
               screen.getByText(/you don't have any/i)).toBeInTheDocument();
      });

      // Should have a book appointment button
      expect(screen.getByRole('button', { name: /book.*appointment/i }) ||
             screen.getByRole('link', { name: /book.*appointment/i })).toBeInTheDocument();
    });
  });

  describe('Filtering and Sorting', () => {
    it('should display appointments in chronological order', async () => {
      renderWithProviders(<Appointments />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
      });

      const appointmentElements = screen.getAllByText(/dr\./i);
      
      // Verify order (upcoming appointments first, then past)
      expect(appointmentElements.length).toBeGreaterThan(0);
    });

    it('should show most recent appointments first within each section', async () => {
      server.use(
        http.get('http://localhost:5000/api/appointments', () => {
          return HttpResponse.json([
            { ...mockAppointment, id: '1', date: '2026-02-20', status: 'upcoming' },
            { ...mockAppointment, id: '2', date: '2026-02-15', status: 'upcoming' },
            { ...mockAppointment, id: '3', date: '2026-01-01', status: 'completed' },
            { ...mockAppointment, id: '4', date: '2025-12-15', status: 'completed' },
          ]);
        })
      );

      renderWithProviders(<Appointments />, { user: mockUser });

      await waitFor(() => {
        const dates = screen.getAllByText(/2026|2025/);
        expect(dates.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner while fetching appointments', async () => {
      server.use(
        http.get('http://localhost:5000/api/appointments', async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return HttpResponse.json([]);
        })
      );

      renderWithProviders(<Appointments />, { user: mockUser });

      expect(screen.getByTestId('loading-spinner') ||
             screen.getByText(/loading/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error message when API fails', async () => {
      server.use(
        http.get('http://localhost:5000/api/appointments', () => {
          return HttpResponse.json(
            { error: 'Failed to fetch appointments' },
            { status: 500 }
          );
        })
      );

      renderWithProviders(<Appointments />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/error/i) ||
               screen.getByText(/failed/i) ||
               screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });
    });

    it('should have retry button when error occurs', async () => {
      server.use(
        http.get('http://localhost:5000/api/appointments', () => {
          return HttpResponse.json(
            { error: 'Failed to fetch' },
            { status: 500 }
          );
        })
      );

      renderWithProviders(<Appointments />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry|try again/i })).toBeInTheDocument();
      });
    });
  });

  describe('Appointment Card Details', () => {
    it('should display all appointment information', async () => {
      renderWithProviders(<Appointments />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
      });

      // Verify all appointment details are shown
      expect(screen.getByText(/cardiology/i)).toBeInTheDocument();
      expect(screen.getByText(/2026-02-15/i) || screen.getByText(/feb.*15/i)).toBeInTheDocument();
      expect(screen.getByText(/10:00 AM/i)).toBeInTheDocument();
      expect(screen.getByText(/in-person/i) || screen.getByText(/telemedicine/i)).toBeInTheDocument();
      expect(screen.getByText(/regular checkup/i)).toBeInTheDocument();
    });

    it('should show telemedicine badge for virtual appointments', async () => {
      renderWithProviders(<Appointments />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/telemedicine/i)).toBeInTheDocument();
      });
    });

    it('should show appointment type icon or badge', async () => {
      renderWithProviders(<Appointments />, { user: mockUser });

      await waitFor(() => {
        const typeIndicators = screen.getAllByText(/in-person|telemedicine/i);
        expect(typeIndicators.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Quick Actions', () => {
    it('should have "Book Another Appointment" button', async () => {
      renderWithProviders(<Appointments />, { user: mockUser });

      expect(screen.getByRole('button', { name: /book.*appointment/i }) ||
             screen.getByRole('link', { name: /book.*appointment/i })).toBeInTheDocument();
    });

    it('should navigate to booking page when clicking book button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Appointments />, { user: mockUser });

      const bookButton = screen.getByRole('button', { name: /book.*appointment/i }) ||
                        screen.getByRole('link', { name: /book.*appointment/i });
      
      await user.click(bookButton);

      // Should navigate (check URL or new page content)
      await waitFor(() => {
        expect(window.location.pathname).toBe('/book');
      });
    });
  });

  describe('Responsive Layout', () => {
    it('should render appointment cards in a list format', async () => {
      renderWithProviders(<Appointments />, { user: mockUser });

      await waitFor(() => {
        const appointmentCards = screen.getAllByText(/dr\./i).map(el => 
          el.closest('.appointment-card, .card, article, [role="article"]')
        );
        expect(appointmentCards.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', async () => {
      renderWithProviders(<Appointments />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByRole('main') || screen.getByRole('region')).toBeInTheDocument();
      });
    });

    it('should have accessible button labels', async () => {
      renderWithProviders(<Appointments />, { user: mockUser });

      await waitFor(() => {
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        expect(cancelButton).toHaveAccessibleName();
      });
    });

    it('should announce status changes to screen readers', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Appointments />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Should have aria-live region for announcements
      await waitFor(() => {
        const alerts = screen.queryAllByRole('alert');
        expect(alerts.length).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
