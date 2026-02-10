# SEO TODO - CoworKing Café

> **Dernière mise à jour** : 2026-02-09
> **Status** : 🚧 En cours
> **Objectif** : Optimiser le référencement du site www.coworkingcafe.fr

---

## 📊 Vue d'Ensemble

| Phase | Tâches | Complétées | Statut |
|-------|--------|------------|--------|
| **Google Search Console** | 3 | 2/3 | 🟡 En cours |
| **Metadata & Contenu** | 2 | 0/2 | ⚪ À faire |
| **Performance Technique** | 2 | 0/2 | ⚪ À faire |
| **Off-Page SEO** | 2 | 0/2 | ⚪ À faire |
| **Analytics & Monitoring** | 2 | 0/2 | ⚪ À faire |
| **TOTAL** | **11** | **2/11** | **18%** |

---

## 🔥 PRIORITÉ HAUTE (Cette Semaine)

### ✅ 1. Soumettre Sitemap (FAIT)

**Status** : ✅ Complété le 2026-02-09

**Actions réalisées** :
- Sitemap soumis : `https://www.coworkingcafe.fr/sitemap.xml`
- 21 URLs détectées (15 pages + 6 articles blog)

---

### ✅ 2. Indexer 6 Pages Prioritaires (FAIT)

**Status** : ✅ Complété le 2026-02-09

**URLs indexées** :
- ✅ `https://www.coworkingcafe.fr/`
- ✅ `https://www.coworkingcafe.fr/booking`
- ✅ `https://www.coworkingcafe.fr/pricing`
- ✅ `https://www.coworkingcafe.fr/spaces`
- ✅ `https://www.coworkingcafe.fr/contact`
- ✅ `https://www.coworkingcafe.fr/blog`

---

### ⏳ 3. Indexer les 15 URLs Restantes

**Status** : 🟡 En cours

**Quota Google** : 10 demandes/jour max

#### Jour 2 (à faire demain) - Pages Commerciales

- [ ] `https://www.coworkingcafe.fr/members-program`
- [ ] `https://www.coworkingcafe.fr/student-offers`
- [ ] `https://www.coworkingcafe.fr/concept`
- [ ] `https://www.coworkingcafe.fr/take-away`
- [ ] `https://www.coworkingcafe.fr/boissons`
- [ ] `https://www.coworkingcafe.fr/food`

#### Jour 3 - Pages Légales + Histoire

- [ ] `https://www.coworkingcafe.fr/history`
- [ ] `https://www.coworkingcafe.fr/manifest`
- [ ] `https://www.coworkingcafe.fr/cgu`
- [ ] `https://www.coworkingcafe.fr/confidentiality`
- [ ] `https://www.coworkingcafe.fr/mentions-legales`

#### Jour 4 - Articles Blog

**Récupérer URLs** : https://www.coworkingcafe.fr/sitemap.xml

- [ ] Article 1 : `/blog/[slug-1]`
- [ ] Article 2 : `/blog/[slug-2]`
- [ ] Article 3 : `/blog/[slug-3]`
- [ ] Article 4 : `/blog/[slug-4]`
- [ ] Article 5 : `/blog/[slug-5]`
- [ ] Article 6 : `/blog/[slug-6]`

**Procédure** :
1. Google Search Console → Inspection d'URL
2. Coller URL → Demander l'indexation
3. Répéter pour chaque URL (max 10/jour)

**Résultat attendu** : 21/21 URLs indexées en 3-4 jours

---

### 🔄 4. Configurer Changement d'Adresse Google

**Status** : ⏳ À faire

**Objectif** : Transférer le "jus SEO" de `new.coworkingcafe.fr` vers `www.coworkingcafe.fr`

**Prérequis** :
- [ ] Accès à la propriété `new.coworkingcafe.fr` dans Search Console
- [ ] Accès à la propriété `www.coworkingcafe.fr` dans Search Console

**Étapes** :
1. [ ] Aller sur https://search.google.com/search-console
2. [ ] Sélectionner `new.coworkingcafe.fr`
3. [ ] Menu → **Paramètres** (icône engrenage)
4. [ ] Cliquer sur **Changement d'adresse**
5. [ ] Suivre l'assistant :
   - Ancien site : `new.coworkingcafe.fr`
   - Nouveau site : `www.coworkingcafe.fr`
   - ✅ Redirections 301 actives
   - ✅ Sitemap du nouveau site soumis
