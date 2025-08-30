import React, { useState, useEffect } from 'react';
import { Alert, Button, Card } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { getAuthToken, isTokenExpired, refreshAuthToken } from '../utils/api';

export const AuthStatusDebug: React.FC = () => {
  const { user, isAuthenticated, token } = useAuth();
  const [tokenStatus, setTokenStatus] = useState<{
    hasToken: boolean;
    isExpired: boolean;
    tokenPreview: string;
  } | null>(null);
  const [refreshResult, setRefreshResult] = useState<string | null>(null);

  useEffect(() => {
    const currentToken = getAuthToken();
    if (currentToken) {
      setTokenStatus({
        hasToken: !!currentToken,
        isExpired: isTokenExpired(currentToken),
        tokenPreview: currentToken.substring(0, 50) + '...'
      });
    } else {
      setTokenStatus({
        hasToken: false,
        isExpired: false,
        tokenPreview: 'No token'
      });
    }
  }, [token]);

  const handleRefreshToken = async () => {
    try {
      const newToken = await refreshAuthToken();
      if (newToken) {
        setRefreshResult('✅ Token refreshed successfully');
        // Update token status
        setTokenStatus({
          hasToken: true,
          isExpired: false,
          tokenPreview: newToken.substring(0, 50) + '...'
        });
      } else {
        setRefreshResult('❌ Token refresh failed');
      }
    } catch (error) {
      setRefreshResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleTestApiCall = async () => {
    try {
      const { userMngtService } = await import('../services/userMngtService');
      const users = await userMngtService.getUsers({ page: 1, limit: 5 });
      setRefreshResult(`✅ API call successful: Found ${users.total} users`);
    } catch (error) {
      setRefreshResult(`❌ API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleQuickReauth = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        // Try to get a fresh token by calling the user endpoint
        const { authService } = await import('../services/authService');
        const currentUser = await authService.getCurrentUser();
        setRefreshResult(`✅ Re-authentication successful for ${currentUser.email}`);
      } else {
        setRefreshResult('❌ No stored user data found');
      }
    } catch (error) {
      setRefreshResult(`❌ Re-auth error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Card className="mb-3 border-warning">
      <Card.Header className="bg-warning text-dark">
        <strong>🔍 Authentication Debug Info</strong>
      </Card.Header>
      <Card.Body>
        <div className="row">
          <div className="col-md-6">
            <h6>Redux Auth State:</h6>
            <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
            <p><strong>User:</strong> {user ? `${user.firstName} ${user.lastName} (${user.role})` : 'None'}</p>
            <p><strong>Email:</strong> {user?.email || 'None'}</p>
          </div>
          <div className="col-md-6">
            <h6>Token Status:</h6>
            {tokenStatus && (
              <>
                <p><strong>Has Token:</strong> {tokenStatus.hasToken ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Is Expired:</strong> {tokenStatus.isExpired ? '❌ Yes' : '✅ No'}</p>
                <p><strong>Token Preview:</strong> <code>{tokenStatus.tokenPreview}</code></p>
              </>
            )}
          </div>
        </div>
        
        <div className="mt-3">
          <Button variant="outline-primary" size="sm" onClick={handleRefreshToken} className="me-2">
            🔄 Refresh Token
          </Button>
          <Button variant="outline-secondary" size="sm" onClick={handleTestApiCall} className="me-2">
            🧪 Test User API
          </Button>
          <Button variant="outline-success" size="sm" onClick={handleQuickReauth}>
            🔑 Quick Re-auth
          </Button>
        </div>
        
        {refreshResult && (
          <Alert variant={refreshResult.includes('✅') ? 'success' : 'danger'} className="mt-3 mb-0">
            {refreshResult}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};
