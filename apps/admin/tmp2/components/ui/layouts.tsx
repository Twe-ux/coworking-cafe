"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Types pour les layouts
export type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  className?: string;
};

export type PageLayoutProps = {
  header: PageHeaderProps;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
};

export type FormLayoutProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
};

export type DashboardLayoutProps = {
  title: string;
  description?: string;
  stats?: React.ReactNode;
  filters?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

// En-tête de page réutilisable
export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn("flex items-center justify-between space-y-2", className)}
    >
      <div className="space-y-1">
        {breadcrumb}
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center space-x-2">{actions}</div>}
    </div>
  );
}

// Layout de page principal
export function PageLayout({
  header,
  children,
  sidebar,
  className,
}: PageLayoutProps) {
  return (
    <div className={cn("flex-1 space-y-6 p-6", className)}>
      <PageHeader {...header} />

      {sidebar ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">{children}</div>
          <div className="space-y-6">{sidebar}</div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

// Layout de formulaire
export function FormLayout({
  title,
  description,
  children,
  actions,
  isLoading = false,
  className,
}: FormLayoutProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : (
            children
          )}
        </CardContent>
        {actions && (
          <div className="px-6 pb-6">
            <div className="flex gap-2">{actions}</div>
          </div>
        )}
      </Card>
    </div>
  );
}

// Layout de dashboard avec statistiques
export function DashboardLayout({
  title,
  description,
  stats,
  filters,
  children,
  className,
}: DashboardLayoutProps) {
  return (
    <div className={cn("space-y-6 p-6", className)}>
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {filters}
      </div>

      {/* Statistiques */}
      {stats && <div className="space-y-4">{stats}</div>}

      {/* Contenu principal */}
      <div className="space-y-6">{children}</div>
    </div>
  );
}

// Layout en deux colonnes
export function TwoColumnLayout({
  leftColumn,
  rightColumn,
  leftWidth = "2/3",
  className,
}: {
  leftColumn: React.ReactNode;
  rightColumn: React.ReactNode;
  leftWidth?: "1/2" | "2/3" | "3/4";
  className?: string;
}) {
  const gridClasses = {
    "1/2": "lg:grid-cols-2",
    "2/3": "lg:grid-cols-3",
    "3/4": "lg:grid-cols-4",
  };

  const leftClasses = {
    "1/2": "lg:col-span-1",
    "2/3": "lg:col-span-2",
    "3/4": "lg:col-span-3",
  };

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6",
        gridClasses[leftWidth],
        className,
      )}
    >
      <div className={leftClasses[leftWidth]}>{leftColumn}</div>
      <div>{rightColumn}</div>
    </div>
  );
}

// Container responsif
export function ResponsiveContainer({
  children,
  size = "default",
  className,
}: {
  children: React.ReactNode;
  size?: "sm" | "default" | "lg" | "xl" | "full";
  className?: string;
}) {
  const sizeClasses = {
    sm: "max-w-2xl",
    default: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div className={cn("mx-auto w-full", sizeClasses[size], className)}>
      {children}
    </div>
  );
}

// Section avec titre
export function Section({
  title,
  description,
  children,
  actions,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

// Grid responsive pour les cartes
export function CardGrid({
  children,
  columns = 3,
  className,
}: {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridClasses[columns], className)}>
      {children}
    </div>
  );
}
