import React, { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import "./auth.scss";

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-page">
      <div className="auth-container">
        {isLogin ? (
          <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <RegisterForm
            onSwitchToLogin={() => setIsLogin(true)}
            allowRoleSelection={true}
          />
        )}
      </div>
    </div>
  );
};

export default AuthPage;
