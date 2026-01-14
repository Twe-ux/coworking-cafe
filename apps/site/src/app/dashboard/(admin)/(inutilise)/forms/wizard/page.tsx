import DashboardPageTitle from "@/components/dashboard/DashboardPageTitle";
import type { Metadata } from "next";
import AllWizard from './components/AllWizard';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const Wizard = () => {
  return (
    <>
      <DashboardPageTitle title="Wizard" subName="Form" />
      <AllWizard />
    </>
  );
};

export default Wizard;
