'use client'
import { useEffect, ReactNode } from "react";

interface BootstrapProps {
  children?: ReactNode;
}

const Bootstrap = ({ children }: BootstrapProps) => {
  useEffect(() => {
    // @ts-ignore - bootstrap types not available
    import("bootstrap");
    document.body.scrollTo(0, 0);
  }, []);
  return <>{children}</>;
};

export default Bootstrap;
