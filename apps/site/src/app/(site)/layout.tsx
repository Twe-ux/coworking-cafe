/**
 * Site Layout - apps/site
 * Layout pour les pages publiques du site
 * IMPORTANT: Ne PAS inclure <html> et <body> (déjà dans Root Layout)
 */

import { SiteProvidersWrapper } from '@/components/providers/SiteProvidersWrapper';
import Bootstrap from '@/components/site/Bootstrap';
import Header from '@/components/site/header/header';
import Footer from '@/components/site/footer';
import ScrollToTop from '@/components/site/ScrollToTop';
import ExceptionalClosureBanner from '@/components/site/banner/ExceptionalClosureBanner';
import PathNameLoad from '@/utils/pathNameLoad';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'CoworKing Café by Anticafé',
  description:
    'CoworKing Café by Anticafé à Strasbourg : espace coworking chaleureux avec Wi-Fi rapide, cafés de qualité et ambiance idéale pour travailler.'
};

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <SiteProvidersWrapper>
      <Bootstrap />
      <PathNameLoad />
      <Header />
      <ExceptionalClosureBanner />
      {children}
      <Footer />
      <ScrollToTop />
    </SiteProvidersWrapper>
  );
}
