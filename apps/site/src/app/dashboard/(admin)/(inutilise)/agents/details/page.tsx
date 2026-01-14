import DashboardPageTitle from "@/components/dashboard/DashboardPageTitle";
import { Metadata } from "next";
import AgentDetails from './components/AgentDetails';
import AgentsDetailsBanner from './components/AgentsDetailsBannner';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const AgentsDetailsPage = () => {
  return (
    <>
      <DashboardPageTitle subName="Real Estate" title="Agent Overview" />
      <AgentsDetailsBanner />
      <AgentDetails />
    </>
  );
};

export default AgentsDetailsPage;
