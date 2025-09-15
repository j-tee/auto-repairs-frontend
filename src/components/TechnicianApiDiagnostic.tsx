import React, { useState } from 'react';
import { technicianMngtService } from '../services/technicianMngtService';
import { appointmentMngtService } from '../services/appointmentMngtService';
import { useAutoRepairs } from '../hooks/useAutoRepairs';

interface ApiTestResult {
  endpoint: string;
  method: string;
  success: boolean;
  status?: number;
  data?: any;
  error?: string;
  timestamp: string;
}

export const TechnicianApiDiagnostic: React.FC = () => {
  const [testResults, setTestResults] = useState<ApiTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testAppointmentId, setTestAppointmentId] = useState<string>('');
  const [testTechnicianId, setTestTechnicianId] = useState<string>('');

  const { appointments, employees } = useAutoRepairs();

  const addResult = (result: ApiTestResult) => {
    setTestResults(prev => [result, ...prev].slice(0, 10)); // Keep last 10 results
  };

  const testEndpoint = async (
    endpoint: string,
    method: string,
    testFunction: () => Promise<any>
  ) => {
    const timestamp = new Date().toLocaleTimeString();
    try {
      const data = await testFunction();
      addResult({
        endpoint,
        method,
        success: true,
        data,
        timestamp
      });
    } catch (error) {
      addResult({
        endpoint,
        method,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp
      });
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    // Test 1: Get Technicians
    await testEndpoint(
      '/shop/employees/?role=technician',
      'GET',
      () => technicianMngtService.getTechnicians()
    );

    // Test 2: Get Workload Overview
    await testEndpoint(
      '/shop/technicians/workload/',
      'GET',
      () => technicianMngtService.getWorkloadOverview()
    );

    // Test 3: Assignment (if IDs provided)
    if (testAppointmentId && testTechnicianId) {
      await testEndpoint(
        `/shop/appointments/${testAppointmentId}/assign-technician/`,
        'POST',
        () => appointmentMngtService.assignTechnician(testAppointmentId, testTechnicianId)
      );

      await testEndpoint(
        `/shop/appointments/${testAppointmentId}/start-work/`,
        'POST',
        () => appointmentMngtService.startWork(testAppointmentId)
      );

      await testEndpoint(
        `/shop/appointments/${testAppointmentId}/complete-work/`,
        'POST',
        () => appointmentMngtService.completeWork(testAppointmentId)
      );
    }

    setIsLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="technician-api-diagnostic" style={{ padding: '20px', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2>🔧 Technician API Diagnostic Tool</h2>
        <p>Use this tool to test technician management API endpoints and identify issues.</p>
      </div>

      <div className="test-controls" style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h3>Test Configuration</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Test Appointment ID:
            </label>
            <select 
              value={testAppointmentId} 
              onChange={(e) => setTestAppointmentId(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="">Select appointment...</option>
              {appointments.map(apt => (
                <option key={apt.id} value={apt.id}>
                  ID: {apt.id} - {apt.customer?.name || 'Unknown'} ({apt.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Test Technician ID:
            </label>
            <select 
              value={testTechnicianId} 
              onChange={(e) => setTestTechnicianId(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="">Select technician...</option>
              {employees.filter(emp => emp.role === 'technician' || emp.position?.toLowerCase().includes('tech')).map(emp => (
                <option key={emp.id} value={emp.id}>
                  ID: {emp.id} - {emp.first_name} {emp.last_name} ({emp.position})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={runAllTests}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? 'Running Tests...' : '🚀 Run All Tests'}
          </button>

          <button 
            onClick={clearResults}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear Results
          </button>
        </div>
      </div>

      <div className="test-results">
        <h3>Test Results ({testResults.length})</h3>
        
        {testResults.length === 0 ? (
          <div style={{ 
            padding: '20px', 
            textAlign: 'center', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            color: '#6c757d'
          }}>
            No tests run yet. Click "Run All Tests" to start diagnostics.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {testResults.map((result, index) => (
              <div 
                key={index}
                style={{
                  border: `2px solid ${result.success ? '#28a745' : '#dc3545'}`,
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: result.success ? '#d4edda' : '#f8d7da'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div>
                    <span style={{ 
                      backgroundColor: result.success ? '#28a745' : '#dc3545',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginRight: '10px'
                    }}>
                      {result.method}
                    </span>
                    <code style={{ backgroundColor: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      {result.endpoint}
                    </code>
                  </div>
                  <small style={{ color: '#666' }}>{result.timestamp}</small>
                </div>

                {result.success ? (
                  <div>
                    <strong style={{ color: '#155724' }}>✅ Success</strong>
                    {result.data && (
                      <details style={{ marginTop: '10px' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>View Response Data</summary>
                        <pre style={{ 
                          backgroundColor: 'rgba(0,0,0,0.1)', 
                          padding: '10px', 
                          borderRadius: '4px', 
                          marginTop: '10px',
                          fontSize: '12px',
                          overflow: 'auto'
                        }}>
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ) : (
                  <div>
                    <strong style={{ color: '#721c24' }}>❌ Failed</strong>
                    <div style={{ 
                      backgroundColor: 'rgba(0,0,0,0.1)', 
                      padding: '10px', 
                      borderRadius: '4px', 
                      marginTop: '10px',
                      fontFamily: 'monospace',
                      fontSize: '14px'
                    }}>
                      {result.error}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
        <h4>🔍 Troubleshooting Guide</h4>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li><strong>404 Errors:</strong> Backend endpoint not implemented - contact backend developer</li>
          <li><strong>400/422 Errors:</strong> Invalid request data or appointment status workflow issue</li>
          <li><strong>401/403 Errors:</strong> Authentication or permission issues</li>
          <li><strong>500 Errors:</strong> Backend server error - check backend logs</li>
          <li><strong>Network Errors:</strong> Connection issues or CORS problems</li>
        </ul>
        
        <h5>Expected Workflow:</h5>
        <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Appointment created with <code>status: 'pending'</code></li>
          <li>Assign technician → <code>status: 'assigned'</code> + <code>assigned_technician_id</code> + <code>assigned_at</code></li>
          <li>Start work → <code>status: 'in_progress'</code> + <code>started_at</code></li>
          <li>Complete work → <code>status: 'completed'</code> + <code>completed_at</code></li>
        </ol>
      </div>
    </div>
  );
};

export default TechnicianApiDiagnostic;