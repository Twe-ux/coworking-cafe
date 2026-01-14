"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  FieldConfig,
  FormConfig,
  FormSection as FormSectionType,
  useGenericForm,
} from "@/hooks/use-generic-form";
import { cn } from "@/lib/utils";

// Props pour le rendu d'un champ individuel
interface FieldRendererProps {
  field: FieldConfig;
  value: any;
  error?: string;
  onChange: (fieldId: string, value: any) => void;
}

// Rendu d'un champ individuel
function FieldRenderer({ field, value, error, onChange }: FieldRendererProps) {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const newValue =
      field.type === "number"
        ? parseFloat(e.target.value) || 0
        : e.target.value;
    onChange(field.id, newValue);
  };

  const fieldContent = () => {
    switch (field.type) {
      case "text":
      case "email":
      case "tel":
      case "date":
        return (
          <Input
            id={field.id}
            type={field.type}
            placeholder={field.placeholder}
            value={value || ""}
            onChange={handleInputChange}
            className={cn(error && "border-red-500 focus-visible:ring-red-500")}
            aria-describedby={error ? `${field.id}-error` : undefined}
          />
        );

      case "number":
        return (
          <Input
            id={field.id}
            type="number"
            placeholder={field.placeholder}
            value={value || ""}
            onChange={handleInputChange}
            className={cn(error && "border-red-500 focus-visible:ring-red-500")}
            aria-describedby={error ? `${field.id}-error` : undefined}
          />
        );

      case "textarea":
        return (
          <textarea
            id={field.id}
            placeholder={field.placeholder}
            value={value || ""}
            onChange={handleInputChange}
            className={cn(
              "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-red-500 focus-visible:ring-red-500",
            )}
            aria-describedby={error ? `${field.id}-error` : undefined}
          />
        );

      case "select":
        const selectField = field as Extract<FieldConfig, { type: "select" }>;
        return (
          <Select
            value={value || ""}
            onValueChange={(newValue) => onChange(field.id, newValue)}
          >
            <SelectTrigger
              id={field.id}
              className={cn(error && "border-red-500 focus:ring-red-500")}
              aria-describedby={error ? `${field.id}-error` : undefined}
            >
              <SelectValue
                placeholder={field.placeholder || "Sélectionner..."}
              />
            </SelectTrigger>
            <SelectContent>
              {selectField.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "switch":
        return (
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor={field.id}>{field.label}</Label>
              {field.description && (
                <p className="text-muted-foreground text-sm">
                  {field.description}
                </p>
              )}
            </div>
            <Switch
              id={field.id}
              checked={value || false}
              onCheckedChange={(checked) => onChange(field.id, checked)}
              aria-describedby={error ? `${field.id}-error` : undefined}
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (field.type === "switch") {
    return (
      <div className={cn("space-y-2", field.className)}>
        {fieldContent()}
        {error && (
          <p
            id={`${field.id}-error`}
            className="flex items-center gap-1 text-sm text-red-600"
          >
            <span className="text-red-500">⚠</span>
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", field.className)}>
      <Label
        htmlFor={field.id}
        className={cn(
          field.required &&
            "after:ml-0.5 after:text-red-500 after:content-['*']",
        )}
      >
        {field.label}
      </Label>
      {fieldContent()}
      {field.description && !error && (
        <p className="text-muted-foreground text-sm">{field.description}</p>
      )}
      {error && (
        <p
          id={`${field.id}-error`}
          className="flex items-center gap-1 text-sm text-red-600"
        >
          <span className="text-red-500">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}

// Props pour le rendu d'une section
interface FormSectionProps {
  section: FormSectionType;
  formData: Record<string, any>;
  errors: Record<string, string>;
  onChange: (fieldId: string, value: any) => void;
}

// Rendu d'une section de formulaire
function FormSection({
  section,
  formData,
  errors,
  onChange,
}: FormSectionProps) {
  const gridCols =
    section.columns === 3
      ? "grid-cols-3"
      : section.columns === 2
        ? "grid-cols-1 md:grid-cols-2"
        : "grid-cols-1";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{section.title}</CardTitle>
        {section.description && (
          <CardDescription>{section.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className={cn("grid gap-4", gridCols)}>
          {section.fields.map((field) => (
            <FieldRenderer
              key={field.id}
              field={field}
              value={formData[field.id]}
              error={errors[field.id]}
              onChange={onChange}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Props pour les actions du formulaire
interface FormActionsProps {
  onSubmit: (e: React.FormEvent) => void;
  onReset?: () => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  resetLabel?: string;
  cancelLabel?: string;
  isValid?: boolean;
}

// Composant pour les actions du formulaire
function FormActions({
  onSubmit,
  onReset,
  onCancel,
  isSubmitting = false,
  submitLabel = "Soumettre",
  resetLabel = "Réinitialiser",
  cancelLabel = "Annuler",
  isValid = true,
}: FormActionsProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          {onReset && (
            <Button
              type="button"
              variant="outline"
              onClick={onReset}
              disabled={isSubmitting}
            >
              {resetLabel}
            </Button>
          )}
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            type="submit"
            onClick={onSubmit}
            disabled={isSubmitting || !isValid}
            className="min-w-[120px]"
          >
            {isSubmitting ? "En cours..." : submitLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Composant principal de formulaire générique
interface GenericFormProps<T extends Record<string, any>> {
  config: FormConfig<T>;
  title?: string;
  description?: string;
  className?: string;
  onCancel?: () => void;
  showResetButton?: boolean;
}

export function GenericForm<T extends Record<string, any>>({
  config,
  title,
  description,
  className,
  onCancel,
  showResetButton = true,
}: GenericFormProps<T>) {
  const {
    formData,
    errors,
    isSubmitting,
    handleFieldChange,
    handleSubmit,
    resetForm,
    isValid,
  } = useGenericForm(config);

  return (
    <div className={cn("container mx-auto space-y-6 py-6", className)}>
      {(title || description) && (
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            )}
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rendu des sections */}
        {config.sections.map((section) => (
          <FormSection
            key={section.id}
            section={section}
            formData={formData}
            errors={errors}
            onChange={handleFieldChange}
          />
        ))}

        {/* Actions du formulaire */}
        <FormActions
          onSubmit={handleSubmit}
          onReset={showResetButton ? resetForm : undefined}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
          submitLabel={config.submitLabel}
          resetLabel={config.resetLabel}
          cancelLabel={config.cancelLabel}
          isValid={isValid}
        />
      </form>
    </div>
  );
}

// Exports pour une utilisation externe
export { FieldRenderer, FormActions, FormSection };
export type { FieldRendererProps, FormActionsProps, FormSectionProps };
