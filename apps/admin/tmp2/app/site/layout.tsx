import Image from "next/image";
import type { ReactNode } from "react";

import "@/styles/globals.css";
import styles from "@/styles/layout.module.css";
import { Nav } from "./components/Nav";

interface Props {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <section className={styles.container}>
      <Nav />
      <header className={styles.header}>
        <Image
          src="/logo.svg"
          className={styles.logo}
          alt="logo"
          width={100}
          height={100}
        />
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>footer</footer>
    </section>
  );
}
