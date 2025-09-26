import React from 'react';

export const SimpleRentalDashboard: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Rental Dashboard - Debug Version</h1>
      <p>This is a simple version to test if the page loads correctly.</p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginTop: '20px'
      }}>
        <div style={{ 
          background: 'white', 
          border: '1px solid #ccc', 
          borderRadius: '8px', 
          padding: '20px',
          textAlign: 'center'
        }}>
          <h3>Total Rentals</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>0</div>
        </div>
        
        <div style={{ 
          background: 'white', 
          border: '1px solid #ccc', 
          borderRadius: '8px', 
          padding: '20px',
          textAlign: 'center'
        }}>
          <h3>Active Rentals</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>0</div>
        </div>
        
        <div style={{ 
          background: 'white', 
          border: '1px solid #ccc', 
          borderRadius: '8px', 
          padding: '20px',
          textAlign: 'center'
        }}>
          <h3>Overdue Rentals</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc3545' }}>0</div>
        </div>
      </div>
      
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        background: '#f8f9fa', 
        borderRadius: '8px' 
      }}>
        <h2>Actions</h2>
        <button 
          style={{ 
            background: '#007bff', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px',
            borderRadius: '6px',
            marginRight: '10px',
            cursor: 'pointer'
          }}
        >
          + New Rental
        </button>
        <button 
          style={{ 
            background: '#6c757d', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  );
};
