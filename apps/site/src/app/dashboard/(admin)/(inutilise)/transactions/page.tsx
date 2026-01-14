import DashboardPageTitle from "@/components/dashboard/DashboardPageTitle";
import { Metadata } from "next";
import TransactionData from './components/TransactionData';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const TransactionsPage = () => {
  return (
    <>
      <DashboardPageTitle title="Transactions" subName="Real Estate" />
      <TransactionData />
    </>
  );
};

export default TransactionsPage;
