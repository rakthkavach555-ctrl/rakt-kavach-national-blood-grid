import { useState, useEffect } from 'react';

// इंटरफेस ताकि TypeScript में कोई टाइप एरर न आए
interface Coordinates {
  latitude: number;
  longitude: number;
}

export const useLiveTracking = () => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [trackingStatus, setTrackingStatus] = useState<'IDLE' | 'ACTIVE' | 'ERROR'>('IDLE');

  useEffect(() => {
    if (!navigator.geolocation) {
      setTrackingStatus('ERROR');
      return;
    }

    // जीपीएस चालू होते ही स्थिति को ACTIVE कर दें
    setTrackingStatus('ACTIVE');

    const handleSuccess = (position: GeolocationPosition) => {
      setCoordinates({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    };

    const handleError = () => {
      setTrackingStatus('ERROR');
    };

    // रीयल-टाइम लोकेशन ट्रैक करने के लिए watchPosition
    const id = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    // अनमाउंट होने पर ट्रैकिंग बंद करने के लिए
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  return { coordinates, trackingStatus };
};
