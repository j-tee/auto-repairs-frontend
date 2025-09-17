import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import '../components/auth/auth.scss';

export const LoginPage: React.FC = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;