6. [ ] Valider le changement

**Note** : Si pas d'accès à `new.coworkingcafe.fr`, cette étape n'est pas bloquante (les 301 redirects suffisent).

**Résultat attendu** : Transfert SEO progressif (2-6 mois)

---

### 📧 5. Activer Alertes Email Search Console

**Status** : ⏳ À faire

**Temps estimé** : 5 minutes

**Étapes** :
1. [ ] Aller sur https://search.google.com/search-console
2. [ ] Sélectionner `www.coworkingcafe.fr`
3. [ ] Menu → **Paramètres** (icône engrenage)
4. [ ] **Utilisateurs et autorisations**
5. [ ] Vérifier email ajouté
6. [ ] Cliquer sur email → **Notifications**
7. [ ] Activer toutes les notifications :
   - [ ] Problèmes critiques de couverture
   - [ ] Erreurs d'exploration
   - [ ] Actions manuelles (pénalités)
   - [ ] Problèmes de sécurité
   - [ ] Problèmes Core Web Vitals
8. [ ] Enregistrer

**Résultat attendu** : Alertes automatiques par email en cas de problème SEO

---

## 📈 PRIORITÉ MOYENNE (2-4 Semaines)

### 📝 6. Ajouter Metadata aux 5 Pages Manquantes

**Status** : ⏳ À faire

**Temps estimé** : 2-3 heures

**Pages concernées** :
- [ ] `/manifest/page.tsx`
- [ ] `/confidentiality/page.tsx`
- [ ] `/cgu/page.tsx`
- [ ] `/mentions-legales/page.tsx`
- [ ] `/scan/page.tsx`

**Pour chaque page, ajouter** :

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '[Titre] | CoworKing Café Strasbourg',
  description: '[Description 150-160 caractères avec mots-clés]',
  keywords: [
    'anticafé strasbourg',
    'coworking strasbourg',
    // ... mots-clés pertinents
  ],
  openGraph: {
    title: '[Titre]',
    description: '[Description]',
    url: 'https://www.coworkingcafe.fr/[page]',
    siteName: 'CoworKing Café Strasbourg',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '[Titre]',
    description: '[Description]',
  },
  alternates: {
    canonical: 'https://www.coworkingcafe.fr/[page]',
  },
};
```

**Commit après** : `feat(seo): add metadata to legal and info pages`

**Résultat attendu** : Toutes les pages avec metadata complète

---

### 🏢 7. Créer et Optimiser Google My Business

**Status** : ⏳ À faire

**Temps estimé** : 1-2 heures (config initiale) + 30 min/mois (maintenance)

**Étapes de configuration** :

#### A. Créer/Revendiquer la Fiche
1. [ ] Aller sur https://business.google.com/
2. [ ] Rechercher : "CoworKing Café Strasbourg"
3. [ ] Revendiquer si existe, sinon créer nouvelle fiche

#### B. Informations Complètes
- [ ] **Nom** : CoworKing Café by Anticafé
- [ ] **Catégorie principale** : Espace de coworking
- [ ] **Catégories secondaires** : Café, Espace de travail partagé
- [ ] **Adresse** : 1 rue de la Division Leclerc, 67000 Strasbourg
- [ ] **Téléphone** : 09 87 33 45 19
- [ ] **Site web** : https://www.coworkingcafe.fr
- [ ] **Horaires** : L-V 09h-20h, S-D 10h-20h
- [ ] **Description** : (250 mots max avec mots-clés)

#### C. Photos (min 10)
- [ ] Logo
- [ ] Façade extérieure
- [ ] Espaces de travail (open space)
- [ ] Salle de réunion
- [ ] Bar/espace boissons
- [ ] Clients au travail
- [ ] Équipe
- [ ] Détails déco/mobilier

#### D. Maintenance Mensuelle
- [ ] Publier 1-2 posts/mois (événements, promo, nouveautés)
- [ ] Répondre à TOUS les avis (positifs et négatifs)
- [ ] Demander avis aux clients satisfaits

**Résultat attendu** :
- Position 1-3 sur "coworking strasbourg" dans Google Maps
- +50-100 clics/mois via GMB
- Apparition dans recherches locales

---

### 📊 8. Configurer Google Analytics 4 et Tag Manager

**Status** : ⏳ À faire

**Temps estimé** : 2-3 heures

#### Phase 1 : Google Analytics 4

1. [ ] Aller sur https://analytics.google.com/
2. [ ] Créer propriété : "CoworKing Café - Site Public"
3. [ ] Copier Measurement ID : `G-XXXXXXXXXX`
4. [ ] Intégrer dans Next.js :

```typescript
// apps/site/src/app/layout.tsx
import Script from 'next/script';

