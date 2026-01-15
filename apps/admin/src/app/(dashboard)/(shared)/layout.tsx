export default function SharedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Shared routes are accessible to all authenticated users
  // Authentication is already checked in parent (dashboard) layout
  return <>{children}</>;
}
