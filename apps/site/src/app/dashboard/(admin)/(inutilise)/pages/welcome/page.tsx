import DashboardPageTitle from "@/components/dashboard/DashboardPageTitle";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Welcome" };

const WelcomePage = () => {
  return (
    <>
      <DashboardPageTitle title="Welcome" subName="Pages" />
    </>
  );
};

export default WelcomePage;
