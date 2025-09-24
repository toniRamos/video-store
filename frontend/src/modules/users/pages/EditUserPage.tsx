import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User } from '../types/User';
import { userService } from '../services/userService';
import UserForm from '../components/UserForm';

const EditUserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadUser(id);
    }
  }, [id]);

  const loadUser = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await userService.getUserById(userId);
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#999' }}>
        Loading user...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px', 
        fontSize: '18px', 
        color: '#ff4444',
        backgroundColor: '#fff5f5',
        border: '1px solid #ffdddd',
        borderRadius: '8px',
        margin: '20px'
      }}>
        <p>Error: {error}</p>
        <button 
          onClick={() => id && loadUser(id)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#666' }}>
        User not found
      </div>
    );
  }

  return <UserForm user={user} isEditing={true} />;
};

export default EditUserPage;
