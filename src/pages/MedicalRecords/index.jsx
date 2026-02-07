import { useState, useMemo } from 'react';
import { 
  BloodPressureChart, 
  HeartRateChart, 
  BloodSugarChart, 
  WeightChart 
} from '@components/charts/LazyCharts';
import './MedicalRecords.css';

// Sample Medical Records Data
const SAMPLE_VITALS = [
  {
    id: 1,
    date: '2026-02-01',
    bloodPressure: { systolic: 120, diastolic: 80 },
    heartRate: 72,
    bloodSugar: 95,
    temperature: 98.6,
    weight: 165,
    recordedBy: 'Dr. Sarah Johnson'
  },
  {
    id: 2,
    date: '2026-01-25',
    bloodPressure: { systolic: 118, diastolic: 78 },
    heartRate: 68,
    bloodSugar: 92,
    temperature: 98.4,
    weight: 166,
    recordedBy: 'Dr. Sarah Johnson'
  },
  {
    id: 3,
    date: '2026-01-18',
    bloodPressure: { systolic: 122, diastolic: 82 },
    heartRate: 75,
    bloodSugar: 98,
    temperature: 98.7,
    weight: 167,
    recordedBy: 'Dr. Michael Chen'
  },
  {
    id: 4,
    date: '2026-01-10',
    bloodPressure: { systolic: 125, diastolic: 85 },
    heartRate: 78,
    bloodSugar: 102,
    temperature: 98.5,
    weight: 168,
    recordedBy: 'Dr. Sarah Johnson'
  },
  {
    id: 5,
    date: '2026-01-02',
    bloodPressure: { systolic: 119, diastolic: 79 },
    heartRate: 70,
    bloodSugar: 90,
    temperature: 98.6,
    weight: 169,
    recordedBy: 'Dr. Emily Rodriguez'
  }
];

const SAMPLE_LAB_RESULTS = [
  {
    id: 1,
    date: '2026-01-28',
    testName: 'Complete Blood Count (CBC)',
    category: 'Blood Test',
    status: 'completed',
    results: [
      { parameter: 'White Blood Cells', value: '7.5', unit: 'K/uL', range: '4.5-11.0', status: 'normal' },
      { parameter: 'Red Blood Cells', value: '4.8', unit: 'M/uL', range: '4.5-5.9', status: 'normal' },
      { parameter: 'Hemoglobin', value: '14.2', unit: 'g/dL', range: '13.5-17.5', status: 'normal' },
      { parameter: 'Platelets', value: '250', unit: 'K/uL', range: '150-400', status: 'normal' }
    ],
    orderedBy: 'Dr. Sarah Johnson',
    lab: 'City Medical Lab'
  },
  {
    id: 2,
    date: '2026-01-28',
    testName: 'Lipid Panel',
    category: 'Blood Test',
    status: 'completed',
    results: [
      { parameter: 'Total Cholesterol', value: '185', unit: 'mg/dL', range: '<200', status: 'normal' },
      { parameter: 'LDL Cholesterol', value: '110', unit: 'mg/dL', range: '<100', status: 'borderline' },
      { parameter: 'HDL Cholesterol', value: '55', unit: 'mg/dL', range: '>40', status: 'normal' },
      { parameter: 'Triglycerides', value: '100', unit: 'mg/dL', range: '<150', status: 'normal' }
    ],
    orderedBy: 'Dr. Sarah Johnson',
    lab: 'City Medical Lab'
  },
  {
    id: 3,
    date: '2026-01-15',
    testName: 'Thyroid Function Test',
    category: 'Blood Test',
    status: 'completed',
    results: [
      { parameter: 'TSH', value: '2.5', unit: 'mIU/L', range: '0.4-4.0', status: 'normal' },
      { parameter: 'T4 (Free)', value: '1.2', unit: 'ng/dL', range: '0.8-1.8', status: 'normal' },
      { parameter: 'T3 (Free)', value: '3.1', unit: 'pg/mL', range: '2.3-4.2', status: 'normal' }
    ],
    orderedBy: 'Dr. Michael Chen',
    lab: 'Advanced Diagnostics'
  },
  {
    id: 4,
    date: '2026-01-10',
    testName: 'Chest X-Ray',
    category: 'Imaging',
    status: 'completed',
    results: [
      { parameter: 'Finding', value: 'Clear lung fields. Normal heart size. No acute findings.', unit: '', range: '', status: 'normal' }
    ],
    orderedBy: 'Dr. James Wilson',
    lab: 'City Medical Imaging'
  },
  {
    id: 5,
    date: '2025-12-20',
    testName: 'Urinalysis',
    category: 'Lab Test',
    status: 'completed',
    results: [
      { parameter: 'Color', value: 'Yellow', unit: '', range: 'Yellow', status: 'normal' },
      { parameter: 'pH', value: '6.0', unit: '', range: '4.5-8.0', status: 'normal' },
      { parameter: 'Protein', value: 'Negative', unit: '', range: 'Negative', status: 'normal' },
      { parameter: 'Glucose', value: 'Negative', unit: '', range: 'Negative', status: 'normal' }
    ],
    orderedBy: 'Dr. Robert Martinez',
    lab: 'Quick Lab Services'
  }
];

