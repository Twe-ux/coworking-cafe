import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Props du composant Card
 */
export interface CardProps {
  variant?: 'default' | 'outlined' | 'elevated';
  className?: string;
  children: ReactNode;
}

/**
 * Props des sous-composants
 */
interface CardSubComponentProps {
  children: ReactNode;
  className?: string;
}

/**
 * Composant Card avec pattern composition
 * Usage:
 * <Card variant="outlined">
 *   <Card.Header>Title</Card.Header>
 *   <Card.Body>Content</Card.Body>
 *   <Card.Footer>Actions</Card.Footer>
 * </Card>
 */
export function Card({
  variant = 'default',
  className,
  children
}: CardProps) {
  const baseClass = 'ui-card';

  const classes = cn(
    baseClass,
    `${baseClass}--${variant}`,
    className
  );

  return (
    <div className={classes}>
      {children}
    </div>
  );
}

/**
 * Card.Header - En-tête de la card
 */
function CardHeader({
  children,
  className
}: CardSubComponentProps) {
  return (
    <div className={cn('ui-card__header', className)}>
      {children}
    </div>
  );
}

CardHeader.displayName = 'Card.Header';
Card.Header = CardHeader;

/**
 * Card.Body - Corps de la card
 */
function CardBody({
  children,
  className
}: CardSubComponentProps) {
  return (
    <div className={cn('ui-card__body', className)}>
      {children}
    </div>
  );
}

CardBody.displayName = 'Card.Body';
Card.Body = CardBody;

/**
 * Card.Footer - Pied de la card
 */
function CardFooter({
  children,
  className
}: CardSubComponentProps) {
  return (
    <div className={cn('ui-card__footer', className)}>
      {children}
    </div>
  );
}

CardFooter.displayName = 'Card.Footer';
Card.Footer = CardFooter;