// Dans le <body>
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
  `}
</Script>
```

5. [ ] Ajouter dans `.env.local` :
```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

6. [ ] Commit : `feat(analytics): add Google Analytics 4`

#### Phase 2 : Google Tag Manager (optionnel)

1. [ ] Aller sur https://tagmanager.google.com/
2. [ ] Créer conteneur : "coworkingcafe.fr"
3. [ ] Copier GTM ID : `GTM-XXXXXX`
4. [ ] Intégrer dans Next.js

#### Événements à Tracker

- [ ] Clic bouton "Réserver"
- [ ] Soumission formulaire contact
- [ ] Consultation tarifs
- [ ] Consultation espaces
- [ ] Lecture article blog (> 30s)
- [ ] Conversion réservation (checkout Stripe)

#### Objectifs GA4

1. [ ] Réservation complétée (priorité haute)
2. [ ] Contact soumis
3. [ ] Temps passé > 2 minutes
4. [ ] Pages vues > 3

**Résultat attendu** :
- Données trafic en temps réel
- Taux de conversion réservations
- Sources de trafic identifiées
- Comportement utilisateurs

---

### 📰 9. Optimiser Contenu Blog pour SEO

**Status** : ⏳ À faire

**Temps estimé** : 4-6 heures (optimisation articles existants) + continu (nouveaux articles)

#### Phase 1 : Optimiser Articles Existants (6 articles)

**Pour chaque article** :

1. [ ] **Metadata complète**
   - Title : 60 caractères max
   - Description : 150-160 caractères avec mots-clés
   - Keywords pertinents

2. [ ] **Schema.org Article**
```typescript
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Titre article",
  "datePublished": "2026-01-XX",
  "dateModified": "2026-01-XX",
  "author": {
    "@type": "Organization",
    "name": "CoworKing Café"
  },
  "publisher": {
    "@type": "Organization",
    "name": "CoworKing Café"
  }
}
```

3. [ ] **Images optimisées**
   - Alt text descriptif avec mots-clés
   - Compression (< 200 KB)
   - Format WebP si possible

4. [ ] **Internal linking**
   - 2-3 liens vers pages du site
   - Ancres descriptives

**Checklist par article** :
- [ ] Article 1 : [slug] - Metadata + Schema + Images + Links
- [ ] Article 2 : [slug] - Metadata + Schema + Images + Links
- [ ] Article 3 : [slug] - Metadata + Schema + Images + Links
- [ ] Article 4 : [slug] - Metadata + Schema + Images + Links
- [ ] Article 5 : [slug] - Metadata + Schema + Images + Links
- [ ] Article 6 : [slug] - Metadata + Schema + Images + Links

#### Phase 2 : Plan Éditorial (1 article/semaine)

**Mots-clés longue traîne à cibler** :
- [ ] "meilleur espace coworking strasbourg centre"
- [ ] "café coworking boissons illimitées strasbourg"
- [ ] "coworking étudiant strasbourg pas cher"
- [ ] "anticafé strasbourg horaires tarifs"
- [ ] "lieu travail calme strasbourg centre ville"
- [ ] "coworking journée strasbourg"

**Structure article type** :
- Title H1 avec mot-clé principal
- Introduction (200 mots) avec question
- 3-4 sections H2 (500-800 mots chacune)
- Conclusion avec CTA (réserver, contact)
- 2-3 images optimisées
- 3-5 liens internes
- **Longueur cible** : 1500-2000 mots

**Résultat attendu** : +100-200 visites/mois via blog après 3-6 mois

---

## 🚀 PRIORITÉ BASSE (1-3 Mois)

### 🖼️ 10. Optimiser Images - Migration Next.js Image

**Status** : ⏳ À faire

**Temps estimé** : 10-15 heures (progressif)

**Objectif** : Améliorer Core Web Vitals sans casser le design

#### Phase 1 : Fixer Contraintes CSS (obligatoire d'abord)

- [ ] Analyser classes CSS qui contraignent les images
- [ ] Ajouter `width: auto; height: auto;` où nécessaire
- [ ] Documenter classes problématiques

#### Phase 2 : Migration Test sur /pricing

- [ ] Remplacer `<img>` par `<Image>` sur page `/pricing`
- [ ] Tester visuellement (avant/après)
- [ ] Si OK → continuer, si KO → revoir CSS

#### Phase 3 : Migration Autres Pages (si Phase 2 OK)

- [ ] Page `/` (homepage)
- [ ] Page `/spaces`
- [ ] Page `/concept`
- [ ] Pages blog `/blog/[slug]`

**Code type** :
```typescript
// Avant
<img src="/images/photo.jpg" alt="Description SEO" />

