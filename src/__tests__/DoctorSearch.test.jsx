import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockUser } from '@test-utils/test-utils';
import { server } from '@test-utils/mocks/server';
import { http, HttpResponse } from 'msw';
import Search from '@pages/Search';

describe('Doctor Search and Filter Tests', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('Initial Render', () => {
    it('should render search input and filter controls', async () => {
      renderWithProviders(<Search />, { user: mockUser });

      // Check search input exists
      expect(screen.getByPlaceholderText(/search by doctor name/i)).toBeInTheDocument();

      // Check filter button exists
      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
    });

    it('should load and display doctors on mount', async () => {
      renderWithProviders(<Search />, { user: mockUser });

      // Wait for doctors to load
      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
        expect(screen.getByText(/dr\. john davis/i)).toBeInTheDocument();
        expect(screen.getByText(/dr\. emily johnson/i)).toBeInTheDocument();
      });

      // Check doctor count
      expect(screen.getByText(/3 doctors? found/i)).toBeInTheDocument();
    });

    it('should display doctor details correctly', async () => {
      renderWithProviders(<Search />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
      });

      // Check specialty
      expect(screen.getByText(/cardiology/i)).toBeInTheDocument();

      // Check rating
      expect(screen.getByText(/4\.8/)).toBeInTheDocument();

      // Check consultation fee
      expect(screen.getByText(/\$150/)).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should filter doctors by name when searching', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Search />, { user: mockUser });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/3 doctors? found/i)).toBeInTheDocument();
      });

      // Type in search box
      const searchInput = screen.getByPlaceholderText(/search by doctor name/i);
      await user.type(searchInput, 'Sarah');

      // Should filter results
      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
        expect(screen.queryByText(/dr\. john davis/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/dr\. emily johnson/i)).not.toBeInTheDocument();
      });

      expect(screen.getByText(/1 doctor found/i)).toBeInTheDocument();
    });

    it('should filter doctors by specialty when searching', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Search />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/3 doctors? found/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search by doctor name/i);
      await user.type(searchInput, 'Cardiology');

      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
        expect(screen.getByText(/1 doctor found/i)).toBeInTheDocument();
      });
    });

    it('should clear search when clicking clear button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Search />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/3 doctors? found/i)).toBeInTheDocument();
      });

      // Type in search
      const searchInput = screen.getByPlaceholderText(/search by doctor name/i);
      await user.type(searchInput, 'Sarah');

      await waitFor(() => {
        expect(screen.getByText(/1 doctor found/i)).toBeInTheDocument();
      });

      // Click clear button
      const clearButton = screen.getByRole('button', { name: /clear search/i });
      await user.click(clearButton);

      // Should show all doctors again
      await waitFor(() => {
        expect(screen.getByText(/3 doctors? found/i)).toBeInTheDocument();
        expect(searchInput.value).toBe('');
      });
    });

    it('should show no results message when search yields nothing', async () => {
      const user = userEvent.setup();
      
      // Mock empty results
      server.use(
        http.get('http://localhost:5000/api/doctors', () => {
          return HttpResponse.json([]);
        })
      );

      renderWithProviders(<Search />, { user: mockUser });

      const searchInput = screen.getByPlaceholderText(/search by doctor name/i);
      await user.type(searchInput, 'NonexistentDoctor');

      await waitFor(() => {
        expect(screen.getByText(/0 doctors found/i) || screen.getByText(/no doctors found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Filter Functionality', () => {
    it('should toggle filter panel when clicking filter button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Search />, { user: mockUser });

      const filterButton = screen.getByRole('button', { name: /filters/i });

      // Initially filters might be hidden or visible
      await user.click(filterButton);

      // Filter panel should be visible
      await waitFor(() => {
        expect(screen.getByLabelText(/filter by specialty/i) || 
               screen.getByRole('combobox', { name: /specialty/i })).toBeInTheDocument();
      });
    });

    it('should filter by specialty', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Search />, { user: mockUser });

      // Open filters
      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      // Select specialty
      await waitFor(() => {
        expect(screen.getByLabelText(/filter by specialty/i) || 
               screen.getByRole('combobox', { name: /specialty/i })).toBeInTheDocument();
      });

      const specialtySelect = screen.getByLabelText(/filter by specialty/i) || 
                             screen.getByRole('combobox', { name: /specialty/i });
      
      await user.selectOptions(specialtySelect, 'Cardiology');

      // Should filter to only cardiologists
      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
        expect(screen.getByText(/1 doctor found/i)).toBeInTheDocument();
      });
    });

    it('should filter by location', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Search />, { user: mockUser });

      // Open filters
      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/filter by location/i) || 
               screen.getByRole('combobox', { name: /location/i })).toBeInTheDocument();
      });

      const locationSelect = screen.getByLabelText(/filter by location/i) || 
                            screen.getByRole('combobox', { name: /location/i });
      
      await user.selectOptions(locationSelect, 'New York, NY');

      // Should show only New York doctors
      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
        expect(screen.getByText(/dr\. emily johnson/i)).toBeInTheDocument();
        expect(screen.getByText(/2 doctors found/i)).toBeInTheDocument();
      });
    });

    it('should filter by availability (available today)', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Search />, { user: mockUser });

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/available today/i) || 
               screen.getByRole('checkbox')).toBeInTheDocument();
      });

      const availableCheckbox = screen.getByLabelText(/available today/i) || 
                               screen.getByRole('checkbox');
      
      await user.click(availableCheckbox);

      // Should show only available doctors
      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
        expect(screen.getByText(/dr\. emily johnson/i)).toBeInTheDocument();
        expect(screen.queryByText(/dr\. john davis/i)).not.toBeInTheDocument();
      });
    });

    it('should show filter count badge when filters are active', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Search />, { user: mockUser });

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      // Select a specialty filter
      await waitFor(() => {
        expect(screen.getByLabelText(/filter by specialty/i)).toBeInTheDocument();
      });

      const specialtySelect = screen.getByLabelText(/filter by specialty/i);
      await user.selectOptions(specialtySelect, 'Cardiology');

      // Should show badge with count
      await waitFor(() => {
        expect(screen.getByText(/1.*active filter/i) || 
               screen.getByLabelText(/1 active filter/i)).toBeInTheDocument();
      });
    });

    it('should combine multiple filters', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Search />, { user: mockUser });

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/filter by specialty/i)).toBeInTheDocument();
      });

      // Apply specialty filter
      const specialtySelect = screen.getByLabelText(/filter by specialty/i);
      await user.selectOptions(specialtySelect, 'Cardiology');

      // Apply location filter
      const locationSelect = screen.getByLabelText(/filter by location/i);
      await user.selectOptions(locationSelect, 'New York, NY');

      // Should show only doctors matching both filters
      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
        expect(screen.getByText(/1 doctor found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Sort Functionality', () => {
    it('should have sort options available', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Search />, { user: mockUser });

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/sort/i) || 
               screen.getByRole('combobox', { name: /sort/i })).toBeInTheDocument();
      });

      const sortSelect = screen.getByLabelText(/sort/i) || 
                        screen.getByRole('combobox', { name: /sort/i });
      
      // Check sort options exist
      expect(within(sortSelect).getByText(/highest rated/i)).toBeInTheDocument();
      expect(within(sortSelect).getByText(/most experience/i)).toBeInTheDocument();
      expect(within(sortSelect).getByText(/lowest fee/i)).toBeInTheDocument();
    });
  });

  describe('Doctor Actions', () => {
    it('should have "Book Appointment" button for each doctor', async () => {
      renderWithProviders(<Search />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
      });

      // Should have book buttons
      const bookButtons = screen.getAllByRole('button', { name: /book/i });
      expect(bookButtons.length).toBeGreaterThan(0);
    });

    it('should have "View Profile" link for each doctor', async () => {
      renderWithProviders(<Search />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/dr\. sarah smith/i)).toBeInTheDocument();
      });

      // Should have view profile links
      const viewLinks = screen.getAllByText(/view profile/i);
      expect(viewLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading state while fetching doctors', async () => {
      // Delay the response
      server.use(
        http.get('http://localhost:5000/api/doctors', async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return HttpResponse.json([]);
        })
      );

      renderWithProviders(<Search />, { user: mockUser });

      // Should show loading spinner
      expect(screen.getByTestId('loading-spinner') || 
             screen.getByText(/loading/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });

    it('should show error message when API fails', async () => {
      // Mock API error
      server.use(
        http.get('http://localhost:5000/api/doctors', () => {
          return HttpResponse.json(
            { error: 'Failed to fetch doctors' },
            { status: 500 }
          );
        })
      );

      renderWithProviders(<Search />, { user: mockUser });

      await waitFor(() => {
        expect(screen.getByText(/error/i) || 
               screen.getByText(/failed/i)).toBeInTheDocument();
      });
    });
  });
});
