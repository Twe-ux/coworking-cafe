import type { Metadata } from "next";
import AllGoogleMaps from './components/AllGoogleMaps';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const GoogleMaps = () => {
  return <AllGoogleMaps />;
};

export default GoogleMaps;