// Après
import Image from 'next/image';
<Image
  src="/images/photo.jpg"
  alt="Description SEO"
  width={800}
  height={600}
  style={{ width: 'auto', height: 'auto' }}
  priority={false} // true uniquement pour hero image
/>
```

**Bénéfices attendus** :
- ✅ Lazy loading automatique
- ✅ Formats modernes (WebP/AVIF)
- ✅ Responsive images
- ✅ Meilleur Core Web Vitals

**⚠️ Important** : Ne PAS forcer si ça casse le design

---

### ⚡ 11. Optimiser Core Web Vitals

**Status** : ⏳ À faire

**Temps estimé** : 5-10 heures

**Objectif** : Score 90+ sur PageSpeed Insights

#### Étape 1 : Audit Initial

1. [ ] Tester sur https://pagespeed.web.dev/
   - URL : `https://www.coworkingcafe.fr/`
   - Noter scores Mobile + Desktop

**Scores actuels** :
- Mobile : __/100
- Desktop : __/100
- LCP : __s
- FID : __ms
- CLS : __

#### Étape 2 : Optimisations LCP (< 2.5s)

- [ ] Précharger fonts critiques :
```typescript
// app/layout.tsx
<link rel="preload" href="/fonts/font.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
```
- [ ] Précharger hero image
- [ ] Utiliser `priority` sur image hero

#### Étape 3 : Optimisations FID (< 100ms)

- [ ] Vérifier scripts bloquants
- [ ] Différer scripts non-critiques
- [ ] Réduire JavaScript bundle size

#### Étape 4 : Optimisations CLS (< 0.1)

- [ ] Spécifier width/height sur TOUTES les images
- [ ] Réserver espace pour fonts (font-display: swap)
- [ ] Éviter injection dynamique de contenu

#### Étape 5 : CSS/SCSS

- [ ] Extraire Critical CSS inline dans `<head>`
- [ ] Différer CSS non-critique
- [ ] Minifier CSS production

#### Étape 6 : Fonts Optimization

```scss
@font-face {
  font-family: 'Main';
  font-display: swap; // Évite FOIT
  src: url('/fonts/main.woff2') format('woff2');
}
```

#### Étape 7 : Vérification Finale

- [ ] Re-tester PageSpeed
- [ ] Vérifier Core Web Vitals dans Search Console

**Résultat attendu** : Score 90+ Mobile et Desktop

---

### 🔗 12. Obtenir Backlinks et Citations Locales

**Status** : ⏳ À faire

**Temps estimé** : Continu (1-2h/semaine)

**Objectif** : Augmenter autorité du domaine (DA)

#### Phase 1 : Annuaires Locaux (Rapide)

**Annuaires à soumettre** :
- [ ] PagesJaunes.fr
- [ ] Yelp.fr
- [ ] LaFourchette.com (si restauration)
- [ ] Tripadvisor.fr (si café)
- [ ] Kompass.com
- [ ] 118712.fr
- [ ] Hoodspot.fr

**⚠️ Informations NAP cohérentes** (cruciales) :
- **Nom** : CoworKing Café by Anticafé
- **Adresse** : 1 rue de la Division Leclerc, 67000 Strasbourg
- **Téléphone** : 09 87 33 45 19
- **Site** : https://www.coworkingcafe.fr

**Important** : Utiliser EXACTEMENT les mêmes infos partout !

#### Phase 2 : Partenariats Locaux

