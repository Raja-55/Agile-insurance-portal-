import React from 'react';
import { assets } from '../assets/assets';

const IconPreview = () => {
  const categories = [
    {
      name: 'Health Insurance',
      icon: assets.HealthSymbol,
      description: 'Protection + Wellbeing + Recovery'
    },
    {
      name: 'Car Insurance',
      icon: assets.CarSymbol,
      description: 'Mobility + Safety + Confidence'
    },
    {
      name: 'Life Insurance',
      icon: assets.LifeSymbol,
      description: 'Future + Care + Family + Security'
    },
    {
      name: 'Travel Insurance',
      icon: assets.TravelSymbol,
      description: 'Journey + Freedom + Protection'
    },
    {
      name: 'Business Insurance',
      icon: assets.BusinessSymbol,
      description: 'Strength + Enterprise + Stability'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)',
      padding: '60px 40px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{
          color: '#ffffff',
          fontSize: '48px',
          fontWeight: '700',
          marginBottom: '16px',
          letterSpacing: '-1px'
        }}>
          Insurance Icon System
        </h1>
        <p style={{
          color: '#a0a0a0',
          fontSize: '18px',
          marginBottom: '60px',
          maxWidth: '600px'
        }}>
          Custom-designed symbolic icons representing the essence of each insurance category through clean geometric forms.
        </p>

        {categories.map((category, categoryIndex) => (
          <div key={category.name} style={{ marginBottom: '80px' }}>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{
                color: '#ffffff',
                fontSize: '28px',
                fontWeight: '600',
                marginBottom: '8px',
                letterSpacing: '-0.5px'
              }}>
                {category.name}
              </h2>
              <p style={{
                color: '#606060',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: '500'
              }}>
                {category.description}
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '20px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '8px'
                }}>
                  <img
                    src={category.icon}
                    alt={category.name}
                    style={{
                      width: '64px',
                      height: '64px',
                      objectFit: 'contain'
                    }}
                  />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    {category.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div style={{
          marginTop: '100px',
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '16px'
        }}>
          <h3 style={{
            color: '#ffffff',
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '16px'
          }}>
            Design Specifications
          </h3>
          <ul style={{
            color: '#808080',
            fontSize: '14px',
            lineHeight: '2',
            margin: 0,
            paddingLeft: '20px'
          }}>
            <li>2px outline stroke with rounded joins</li>
            <li>24×24 pixel grid system</li>
            <li>Geometric balance and minimal negative space</li>
            <li>Consistent optical weight across all icons</li>
            <li>Premium dark UI optimized at #0f0f0f to #1a1a2e gradient</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IconPreview;
