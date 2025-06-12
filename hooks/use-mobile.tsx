import * as React from 'react';

const MOBILE_BREAKPOINT = 1280;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);
  const [isMouseDevice, setIsMouseDevice] = React.useState<boolean>(true);

  // Check screen width
  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  // Check if it's a mouse device
  React.useEffect(() => {
    const hasMouse = window.matchMedia('(pointer: fine)').matches && window.matchMedia('(hover: hover)').matches;
    setIsMouseDevice(hasMouse);
  }, []);

  if (!isMouseDevice) {
    return true; // If the device is not a mouse device, we assume it's mobile
  }

  return !!isMobile; // Nếu có chuột, dựa vào kích thước màn hình để quyết định
}