const SAMPLE_PRESCRIPTIONS = [
  {
    id: 1,
    date: '2026-01-28',
    medication: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    duration: '90 days',
    prescribedBy: 'Dr. Sarah Johnson',
    status: 'active',
    purpose: 'Blood pressure management'
  },
  {
    id: 2,
    date: '2026-01-15',
    medication: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    duration: '90 days',
    prescribedBy: 'Dr. Sarah Johnson',
    status: 'active',
    purpose: 'Blood sugar control'
  },
  {
    id: 3,
    date: '2025-12-20',
    medication: 'Amoxicillin',
    dosage: '500mg',
    frequency: 'Three times daily',
    duration: '10 days',
    prescribedBy: 'Dr. Robert Martinez',
    status: 'completed',
    purpose: 'Bacterial infection'
  }
];

function MedicalRecords() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVital, setSelectedVital] = useState('bloodPressure');

  // Prepare chart data for vitals
  const vitalsChartData = useMemo(() => {
    return SAMPLE_VITALS.map(vital => ({
      date: new Date(vital.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      'BP Systolic': vital.bloodPressure.systolic,
      'BP Diastolic': vital.bloodPressure.diastolic,
      'Heart Rate': vital.heartRate,
      'Blood Sugar': vital.bloodSugar,
      'Weight': vital.weight
    })).reverse();
  }, []);

  // Filter lab results by category
  const filteredLabResults = useMemo(() => {
    if (selectedCategory === 'all') return SAMPLE_LAB_RESULTS;
    return SAMPLE_LAB_RESULTS.filter(result => result.category === selectedCategory);
  }, [selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(SAMPLE_LAB_RESULTS.map(result => result.category));
    return ['all', ...Array.from(cats)];
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'status-normal';
      case 'borderline': return 'status-borderline';
      case 'abnormal': return 'status-abnormal';
      default: return '';
    }
  };

  const getLatestVital = () => {
    return SAMPLE_VITALS[0];
  };

  const latestVital = getLatestVital();

  return (
    <div className="records-page">
      <div className="records-header">
        <div>
          <h1>Medical Records</h1>
          <p>View and manage your health records and vitals</p>
        </div>
        <button className="btn-primary">📥 Download All Records</button>
      </div>

      {/* Tabs Navigation */}
      <div className="records-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'vitals' ? 'active' : ''}`}
          onClick={() => setActiveTab('vitals')}
        >
          💓 Vitals
        </button>
        <button
          className={`tab-button ${activeTab === 'labs' ? 'active' : ''}`}
          onClick={() => setActiveTab('labs')}
        >
          🧪 Lab Results
        </button>
        <button
          className={`tab-button ${activeTab === 'prescriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('prescriptions')}
        >
          💊 Prescriptions
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          {/* Latest Vitals Summary */}
          <section className="vitals-summary">
            <h2>Current Vitals</h2>
            <div className="vitals-grid">
              <div className="vital-card">
                <div className="vital-icon">🩺</div>
                <div className="vital-info">
                  <h3>Blood Pressure</h3>
                  <div className="vital-value">
                    {latestVital.bloodPressure.systolic}/{latestVital.bloodPressure.diastolic}
                    <span className="vital-unit">mmHg</span>
                  </div>
                  <span className="vital-status status-normal">Normal</span>
                </div>
              </div>

              <div className="vital-card">
                <div className="vital-icon">❤️</div>
                <div className="vital-info">
                  <h3>Heart Rate</h3>
                  <div className="vital-value">
                    {latestVital.heartRate}
                    <span className="vital-unit">bpm</span>
                  </div>
                  <span className="vital-status status-normal">Normal</span>
                </div>
              </div>

              <div className="vital-card">
                <div className="vital-icon">🩸</div>
                <div className="vital-info">
                  <h3>Blood Sugar</h3>
                  <div className="vital-value">
                    {latestVital.bloodSugar}
                    <span className="vital-unit">mg/dL</span>
                  </div>
                  <span className="vital-status status-normal">Normal</span>
                </div>
              </div>

              <div className="vital-card">
                <div className="vital-icon">⚖️</div>
                <div className="vital-info">
                  <h3>Weight</h3>
                  <div className="vital-value">
                    {latestVital.weight}
                    <span className="vital-unit">lbs</span>
                  </div>
                  <span className="vital-date">
                    Last updated: {new Date(latestVital.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Lab Results */}
          <section className="recent-labs">
            <h2>Recent Lab Results</h2>
            <div className="labs-list">
              {SAMPLE_LAB_RESULTS.slice(0, 3).map(lab => (
                <div key={lab.id} className="lab-item">
                  <div className="lab-item-header">
                    <div>
                      <h3>{lab.testName}</h3>
                      <p className="lab-meta">
                        {new Date(lab.date).toLocaleDateString()} • {lab.orderedBy}
                      </p>
                    </div>
                    <span className="category-badge">{lab.category}</span>
                  </div>
                  <div className="lab-preview">
                    {lab.results.slice(0, 2).map((result, idx) => (
                      <div key={idx} className="result-preview">
                        <span className="result-param">{result.parameter}:</span>
                        <span className={`result-status ${getStatusColor(result.status)}`}>
                          {result.value} {result.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button className="btn-view-full">View Full Results</button>
                </div>
              ))}
            </div>
          </section>

          {/* Active Prescriptions */}
          <section className="active-prescriptions">
            <h2>Active Prescriptions</h2>
            <div className="prescriptions-grid">
              {SAMPLE_PRESCRIPTIONS.filter(p => p.status === 'active').map(prescription => (
                <div key={prescription.id} className="prescription-card">
                  <div className="prescription-header">
                    <h3>{prescription.medication}</h3>
                    <span className="prescription-badge active">Active</span>
                  </div>
                  <div className="prescription-details">
                    <div className="detail-row">
                      <span className="detail-label">Dosage:</span>
                      <span className="detail-value">{prescription.dosage}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Frequency:</span>
                      <span className="detail-value">{prescription.frequency}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Purpose:</span>
                      <span className="detail-value">{prescription.purpose}</span>
                    </div>
                  </div>
                  <div className="prescription-footer">
                    Prescribed by {prescription.prescribedBy}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Vitals Tab */}
      {activeTab === 'vitals' && (
        <div className="tab-content">
          <div className="vitals-section">
            <div className="chart-controls">
              <h2>Vitals Tracking</h2>
              <select 
                value={selectedVital} 
                onChange={(e) => setSelectedVital(e.target.value)}
                className="vital-selector"
              >
                <option value="bloodPressure">Blood Pressure</option>
                <option value="heartRate">Heart Rate</option>
                <option value="bloodSugar">Blood Sugar</option>
                <option value="weight">Weight</option>
              </select>
            </div>

            {/* Chart */}
            <div className="chart-container">
              {selectedVital === 'bloodPressure' ? (
                <BloodPressureChart data={vitalsChartData} />
              ) : selectedVital === 'heartRate' ? (
                <HeartRateChart data={vitalsChartData} />
              ) : selectedVital === 'bloodSugar' ? (
                <BloodSugarChart data={vitalsChartData} />
              ) : (
                <WeightChart data={vitalsChartData} />
              )}
            </div>

            {/* Vitals History Table */}
            <div className="vitals-table">
              <h3>Vitals History</h3>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Blood Pressure</th>
                    <th>Heart Rate</th>
                    <th>Blood Sugar</th>
                    <th>Weight</th>
                    <th>Recorded By</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_VITALS.map(vital => (
                    <tr key={vital.id}>
                      <td>{new Date(vital.date).toLocaleDateString()}</td>
                      <td>{vital.bloodPressure.systolic}/{vital.bloodPressure.diastolic} mmHg</td>
                      <td>{vital.heartRate} bpm</td>
                      <td>{vital.bloodSugar} mg/dL</td>
                      <td>{vital.weight} lbs</td>
                      <td>{vital.recordedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Lab Results Tab */}
      {activeTab === 'labs' && (
        <div className="tab-content">
          <div className="labs-section">
            <div className="labs-header">
              <h2>Laboratory Results</h2>
              <div className="filter-controls">
                <label>Filter by type:</label>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="category-filter"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Tests' : cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="lab-results-list">
              {filteredLabResults.map(lab => (
                <div key={lab.id} className="lab-result-card">
                  <div className="lab-card-header">
                    <div>
                      <h3>{lab.testName}</h3>
                      <p className="lab-info">
                        📅 {new Date(lab.date).toLocaleDateString()} • 
                        🏥 {lab.lab} • 
                        👨‍⚕️ {lab.orderedBy}
                      </p>
                    </div>
                    <span className="category-badge">{lab.category}</span>
                  </div>

                  <div className="lab-results-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Parameter</th>
                          <th>Value</th>
                          <th>Reference Range</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lab.results.map((result, idx) => (
                          <tr key={idx}>
                            <td className="param-name">{result.parameter}</td>
                            <td className="param-value">
                              {result.value} {result.unit}
                            </td>
                            <td className="param-range">{result.range || 'N/A'}</td>
                            <td>
                              <span className={`result-badge ${getStatusColor(result.status)}`}>
                                {result.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="lab-card-footer">
                    <button className="btn-download">📥 Download PDF</button>
                    <button className="btn-share">📤 Share</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Prescriptions Tab */}
      {activeTab === 'prescriptions' && (
        <div className="tab-content">
          <div className="prescriptions-section">
            <h2>All Prescriptions</h2>
            
            <div className="prescriptions-container">
              <div className="prescription-group">
                <h3>Active Prescriptions</h3>
                {SAMPLE_PRESCRIPTIONS.filter(p => p.status === 'active').map(prescription => (
                  <div key={prescription.id} className="prescription-item">
                    <div className="prescription-main">
                      <div className="medication-icon">💊</div>
                      <div className="prescription-info">
                        <h4>{prescription.medication}</h4>
                        <p className="prescription-dosage">{prescription.dosage} - {prescription.frequency}</p>
                        <p className="prescription-purpose">{prescription.purpose}</p>
                      </div>
                      <span className="prescription-badge active">Active</span>
                    </div>
                    <div className="prescription-details-grid">
                      <div className="detail-item">
                        <span className="label">Duration:</span>
                        <span className="value">{prescription.duration}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Prescribed:</span>
                        <span className="value">{new Date(prescription.date).toLocaleDateString()}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Doctor:</span>
                        <span className="value">{prescription.prescribedBy}</span>
                      </div>
                    </div>
                    <div className="prescription-actions">
                      <button className="btn-refill">🔄 Request Refill</button>
                      <button className="btn-details">View Details</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="prescription-group">
                <h3>Past Prescriptions</h3>
                {SAMPLE_PRESCRIPTIONS.filter(p => p.status === 'completed').map(prescription => (
                  <div key={prescription.id} className="prescription-item completed">
                    <div className="prescription-main">
                      <div className="medication-icon inactive">💊</div>
                      <div className="prescription-info">
                        <h4>{prescription.medication}</h4>
                        <p className="prescription-dosage">{prescription.dosage} - {prescription.frequency}</p>
                        <p className="prescription-purpose">{prescription.purpose}</p>
                      </div>
                      <span className="prescription-badge completed">Completed</span>
                    </div>
                    <div className="prescription-details-grid">
                      <div className="detail-item">
                        <span className="label">Duration:</span>
                        <span className="value">{prescription.duration}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Prescribed:</span>
                        <span className="value">{new Date(prescription.date).toLocaleDateString()}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Doctor:</span>
                        <span className="value">{prescription.prescribedBy}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MedicalRecords;
