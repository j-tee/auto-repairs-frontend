import React, { useEffect, useState } from 'react';
import { useAutoRepairs } from '../hooks/useAutoRepairs';
import { useAuth } from '../hooks/useAuth';

export const TechnicianDebugComponent: React.FC = () => {
  const { 
    availableTechnicians, 
    employees, 
    loading, 
    error,
    loadAvailableTechnicians,
    loadEmployees
  } = useAutoRepairs();
  const { user, isAuthenticated, token } = useAuth();

  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addLog('🔍 TechnicianDebugComponent mounted');
    addLog(`📱 Authentication status: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
    addLog(`👤 User: ${user ? `${user.email} (${user.role})` : 'No user'}`);
    addLog(`🔑 Token: ${token ? 'Present' : 'Missing'}`);
  }, [isAuthenticated, user, token]);

  const testEmployeesAPI = async () => {
    try {
      addLog('🧪 Testing employees API...');
      await loadEmployees();
      addLog(`📊 Employees loaded: ${employees.length} found`);
      
      const technicians = employees.filter((emp: any) => 
        emp.role === 'technician' || emp.role === 'mechanic' || emp.is_technician
      );
      addLog(`🔧 Technicians found: ${technicians.length}`);
      
      technicians.forEach((tech: any, index: number) => {
        addLog(`  ${index + 1}. ${tech.name || `${tech.first_name} ${tech.last_name}`} (ID: ${tech.id}) - Role: ${tech.role} - Available: ${tech.is_available}`);
      });
    } catch (error) {
      addLog(`❌ Error loading employees: ${error}`);
    }
  };

  const testAvailableTechniciansAPI = async () => {
    try {
      addLog('🧪 Testing available technicians API...');
      await loadAvailableTechnicians();
      addLog(`🔧 Available technicians loaded: ${availableTechnicians.length} found`);
      
      availableTechnicians.forEach((tech: any, index: number) => {
        addLog(`  ${index + 1}. ${tech.name || `${tech.first_name} ${tech.last_name}`} (ID: ${tech.id}) - Position: ${tech.position}`);
      });
    } catch (error) {
      addLog(`❌ Error loading available technicians: ${error}`);
    }
  };

  return (
    <div style={{ padding: '20px', border: '2px solid #ccc', margin: '10px', backgroundColor: '#f9f9f9' }}>
      <h3>🛠️ Technician Loading Debug</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Authentication Status:</h4>
        <p>Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
        <p>User: {user ? `${user.email} (${user.role})` : 'Not logged in'}</p>
        <p>Token: {token ? '✅ Present' : '❌ Missing'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Current Data:</h4>
        <p>Employees: {employees.length}</p>
        <p>Available Technicians: {availableTechnicians.length}</p>
        <p>Loading employees: {loading.employees ? 'Yes' : 'No'}</p>
        <p>Loading available technicians: {loading.availableTechnicians ? 'Yes' : 'No'}</p>
        {error.employees && <p style={{ color: 'red' }}>Employee Error: {error.employees}</p>}
        {error.availableTechnicians && <p style={{ color: 'red' }}>Available Technicians Error: {error.availableTechnicians}</p>}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Test Buttons:</h4>
        <button onClick={testEmployeesAPI} style={{ marginRight: '10px' }}>
          Test Load All Employees
        </button>
        <button onClick={testAvailableTechniciansAPI}>
          Test Load Available Technicians
        </button>
      </div>

      <div>
        <h4>Debug Log:</h4>
        <div style={{ maxHeight: '300px', overflow: 'auto', border: '1px solid #ddd', padding: '10px', backgroundColor: 'white' }}>
          {debugInfo.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
};