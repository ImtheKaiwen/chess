import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
  themeMode: 'light' | 'dark';
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, themeMode }) => {
  const [fading, setFading] = useState(false);
  const logoSrc = themeMode === 'light' ? './kaiwen-logo-dark.png' : './kaiwen-logo-white.png';

  useEffect(() => {
    // Start fade-out at 1000ms, finish at 1300ms
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 950);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 1250);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`splash-overlay ${fading ? 'splash-fading' : ''}`}>
      <div className="splash-content">
        <div className="splash-logo-wrap">
          <img
            src={logoSrc}
            alt="Kaiwen Logo"
            className="splash-logo"
            onError={e => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <h1 className="splash-title">KAIWEN</h1>
        <p className="splash-subtitle">Satranç Platformu</p>
        <div className="splash-spinner-bar">
          <div className="splash-spinner-progress" />
        </div>
      </div>
    </div>
  );
};
