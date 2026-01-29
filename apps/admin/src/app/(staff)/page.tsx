import dynamic from "next/dynamic";

/**
 * Page d'accueil Staff (Server Component)
 * Le composant client est chargé dynamiquement
 */
const StaffHomeClient = dynamic(() => import("./StaffHomeClient").then(mod => ({ default: mod.StaffHomeClient })), {
  ssr: false,
});

export default function StaffHomePage() {
  return <StaffHomeClient />;
}
