import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import '@/styles/pages/_dashboard.scss';

export const metadata = {
  title: 'Dashboard | CoworKing Café',
  robots: {
    index: false,
    follow: false
  }
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession();

  // 1. Vérifier session
  if (!session) {
    redirect('/auth/login?callbackUrl=/dashboard');
  }

  // 2. Vérifier rôle client
  if (session.user.role.slug !== 'client') {
    redirect('/');
  }

  return (
    <div className="dashboard">
      <DashboardNav user={session.user} />
      <main className="dashboard__content">
        {children}
      </main>
    </div>
  );
}
