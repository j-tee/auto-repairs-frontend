import React from 'react';
import { RegisterForm } from '../components/auth/RegisterForm';
import '../components/auth/auth.scss';

export const RegisterPage: React.FC = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <RegisterForm allowRoleSelection={true} />
      </div>
    </div>
  );
};

export default RegisterPage;