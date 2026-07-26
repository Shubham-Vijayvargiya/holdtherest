import React, { useState } from 'react';
import { Heart, ShieldCheck, Play, Users, Clock, Sparkles, Zap } from 'lucide-react';

export function LoginScreen({ onLogin, isCloudConfigured = false }) {
  const [activeDemoTab, setActiveDemoTab] = useState('matrix'); // 'matrix' | 'focus' | 'shared' | 'analytics'
  const [demoFocusTimer, setDemoFocusTimer] = useState(25 * 60);
  const [demoTimerRunning, setDemoTimerRunning] = useState(false);

  // Demo timer effect
  React.useEffect(() => {
    let timer = null;
    if (demoTimerRunning) {
      timer = setInterval(() => {
        setDemoFocusTimer(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [demoTimerRunning]);

  const demoMins = String(Math.floor(demoFocusTimer / 60)).padStart(2, '0');
  const demoSecs = String(demoFocusTimer % 60).padStart(2, '0');

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    await onLogin('shubh@gmail.com');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-main)',
      color: 'var(--text-main)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* --- TOP LANDING NAVBAR --- */}
      <header style={{
        borderBottom: '1px solid var(--border-light)',
        backgroundColor: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'var(--accent-primary-bg)',
              border: '1px solid var(--accent-primary-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)'
            }}>
              <Heart size={20} />
            </div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--text-main)'
            }}>
              MindDump & Focus
            </span>
          </div>

          {/* Right Nav CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => onLogin('shubh@gmail.com')}
              style={{
                fontSize: '13.5px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                padding: '8px 14px'
              }}
            >
              {isCloudConfigured ? 'Sign In' : 'Open Demo'}
            </button>

            <button
              onClick={() => onLogin('shubh@gmail.com')}
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--text-main)',
                color: '#ffffff',
                fontSize: '13.5px',
                fontWeight: 700,
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {isCloudConfigured ? 'Get Started for Free' : 'Try Local Demo'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Landing Area */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px 64px 24px', flex: 1 }}>

        {/* --- HERO SECTION (2-COLUMN) --- */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '48px',
          alignItems: 'center',
          marginBottom: '64px'
        }}>
          {/* Left Column Text & CTAs */}
          <div>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(32px, 4.5vw, 48px)',
              fontWeight: 800,
              color: 'var(--text-main)',
              lineHeight: 1.15,
              marginBottom: '20px',
              letterSpacing: '-0.02em'
            }}>
              Say goodbye to mental clutter, and hello to daily calm
            </h1>

            {/* Clean SVG Bullet List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--accent-primary-bg)',
                  border: '1px solid var(--accent-primary-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-primary)',
                  flexShrink: 0
                }}>
                  <Zap size={18} />
                </div>
                <span style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Dump your monstrous to-do list in seconds without stress
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#eef2ff',
                  border: '1px solid #c7d2fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4f46e5',
                  flexShrink: 0
                }}>
                  <Clock size={18} />
                </div>
                <span style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Finish work on time with Tiimo visual focus timers
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--shared-bg)',
                  border: '1px solid var(--shared-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--shared-color)',
                  flexShrink: 0
                }}>
                  <Users size={18} />
                </div>
                <span style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Selectively share household tasks by typing partner's Gmail ID
                </span>
              </div>
            </div>

            {/* PURE Single Google Login Button */}
            <form onSubmit={handleGoogleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px', marginBottom: '16px' }}>
              <button
                type="submit"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '14px 20px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  fontSize: '15px',
                  fontWeight: 600,
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                {/* Official Google SVG */}
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{isCloudConfigured ? 'Continue with Google' : 'Continue in Local Demo'}</span>
              </button>
            </form>

            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {isCloudConfigured
                ? 'Google identity only • Cloud authentication enabled'
                : 'Local demo data stays in this browser • No cloud account'}
            </p>
          </div>

          {/* Right Column: Serene Image */}
          <div style={{ textAlign: 'center', position: 'relative' }}>
            <div style={{
              position: 'relative',
              display: 'inline-block',
              maxWidth: '460px',
              width: '100%'
            }}>
              <img
                src={`${import.meta.env.BASE_URL}calm_hero.png`}
                alt="Wise Indian monk meditating"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '-14px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-light)',
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                boxShadow: 'var(--shadow-md)',
                fontSize: '12.5px',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <ShieldCheck size={16} style={{ color: 'var(--nice-color)' }} />
                <span>Peace of Mind Guaranteed</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- TRUST & VALUES BAR --- */}
        <div style={{
          backgroundColor: 'var(--bg-subtle)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '64px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
            <ShieldCheck size={18} style={{ color: 'var(--nice-color)' }} />
            <span>Encrypted Data Isolation</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
            <Clock size={18} style={{ color: 'var(--should-color)' }} />
            <span>Built-in Time Tracker</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
            <Users size={18} style={{ color: 'var(--shared-color)' }} />
            <span>Selective Spouse Sharing</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
            <Heart size={18} style={{ color: 'var(--must-color)' }} />
            <span>Zero Streak Pressure</span>
          </div>
        </div>

        {/* --- INTERACTIVE PRODUCT DEMO SHOWCASE --- */}
        <div style={{
          backgroundColor: 'var(--bg-main)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden'
        }}>
          {/* Demo Header Bar */}
          <div style={{
            backgroundColor: 'var(--bg-subtle)',
            borderBottom: '1px solid var(--border-light)',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                backgroundColor: 'var(--accent-primary-bg)',
                padding: '3px 9px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--accent-primary-border)',
                textTransform: 'uppercase'
              }}>
                Interactive Product Demo
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
                See how MindDump & Focus works
              </h2>
            </div>

            {/* Demo Navigation Tabs */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'matrix', label: 'Priority Matrix', icon: Sparkles, color: 'var(--must-color)' },
                { id: 'focus', label: 'Focus Timer', icon: Play, color: 'var(--accent-primary)' },
                { id: 'shared', label: 'Selective Sharing', icon: Users, color: 'var(--shared-color)' },
                { id: 'analytics', label: 'Time Analytics', icon: Clock, color: '#4f46e5' }
              ].map(tab => {
                const IconComponent = tab.icon;
                const isActive = activeDemoTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDemoTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                      backgroundColor: isActive ? 'var(--bg-main)' : 'transparent',
                      border: isActive ? '1px solid var(--border-light)' : '1px solid transparent',
                      boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <IconComponent size={14} style={{ color: tab.color }} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Demo Content Canvas */}
          <div style={{ padding: '32px' }}>
            {/* Tab 1: Priority Matrix Demo */}
            {activeDemoTab === 'matrix' && (
              <div className="animate-fade-in">
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)' }}>
                    Frictionless Brain Dump & 3-Tier Priority Matrix
                  </h3>
                  <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
                    Dump stray thoughts instantly without stress. Sort into Must Do, Should Do, and Nice to Have.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                  <div style={{ backgroundColor: 'var(--must-bg)', border: '1px solid var(--must-border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--must-color)', textTransform: 'uppercase' }}>Must Do</span>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginTop: '8px' }}>Finalize Q3 Budget Strategy</p>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block', marginTop: '8px' }}>⏱️ 25m spent • Private</span>
                  </div>

                  <div style={{ backgroundColor: 'var(--should-bg)', border: '1px solid var(--should-border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--should-color)', textTransform: 'uppercase' }}>Should Do</span>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginTop: '8px' }}>Order Household Groceries</p>
                    <span style={{ fontSize: '11.5px', color: 'var(--shared-color)', fontWeight: 600, display: 'block', marginTop: '8px' }}>Shared with wife@gmail.com</span>
                  </div>

                  <div style={{ backgroundColor: 'var(--nice-bg)', border: '1px solid var(--nice-border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--nice-color)', textTransform: 'uppercase' }}>Nice to Have</span>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginTop: '8px' }}>Read 15 Pages of Calm Book</p>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block', marginTop: '8px' }}>Bonus task • Low stress</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Focus Mode Demo */}
            {activeDemoTab === 'focus' && (
              <div className="animate-fade-in" style={{ textAlign: 'center', padding: '16px 0' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--must-color)', backgroundColor: 'var(--must-bg)', padding: '4px 12px', borderRadius: '999px', border: '1px solid var(--must-border)' }}>
                  Current Focus — Must Do
                </span>

                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 700, color: 'var(--text-main)', margin: '14px 0 20px 0' }}>
                  Finalize Q3 Budget Strategy
                </h3>

                {/* Interactive Demo Ring */}
                <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="80" cy="80" r="66" stroke="var(--bg-subtle)" strokeWidth="10" fill="transparent" />
                    <circle cx="80" cy="80" r="66" stroke="var(--accent-primary)" strokeWidth="10" fill="transparent" strokeDasharray={2 * Math.PI * 66} strokeDashoffset={2 * Math.PI * 66 * 0.3} strokeLinecap="round" />
                  </svg>
                  <div style={{ position: 'absolute', textAlign: 'center', width: '100%' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {demoMins}:{demoSecs}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {demoTimerRunning ? 'RUNNING' : 'PAUSED'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <button
                    onClick={() => setDemoTimerRunning(!demoTimerRunning)}
                    style={{
                      padding: '10px 24px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--accent-primary)',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Play size={16} fill="currentColor" />
                    <span>{demoTimerRunning ? 'Pause Demo Timer' : 'Try Focus Timer'}</span>
                  </button>

                  <button
                    style={{
                      padding: '10px 20px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#f0fdfa',
                      color: '#0f766e',
                      border: '1px solid #99f6e4',
                      fontSize: '13.5px',
                      fontWeight: 600
                    }}
                  >
                    Park Thought (Ctrl+K)
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Selective Sharing Demo */}
            {activeDemoTab === 'shared' && (
              <div className="animate-fade-in">
                <div style={{ backgroundColor: 'var(--shared-bg)', border: '1px solid var(--shared-border)', borderRadius: 'var(--radius-md)', padding: '18px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--shared-color)', fontWeight: 700, fontSize: '15px' }}>
                    <Users size={20} />
                    <span>Shared Household Hub</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Tasks are private by default. Toggle "Shared" and type your partner's Gmail ID to display common items on both of your screens.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--shared-color)', fontWeight: 700 }}>Shared Item</span>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>Order Groceries & Milk</p>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Shared with wife@gmail.com</span>
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--shared-color)', fontWeight: 700 }}>Shared Item</span>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>Book Weekend Hotel Tickets</p>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Shared with wife@gmail.com</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Time Analytics Demo */}
            {activeDemoTab === 'analytics' && (
              <div className="animate-fade-in">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Total Focus Time</span>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: 700, color: 'var(--text-main)' }}>
                      1.8 <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>hrs</span>
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Completed Sessions</span>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: 700, color: 'var(--text-main)' }}>
                      4 <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>sprints</span>
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Time Breakdown by Priority</span>
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <span>Must Do</span>
                        <span>65%</span>
                      </div>
                      <div style={{ height: '8px', borderRadius: '999px', backgroundColor: 'var(--must-color)', width: '65%' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* --- FOOTER --- */}
      <footer style={{
        borderTop: '1px solid var(--border-light)',
        backgroundColor: 'var(--bg-subtle)',
        padding: '24px',
        textAlign: 'center',
        fontSize: '13px',
        color: 'var(--text-muted)'
      }}>
        MindDump & Focus — A serene daily planner and focus tool built for peace of mind.
      </footer>
    </div>
  );
}
