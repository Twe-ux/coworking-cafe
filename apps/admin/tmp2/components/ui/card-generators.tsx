/**
 * Component Generators - Automated Pattern Creation System
 * Generates common UI patterns and reduces repetitive component development
 *
 * Features:
 * - Card generators for different data types
 * - Modal generators with common layouts
 * - Form builders for specific domains
 * - Dashboard widget generators
 * - CRUD page templates
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Badge as BadgeIcon,
  Calendar,
  DollarSign,
  Edit,
  Eye,
  Mail,
  Minus,
  Phone,
  Star,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import * as React from "react";

// Types de base pour les générateurs
export interface BaseCardData {
  id: string;
  title: string;
  description?: string;
  status?: string;
  [key: string]: any;
}

export interface CardAction {
  label: string;
  icon?: React.ReactNode;
  onClick: (data: any) => void;
  variant?: "default" | "destructive" | "outline" | "secondary";
  condition?: (data: any) => boolean;
}

export interface CardGeneratorConfig {
  showActions?: boolean;
  actions?: CardAction[];
  showStatus?: boolean;
  statusConfig?: {
    field: string;
    options: Array<{
      value: string;
      label: string;
      variant: string;
      color?: string;
    }>;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
  layout?: "vertical" | "horizontal";
  clickable?: boolean;
  onCardClick?: (data: any) => void;
}

// Générateur de cartes pour le personnel
export interface StaffCardData extends BaseCardData {
  name: string;
  role: string;
  email: string;
  avatar?: string;
  department?: string;
  startDate: string;
  salary?: number;
  phone?: string;
  status: "active" | "inactive" | "pending";
  rating?: number;
}

export function generateStaffCard(
  data: StaffCardData,
  config: CardGeneratorConfig = {},
): React.ReactElement {
  const {
    showActions = true,
    actions = [],
    showStatus = true,
    className,
    size = "md",
    layout = "vertical",
    clickable = false,
    onCardClick,
  } = config;

  const statusOptions = [
    { value: "active", label: "Actif", variant: "default" },
    { value: "inactive", label: "Inactif", variant: "secondary" },
    { value: "pending", label: "En attente", variant: "outline" },
  ];

  const currentStatus = statusOptions.find((opt) => opt.value === data.status);

  const defaultActions: CardAction[] = [
    {
      label: "Voir",
      icon: <Eye className="h-4 w-4" />,
      onClick: (staff) => console.log("Voir:", staff),
      variant: "outline",
    },
    {
      label: "Modifier",
      icon: <Edit className="h-4 w-4" />,
      onClick: (staff) => console.log("Modifier:", staff),
      variant: "outline",
    },
    {
      label: "Supprimer",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (staff) => console.log("Supprimer:", staff),
      variant: "destructive",
      condition: (staff) => staff.status !== "active",
    },
  ];

  const finalActions = actions.length > 0 ? actions : defaultActions;

  const cardSizes = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        clickable && "cursor-pointer hover:scale-[1.02] hover:shadow-md",
        className,
      )}
      onClick={() => clickable && onCardClick?.(data)}
    >
      <CardHeader className={cardSizes[size]}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={data.avatar} alt={data.name} />
              <AvatarFallback>
                {data.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{data.name}</CardTitle>
              <CardDescription className="flex items-center space-x-2">
                <BadgeIcon className="h-3 w-3" />
                <span>{data.role}</span>
                {data.department && (
                  <>
                    <span>•</span>
                    <span>{data.department}</span>
                  </>
                )}
              </CardDescription>
            </div>
          </div>
          {showStatus && currentStatus && (
            <Badge variant={currentStatus.variant as any}>
              {currentStatus.label}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className={cardSizes[size]}>
        <div className="space-y-2">
          <div className="text-muted-foreground flex items-center space-x-2 text-sm">
            <Mail className="h-4 w-4" />
            <span>{data.email}</span>
          </div>

          {data.phone && (
            <div className="text-muted-foreground flex items-center space-x-2 text-sm">
              <Phone className="h-4 w-4" />
              <span>{data.phone}</span>
            </div>
          )}

          <div className="text-muted-foreground flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4" />
            <span>
              Depuis le {new Date(data.startDate).toLocaleDateString("fr-FR")}
            </span>
          </div>

          {data.salary && (
            <div className="text-muted-foreground flex items-center space-x-2 text-sm">
              <DollarSign className="h-4 w-4" />
              <span>{data.salary.toLocaleString("fr-FR")} €</span>
            </div>
          )}

          {data.rating && (
            <div className="text-muted-foreground flex items-center space-x-2 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{data.rating}/5</span>
            </div>
          )}
        </div>
      </CardContent>

      {showActions && finalActions.length > 0 && (
        <CardFooter className={cn(cardSizes[size], "pt-0")}>
          <div className="flex w-full space-x-2">
            {finalActions
              .filter((action) => !action.condition || action.condition(data))
              .map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick(data);
                  }}
                  className="flex-1"
                >
                  {action.icon}
                  <span className="ml-2">{action.label}</span>
                </Button>
              ))}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

// Générateur de cartes métriques/statistiques
export interface MetricCardData extends BaseCardData {
  value: number | string;
  previousValue?: number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: number;
  color?: "blue" | "green" | "red" | "yellow" | "purple";
}

export function generateMetricCard(
  data: MetricCardData,
  config: CardGeneratorConfig = {},
): React.ReactElement {
  const { className, size = "md", clickable = false, onCardClick } = config;

  const colors = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    red: "text-red-600 bg-red-100",
    yellow: "text-yellow-600 bg-yellow-100",
    purple: "text-purple-600 bg-purple-100",
  };

  const trendIcons = {
    up: <TrendingUp className="h-4 w-4 text-green-600" />,
    down: <TrendingDown className="h-4 w-4 text-red-600" />,
    neutral: <Minus className="h-4 w-4 text-gray-600" />,
  };

  const iconColorClass = data.color
    ? colors[data.color]
    : "text-gray-600 bg-gray-100";

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        clickable && "cursor-pointer hover:shadow-md",
        className,
      )}
      onClick={() => clickable && onCardClick?.(data)}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm font-medium">
              {data.title}
            </p>
            <div className="flex items-baseline space-x-1">
              <p className="text-2xl font-bold">
                {typeof data.value === "number"
                  ? data.value.toLocaleString("fr-FR")
                  : data.value}
              </p>
              {data.unit && (
                <span className="text-muted-foreground text-sm">
                  {data.unit}
                </span>
              )}
            </div>
            {data.trend && data.trendValue && (
              <div className="flex items-center space-x-1">
                {trendIcons[data.trend]}
                <span
                  className={cn(
                    "text-sm font-medium",
                    data.trend === "up" && "text-green-600",
                    data.trend === "down" && "text-red-600",
                    data.trend === "neutral" && "text-gray-600",
                  )}
                >
                  {data.trendValue > 0 ? "+" : ""}
                  {data.trendValue}%
                </span>
              </div>
            )}
          </div>
          {data.icon && (
            <div className={cn("rounded-full p-3", iconColorClass)}>
              {data.icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Générateur de cartes produits/services
export interface ProductCardData extends BaseCardData {
  name: string;
  price: number;
  image?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  discount?: number;
}

export function generateProductCard(
  data: ProductCardData,
  config: CardGeneratorConfig = {},
): React.ReactElement {
  const {
    showActions = true,
    actions = [],
    className,
    size = "md",
    clickable = true,
    onCardClick,
  } = config;

  const defaultActions: CardAction[] = [
    {
      label: "Voir",
      icon: <Eye className="h-4 w-4" />,
      onClick: (product) => console.log("Voir produit:", product),
      variant: "outline",
    },
    {
      label: "Modifier",
      icon: <Edit className="h-4 w-4" />,
      onClick: (product) => console.log("Modifier produit:", product),
      variant: "outline",
    },
  ];

  const finalActions = actions.length > 0 ? actions : defaultActions;

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-200",
        clickable && "cursor-pointer hover:scale-[1.02] hover:shadow-lg",
        className,
      )}
      onClick={() => clickable && onCardClick?.(data)}
    >
      {data.image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={data.image}
            alt={data.name}
            className="h-full w-full object-cover"
          />
          {data.discount && data.discount > 0 && (
            <Badge className="absolute right-2 top-2 bg-red-500">
              -{data.discount}%
            </Badge>
          )}
          {data.inStock === false && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Badge variant="destructive">Rupture de stock</Badge>
            </div>
          )}
        </div>
      )}

      <CardContent className="p-4">
        <div className="space-y-2">
          {data.category && (
            <Badge variant="outline" className="text-xs">
              {data.category}
            </Badge>
          )}

          <h3 className="line-clamp-2 text-lg font-semibold">{data.name}</h3>

          {data.description && (
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {data.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-green-600">
                {data.price.toFixed(2)} €
              </span>
              {data.discount && data.discount > 0 && (
                <span className="text-muted-foreground text-sm line-through">
                  {(data.price / (1 - data.discount / 100)).toFixed(2)} €
                </span>
              )}
            </div>

            {data.rating && (
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{data.rating}</span>
                {data.reviewCount && (
                  <span className="text-muted-foreground text-xs">
                    ({data.reviewCount})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {showActions && finalActions.length > 0 && (
        <CardFooter className="p-4 pt-0">
          <div className="flex w-full space-x-2">
            {finalActions
              .filter((action) => !action.condition || action.condition(data))
              .map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick(data);
                  }}
                  className="flex-1"
                >
                  {action.icon}
                  <span className="ml-2">{action.label}</span>
                </Button>
              ))}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

// Hook pour générer des cartes en masse
export function useCardGenerator() {
  const generateCards = React.useCallback(
    (
      type: "staff" | "metric" | "product",
      dataArray: any[],
      config: CardGeneratorConfig = {},
    ) => {
      return dataArray
        .map((data, index) => {
          const key = data.id || index;

          switch (type) {
            case "staff":
              return React.cloneElement(generateStaffCard(data, config), {
                key,
              });
            case "metric":
              return React.cloneElement(generateMetricCard(data, config), {
                key,
              });
            case "product":
              return React.cloneElement(generateProductCard(data, config), {
                key,
              });
            default:
              return null;
          }
        })
        .filter(Boolean);
    },
    [],
  );

  return { generateCards };
}

// Générateur de grilles de cartes avec layouts responsives
export interface CardGridConfig {
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function CardGrid({
  children,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = "md",
  className,
}: {
  children: React.ReactNode;
} & CardGridConfig) {
  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  const gridCols = {
    sm: `grid-cols-${columns.sm || 1}`,
    md: `md:grid-cols-${columns.md || 2}`,
    lg: `lg:grid-cols-${columns.lg || 3}`,
    xl: `xl:grid-cols-${columns.xl || 4}`,
  };

  return (
    <div
      className={cn(
        "grid",
        gridCols.sm,
        gridCols.md,
        gridCols.lg,
        gridCols.xl,
        gapClasses[gap],
        className,
      )}
    >
      {children}
    </div>
  );
}

// Note: Types are already exported above with their interface declarations
