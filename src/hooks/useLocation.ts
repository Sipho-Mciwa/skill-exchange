import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GeoPoint } from '../types';

interface LocationState {
  location: GeoPoint | null;
  error: string | null;
  loading: boolean;
}

export function useLocation(): LocationState {
  const { user } = useAuth();
  const [state, setState] = useState<LocationState>({
    location: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      // Fall back to profile location immediately
      setState({
        location: user?.location ?? null,
        error: 'Geolocation not supported — using profile location',
        loading: false,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          location: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          error: null,
          loading: false,
        });
      },
      () => {
        // Permission denied or unavailable — fall back to profile location
        setState({
          location: user?.location ?? null,
          error: 'Location permission denied — using profile location',
          loading: false,
        });
      },
      { timeout: 8000, maximumAge: 60_000 }
    );
  }, [user]);

  return state;
}