**Blogs/Médias Strasbourg à contacter** :
- [ ] Blog "Strasbourg Curieux"
- [ ] DNA (Dernières Nouvelles d'Alsace)
- [ ] Rue89 Strasbourg
- [ ] Radio locale
- [ ] Blogs coworking/entrepreneur

**Proposition d'articles** :
- [ ] "Comment choisir son espace coworking à Strasbourg"
- [ ] "Le guide du coworking pour étudiants"
- [ ] "Travailler dans un café vs coworking"

#### Phase 3 : Réseaux Business

- [ ] CCI Alsace
- [ ] Eurométropole de Strasbourg
- [ ] Alsace Digitale
- [ ] French Tech Alsace

**Résultat attendu** :
- 10-15 backlinks qualité dans 3 mois
- DA +5 points en 6 mois
- +50 visites référents/mois

---

## 🔄 ROUTINE CONTINUE

### 📅 13. Monitoring Hebdomadaire SEO

**Status** : ⏳ À mettre en place

**Temps** : 15-30 min/semaine

#### Lundi Matin : Google Search Console

1. [ ] Aller sur https://search.google.com/search-console
2. [ ] Vérifier **Performances** (7 derniers jours) :
   - Clics totaux
   - Impressions
   - CTR moyen
   - Position moyenne
3. [ ] Vérifier **Couverture** :
   - Pages indexées (objectif : 21/21)
   - Erreurs (objectif : 0)
   - Avertissements
4. [ ] Vérifier **Core Web Vitals** :
   - URLs avec bon CWV
   - URLs à améliorer

#### Mercredi : Google Analytics

1. [ ] Sessions derniers 7 jours
2. [ ] Taux de rebond (objectif : < 60%)
3. [ ] Pages les plus visitées
4. [ ] Sources de trafic (organique vs direct vs référent)

#### Vendredi : Quick Checks

1. [ ] Sitemap accessible : https://www.coworkingcafe.fr/sitemap.xml
2. [ ] Robots.txt correct : https://www.coworkingcafe.fr/robots.txt
3. [ ] Site accessible (pas de 500)
4. [ ] Test rapide PageSpeed : https://pagespeed.web.dev/

#### Mensuel (1er du mois)

- [ ] Rapport positions mots-clés
- [ ] Rapport backlinks (si outil disponible)
- [ ] Rapport Google My Business
- [ ] Analyse concurrence

**KPIs à suivre** :
- Pages indexées : __/21
- Position "coworking strasbourg" : __
- Trafic organique : __ visites/mois
- Core Web Vitals score : __/100

---

## 📊 Résultats Attendus

### Court Terme (1 mois)

| Métrique | Objectif |
|----------|----------|
| Pages indexées | 21/21 |
| Sitemap soumis | ✅ |
| Google My Business | ✅ Créé |
| Analytics configuré | ✅ |

### Moyen Terme (3 mois)

| Métrique | Objectif |
|----------|----------|
| Position "coworking strasbourg" | Top 10-20 |
| Trafic organique | 100-200 visites/mois |
| Core Web Vitals | 80+ score |
| Backlinks | 10-15 liens qualité |

### Long Terme (6 mois)

| Métrique | Objectif |
|----------|----------|
| Position "coworking strasbourg" | Top 5-10 |
| Trafic organique | 300-500 visites/mois |
| Core Web Vitals | 90+ score |
| Backlinks | 20-30 liens qualité |
| Articles blog | 15-20 articles |
| DA (Domain Authority) | +10 points |

---

## 🛠️ Outils Utilisés

### Gratuits
- ✅ Google Search Console (performances, couverture)
- ✅ Google Analytics 4 (trafic, conversions)
- ✅ Google My Business (recherches locales)
- ✅ PageSpeed Insights (performances)
- ✅ Schema.org Validator (structured data)

### Payants (optionnels)
- Ahrefs (backlinks, mots-clés)
- SEMrush (audit SEO complet)
- Screaming Frog (crawl technique)

---

## 📝 Notes & Historique

### 2026-02-09
- ✅ robots.txt optimisé et déployé
- ✅ Sitemap soumis (21 URLs)
- ✅ 6 pages prioritaires indexées
- 🟡 15 URLs restantes en cours d'indexation

### [Date]
- [Actions réalisées]

---

**🎯 Prochaine action** : Indexer 6 URLs restantes demain (quota Google 10/jour)

**📧 Contact** : Pour toute question, voir documentation complète dans `/docs/seo/SEO_STRATEGY.md`
