import { http, HttpResponse } from 'msw';

const API_BASE = 'http://localhost:5000/api';

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = await request.json();
    
    if (body.email === 'demo@healthcare.com' && body.password === 'Demo123!') {
      return HttpResponse.json({
        success: true,
        user: {
          id: '1',
          name: 'Demo User',
          email: 'demo@healthcare.com',
          role: 'patient',
        },
        token: 'mock-jwt-token',
      });
    }
    
    return HttpResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.post(`${API_BASE}/auth/register`, async ({ request }) => {
    const body = await request.json();
    
    return HttpResponse.json({
      success: true,
      user: {
        id: '2',
        name: body.name,
        email: body.email,
        role: 'patient',
      },
      token: 'mock-jwt-token',
    });
  }),

  // Doctors endpoints
  http.get(`${API_BASE}/doctors`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const specialty = url.searchParams.get('specialty') || '';
    const location = url.searchParams.get('location') || '';

    let doctors = [
      {
        id: '1',
        name: 'Dr. Sarah Smith',
        specialty: 'Cardiology',
        hospital: 'City Hospital',
        location: 'New York, NY',
        rating: 4.8,
        experience: 15,
        consultationFee: 150,
        availableToday: true,
      },
      {
        id: '2',
        name: 'Dr. John Davis',
        specialty: 'Orthopedics',
        hospital: 'General Hospital',
        location: 'Los Angeles, CA',
        rating: 4.6,
        experience: 10,
        consultationFee: 120,
        availableToday: false,
      },
      {
        id: '3',
        name: 'Dr. Emily Johnson',
        specialty: 'Pediatrics',
        hospital: 'Children\'s Hospital',
        location: 'New York, NY',
        rating: 4.9,
        experience: 12,
        consultationFee: 100,
        availableToday: true,
      },
    ];

    // Apply filters
    if (search) {
      doctors = doctors.filter(
        d =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.specialty.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (specialty) {
      doctors = doctors.filter(d => d.specialty === specialty);
    }

    if (location) {
      doctors = doctors.filter(d => d.location === location);
    }

    return HttpResponse.json(doctors);
  }),

  http.get(`${API_BASE}/doctors/:id`, ({ params }) => {
    const doctor = {
      id: params.id,
      name: 'Dr. Sarah Smith',
      specialty: 'Cardiology',
      hospital: 'City Hospital',
      location: 'New York, NY',
      rating: 4.8,
      experience: 15,
      consultationFee: 150,
      availableToday: true,
      about: 'Experienced cardiologist specializing in heart disease.',
      education: 'MD from Harvard Medical School',
      languages: ['English', 'Spanish'],
    };

    return HttpResponse.json(doctor);
  }),

  // Appointments endpoints
  http.get(`${API_BASE}/appointments`, () => {
    const appointments = [
      {
        id: '1',
        doctorId: '1',
        doctorName: 'Dr. Sarah Smith',
        specialty: 'Cardiology',
        date: '2026-02-15',
        time: '10:00 AM',
        type: 'in-person',
        status: 'upcoming',
        patientName: 'John Doe',
        reason: 'Regular checkup',
      },
      {
        id: '2',
        doctorId: '2',
        doctorName: 'Dr. John Davis',
        specialty: 'Orthopedics',
        date: '2026-01-20',
        time: '02:00 PM',
        type: 'telemedicine',
        status: 'completed',
        patientName: 'John Doe',
        reason: 'Follow-up',
      },
    ];

    return HttpResponse.json(appointments);
  }),

  http.post(`${API_BASE}/appointments`, async ({ request }) => {
    const body = await request.json();
    
    const newAppointment = {
      id: Date.now().toString(),
      ...body,
      status: 'upcoming',
    };

    return HttpResponse.json(newAppointment, { status: 201 });
  }),

  http.patch(`${API_BASE}/appointments/:id`, async ({ params, request }) => {
    const body = await request.json();
    
    return HttpResponse.json({
      id: params.id,
      ...body,
    });
  }),

  http.delete(`${API_BASE}/appointments/:id`, ({ params }) => {
    return HttpResponse.json({ success: true, id: params.id });
  }),

  // Medical records endpoints
  http.get(`${API_BASE}/medical-records/vitals`, () => {
    return HttpResponse.json([
      {
        date: '2026-01-01',
        bloodPressureSystolic: 120,
        bloodPressureDiastolic: 80,
        heartRate: 72,
        bloodSugar: 95,
        weight: 70,
      },
      {
        date: '2026-01-15',
        bloodPressureSystolic: 118,
        bloodPressureDiastolic: 78,
        heartRate: 70,
        bloodSugar: 92,
        weight: 69.5,
      },
    ]);
  }),

  http.get(`${API_BASE}/medical-records/labs`, () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Complete Blood Count',
        date: '2026-01-10',
        status: 'normal',
      },
    ]);
  }),

  http.get(`${API_BASE}/medical-records/prescriptions`, () => {
    return HttpResponse.json([
      {
        id: '1',
        medication: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        prescribedBy: 'Dr. Sarah Smith',
        date: '2026-01-01',
      },
    ]);
  }),
];
