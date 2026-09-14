/**
 * useResponsive hook
 * 
 * Detects current device type based on viewport width.
 * Uses matchMedia for efficient, non-polling detection.
 */

import { useState, useEffect, useCallback } from 'react';
import type { DeviceType } from '../types';
import { BREAKPOINTS } from '../types';

interface ResponsiveState {
  deviceType: DeviceType;
  width: number;
  height: number;
  isDesktop: boolean;
  isLaptop: boolean;
  isTablet: boolean;
  isMobile: boolean;
  isTouch: boolean;
  isLandscape: boolean;
}

function getDeviceType(width: number): DeviceType {
  if (width >= BREAKPOINTS.desktop) return 'desktop';
  if (width >= BREAKPOINTS.laptop) return 'laptop';
  if (width >= BREAKPOINTS.tablet) return 'tablet';
  return 'mobile';
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const deviceType = getDeviceType(width);
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    return {
      deviceType,
      width,
      height,
      isDesktop: deviceType === 'desktop',
      isLaptop: deviceType === 'laptop',
      isTablet: deviceType === 'tablet',
      isMobile: deviceType === 'mobile',
      isTouch,
      isLandscape: width > height,
    };
  });

  const handleResize = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const deviceType = getDeviceType(width);
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    setState({
      deviceType,
      width,
      height,
      isDesktop: deviceType === 'desktop',
      isLaptop: deviceType === 'laptop',
      isTablet: deviceType === 'tablet',
      isMobile: deviceType === 'mobile',
      isTouch,
      isLandscape: width > height,
    });
  }, []);

  useEffect(() => {
    // Use ResizeObserver on document for reliable detection
    const observer = new ResizeObserver(() => {
      handleResize();
    });
    observer.observe(document.documentElement);

    // Also listen for orientation change (mobile/tablet)
    window.addEventListener('orientationchange', handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [handleResize]);

  return state;
}
