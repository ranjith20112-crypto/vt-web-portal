import React from 'react';
import Header from '../screens/header';
import theme from '../theme/theme';

const GroupsManagement = () => {
  const groups = [
    {
      id: 6,
      initials: 'CR',
      color: '#FF6B6B',
      name: 'CRM',
      description: 'CRM',
      company: 'N/A',
      location: 'N/A',
      users: 0,
    },
    {
      id: 5,
      initials: 'Sa',
      color: '#FF8C42',
      name: 'Sales',
      description: 'S',
      company: 'N/A',
      location: 'N/A',
      users: 1,
    },
    {
      id: 4,
      initials: '2n',
      color: '#4ECDC4',
      name: '2nd-Pre-Sales',
      description: '2PS',
      company: 'N/A',
      location: 'N/A',
      users: 0,
    },
    {
      id: 3,
      initials: 'Pr',
      color: '#45B8AC',
      name: 'Pre-Sales',
      description: 'PS',
      company: 'N/A',
      location: 'N/A',
      users: 0,
    },
    {
      id: 2,
      initials: 'Ad',
      color: '#FF6B9D',
      name: 'Admin',
      description: 'AD',
      company: 'N/A',
      location: 'N/A',
      users: 1,
    },
  ];

  return (
    <div style={{
      fontFamily: theme.fonts.body,
      backgroundColor: '#f8fefd',
      minHeight: '100vh',
      color: 'black'
    }}>
      {/* Imported Header */}
      <Header />

      <div style={{ padding: '24px 32px' }}>
        {/* Main Content Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '32px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                backgroundColor: theme.colors.accent,
                color: '#000',
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '20px',
              }}>
                👥
              </div>
              <div>
                <h1 style={{
                  fontFamily: theme.fonts.display,
                  fontSize: '32px',
                  fontWeight: '700',
                  margin: '0',
                  letterSpacing: '-0.8px',
                  color: 'black',
                }}>
                  Groups Management
                </h1>
                <p style={{
                  color: 'black',
                  margin: '6px 0 0 0',
                  fontSize: '16px',
                }}>
                  Manage user groups and roles
                </p>
              </div>
            </div>
          </div>

          <div style={{
            textAlign: 'right',
            fontSize: '14px',
            color: 'black',
            lineHeight: '1.4',
          }}>
            <div>Logged in as: <span style={{ color: 'black', fontWeight: '500' }}>isacnaveen12</span></div>
            <div>2025-10-16 08:50:02</div>
          </div>
        </div>

        {/* Permissions Bar */}
        <div style={{
          backgroundColor: '#d4fbf4',
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '12px',
          padding: '18px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '28px',
        }}>
          <div style={{
            backgroundColor: '#047561',
            color: 'white',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
          }}>
            🛡️
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', fontSize: '15.5px', color: 'black' }}>Your Permissions</div>
            <div style={{ color: '#000000', fontSize: '14px' }}>View</div>
          </div>
          <button
            style={{
              backgroundColor: theme.colors.accent,
              color: '#000',
              border: 'none',
              padding: '10px 28px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '15px',
              cursor: 'pointer',
              transition: theme.timing.fast,
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = theme.colors.accentHover}
            onMouseOut={(e) => e.target.style.backgroundColor = theme.colors.accent}
          >
            View
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div style={{ position: 'relative', width: '420px' }}>
            <input
              type="text"
              placeholder="Search by name or description..."
              style={{
                width: '100%',
                backgroundColor: '#ffffff',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '10px',
                padding: '14px 20px 14px 52px',
                color: 'black',
                fontSize: '15px',
                outline: 'none',
              }}
            />
            <div style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'black',
              fontSize: '18px',
            }}>
              🔍
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: 'black', fontSize: '14.5px' }}>Show Per Page</span>
            <select style={{
              backgroundColor: '#ffffff',
              border: `1px solid ${theme.colors.border}`,
              color: 'black',
              padding: '11px 20px',
              borderRadius: '8px',
              fontSize: '14.5px',
            }}>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        {/* Groups Table */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          overflow: 'hidden',
          border: `1px solid ${theme.colors.border}`,
          boxShadow: theme.shadows.md,
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '80px 240px 1fr 150px 150px 160px 110px',
            backgroundColor: '#d4fbf4',
            color: 'black',
            fontWeight: '700',
            fontSize: '13.5px',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
          }}>
            <div style={{ padding: '20px 24px' }}>ID</div>
            <div style={{ padding: '20px 24px' }}>GROUP NAME</div>
            <div style={{ padding: '20px 24px' }}>DESCRIPTION</div>
            <div style={{ padding: '20px 24px' }}>COMPANY</div>
            <div style={{ padding: '20px 24px' }}>LOCATION</div>
            <div style={{ padding: '20px 24px' }}>USERS COUNT</div>
            <div style={{ padding: '20px 24px', textAlign: 'center' }}>ACTIONS</div>
          </div>

          {/* Table Body */}
          {groups.map((group, index) => (
            <div
              key={group.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 240px 1fr 150px 150px 160px 110px',
                alignItems: 'center',
                padding: '18px 24px',
                borderTop: index !== 0 ? `1px solid ${theme.colors.border}` : 'none',
                backgroundColor: index % 2 === 0 ? '#ffffff' : '#f2fbfa',
                transition: 'all 0.2s ease',
              }}
            >
              {/* ID */}
              <div style={{ fontSize: '15.5px', fontWeight: '600', color: 'black' }}>
                #{group.id}
              </div>

              {/* Group Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: group.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '17px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}>
                  {group.initials}
                </div>
                <div style={{ fontWeight: '600', fontSize: '16.5px', color: 'black' }}>
                  {group.name}
                </div>
              </div>

              {/* Description */}
              <div style={{ color: 'black', fontSize: '15.5px' }}>
                {group.description}
              </div>

              {/* Company */}
              <div style={{ color: 'black', fontSize: '15px' }}>
                {group.company}
              </div>

              {/* Location */}
              <div style={{ color: 'black', fontSize: '15px' }}>
                {group.location}
              </div>

              {/* Users Count */}
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: theme.colors.accentMuted,
                  color: 'black',
                  padding: '7px 18px',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  fontWeight: '600',
                }}>
                  👥 {group.users} Users
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    border: `1px solid ${theme.colors.borderLight}`,
                    backgroundColor: 'transparent',
                    color: 'black',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: theme.timing.normal,
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = theme.colors.accentMuted;
                    e.target.style.color = 'black';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = 'black';
                  }}
                >
                  👁️
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '28px',
          padding: '0 8px',
        }}>
          <div style={{ color: 'black', fontSize: '14.5px' }}>
            Showing 1 to 5 of 6 results
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{
              padding: '10px 16px',
              backgroundColor: '#ffffff',
              border: `1px solid ${theme.colors.border}`,
              color: 'black',
              borderRadius: '8px',
              cursor: 'pointer',
            }}>
              ←
            </button>
            <button style={{
              padding: '10px 18px',
              backgroundColor: theme.colors.accent,
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
            }}>
              1
            </button>
            <button style={{
              padding: '10px 18px',
              backgroundColor: '#ffffff',
              border: `1px solid ${theme.colors.border}`,
              color: 'black',
              borderRadius: '8px',
              cursor: 'pointer',
            }}>
              2
            </button>
            <button style={{
              padding: '10px 16px',
              backgroundColor: '#ffffff',
              border: `1px solid ${theme.colors.border}`,
              color: 'black',
              borderRadius: '8px',
              cursor: 'pointer',
            }}>
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupsManagement;