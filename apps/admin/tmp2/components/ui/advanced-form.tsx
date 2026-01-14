"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  AdvancedFieldConfig,
  AdvancedFormConfig,
  AdvancedFormSection,
  ArrayFieldConfig,
  DynamicListFieldConfig,
  FileUploadFieldConfig,
  MultiSelectFieldConfig,
  ObjectFieldConfig,
  useAdvancedForm,
} from "@/hooks/use-advanced-form";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import React, { useState } from "react";

interface AdvancedFormProps<T extends Record<string, any>> {
  config: AdvancedFormConfig<T>;
  className?: string;
}

export function AdvancedForm<T extends Record<string, any>>({
  config,
  className = "",
}: AdvancedFormProps<T>) {
  const {
    formData,
    errors,
    isSubmitting,
    currentStep,
    visitedSteps,
    handleFieldChange,
    handleSubmit,
    handleArrayAdd,
    handleArrayRemove,
    nextStep,
    prevStep,
    isFirstStep,
    isLastStep,
    progress,
  } = useAdvancedForm(config);

  const currentSection = config.sections[currentStep];

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Progress bar pour le wizard */}
      {config.wizardMode && config.showProgress && (
        <div className="space-y-2">
          <div className="text-muted-foreground flex justify-between text-sm">
            <span>
              Étape {currentStep + 1} sur {config.sections.length}
            </span>
            <span>{Math.round(progress)}% complété</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Navigation wizard */}
      {config.wizardMode && config.sections.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {config.sections.map((section, index) => (
            <Button
              key={index}
              type="button"
              variant={
                index === currentStep
                  ? "default"
                  : visitedSteps.has(index)
                    ? "secondary"
                    : "ghost"
              }
              size="sm"
              className="whitespace-nowrap"
              disabled={!visitedSteps.has(index)}
              onClick={() => index < currentStep && prevStep()}
            >
              {index + 1}. {section.title}
            </Button>
          ))}
        </div>
      )}

      {/* Titre de section */}
      {currentSection && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{currentSection.title}</h2>
          {currentSection.description && (
            <p className="text-muted-foreground">
              {currentSection.description}
            </p>
          )}
        </div>
      )}

      {/* Rendu du contenu */}
      {config.wizardMode ? (
        <FormSection
          section={currentSection}
          formData={formData}
          errors={errors}
          onFieldChange={handleFieldChange}
          onArrayAdd={handleArrayAdd}
          onArrayRemove={handleArrayRemove}
        />
      ) : (
        <div className="space-y-6">
          {config.sections.map((section, index) => (
            <FormSection
              key={index}
              section={section}
              formData={formData}
              errors={errors}
              onFieldChange={handleFieldChange}
              onArrayAdd={handleArrayAdd}
              onArrayRemove={handleArrayRemove}
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between border-t pt-4">
        <div className="flex space-x-2">
          {config.wizardMode && !isFirstStep && (
            <Button type="button" variant="outline" onClick={prevStep}>
              Précédent
            </Button>
          )}
        </div>

        <div className="flex space-x-2">
          {config.wizardMode && !isLastStep ? (
            <Button type="button" onClick={nextStep}>
              Suivant
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Envoi..." : config.submitLabel || "Valider"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

// Composant pour le rendu d'une section
interface FormSectionProps {
  section: AdvancedFormSection;
  formData: any;
  errors: Record<string, string>;
  onFieldChange: (path: string, value: any) => void;
  onArrayAdd: (path: string, item: any) => void;
  onArrayRemove: (path: string, index: number) => void;
}

function FormSection({
  section,
  formData,
  errors,
  onFieldChange,
  onArrayAdd,
  onArrayRemove,
}: FormSectionProps) {
  const [isExpanded, setIsExpanded] = useState(
    section.defaultExpanded !== false,
  );

  // Vérification des conditions
  const isVisible =
    !section.conditional || checkCondition(formData, section.conditional);

  if (!isVisible) return null;

  const content = (
    <div
      className={`grid gap-4 ${
        section.layout === "grid"
          ? `grid-cols-${section.columns || 2}`
          : "grid-cols-1"
      }`}
    >
      {section.fields.map((field) => (
        <FieldRenderer
          key={field.id}
          field={field}
          value={getNestedValue(formData, field.id)}
          error={errors[field.id]}
          onChange={(value) => onFieldChange(field.id, value)}
          onArrayAdd={(item) => onArrayAdd(field.id, item)}
          onArrayRemove={(index) => onArrayRemove(field.id, index)}
          formData={formData}
        />
      ))}
    </div>
  );

  if (section.collapsible) {
    return (
      <Card>
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <CardHeader className="hover:bg-muted/50 cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  {section.description && (
                    <CardDescription>{section.description}</CardDescription>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">{content}</CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  }

  return (
    <Card>
      {(section.title || section.description) && (
        <CardHeader>
          {section.title && (
            <CardTitle className="text-lg">{section.title}</CardTitle>
          )}
          {section.description && (
            <CardDescription>{section.description}</CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent
        className={section.title || section.description ? "" : "pt-6"}
      >
        {content}
      </CardContent>
    </Card>
  );
}

// Composant pour le rendu d'un champ
interface FieldRendererProps {
  field: AdvancedFieldConfig;
  value: any;
  error?: string;
  onChange: (value: any) => void;
  onArrayAdd: (item: any) => void;
  onArrayRemove: (index: number) => void;
  formData: any;
}

function FieldRenderer({
  field,
  value,
  error,
  onChange,
  onArrayAdd,
  onArrayRemove,
  formData,
}: FieldRendererProps) {
  const isVisible =
    !field.conditional || checkCondition(formData, field.conditional);

  if (!isVisible) return null;

  const fieldClass = `space-y-2 ${field.className || ""}`;
  const inputClass = error ? "border-red-500" : "";

  const renderField = () => {
    switch (field.type) {
      case "text":
      case "email":
      case "password":
      case "number":
        return (
          <Input
            type={field.type}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={field.disabled}
            className={inputClass}
          />
        );

      case "textarea":
        return (
          <textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={field.disabled}
            rows={field.rows || 3}
            className={`w-full resize-none rounded-md border px-3 py-2 ${inputClass}`}
          />
        );

      case "select":
        return (
          <Select
            value={value || ""}
            onValueChange={onChange}
            disabled={field.disabled}
          >
            <SelectTrigger className={inputClass}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "multi-select":
        const multiSelectField = field as MultiSelectFieldConfig;
        return (
          <MultiSelect
            options={multiSelectField.options}
            value={value || []}
            onChange={onChange}
            placeholder={field.placeholder}
            searchable={multiSelectField.searchable}
            maxSelections={multiSelectField.maxSelections}
            disabled={field.disabled}
          />
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              disabled={field.disabled}
              className="rounded"
            />
            <span className="text-sm">{field.placeholder}</span>
          </div>
        );

      case "switch":
        return (
          <div className="flex items-center justify-between">
            <span className="text-sm">{field.label}</span>
            <Switch
              checked={!!value}
              onCheckedChange={onChange}
              disabled={field.disabled}
            />
          </div>
        );

      case "array":
        const arrayField = field as ArrayFieldConfig;
        return (
          <ArrayField
            field={arrayField}
            value={value || []}
            onChange={onChange}
            onAdd={onArrayAdd}
            onRemove={onArrayRemove}
          />
        );

      case "dynamic-list":
        const dynamicListField = field as DynamicListFieldConfig;
        return (
          <DynamicListField
            field={dynamicListField}
            value={value || []}
            onChange={onChange}
            onAdd={onArrayAdd}
            onRemove={onArrayRemove}
          />
        );

      case "object":
        const objectField = field as ObjectFieldConfig;
        return (
          <ObjectField
            field={objectField}
            value={value || {}}
            onChange={onChange}
            formData={formData}
          />
        );

      case "file-upload":
        const fileField = field as FileUploadFieldConfig;
        return (
          <FileUploadField
            field={fileField}
            value={value}
            onChange={onChange}
          />
        );

      case "range":
        return (
          <div className="space-y-2">
            <input
              type="range"
              min={field.min || 0}
              max={field.max || 100}
              value={value || field.min || 0}
              onChange={(e) => onChange(Number(e.target.value))}
              disabled={field.disabled}
              className="w-full"
            />
            <div className="text-muted-foreground text-center text-sm">
              {value || field.min || 0}
            </div>
          </div>
        );

      case "color-picker":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={value || "#000000"}
              onChange={(e) => onChange(e.target.value)}
              disabled={field.disabled}
              className="h-8 w-12 rounded border"
            />
            <Input
              type="text"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#000000"
              className={`flex-1 ${inputClass}`}
            />
          </div>
        );

      default:
        return <div>Type de champ non supporté: {(field as any).type}</div>;
    }
  };

  return (
    <div className={fieldClass}>
      {field.label && field.type !== "switch" && (
        <Label htmlFor={field.id} className="text-sm font-medium">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </Label>
      )}

      {renderField()}

      {field.helper && (
        <p className="text-muted-foreground text-xs">{field.helper}</p>
      )}

      {error && (
        <div className="flex items-center space-x-1 text-xs text-red-500">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// Composants spécialisés
function ArrayField({
  field,
  value,
  onChange,
  onAdd,
  onRemove,
}: {
  field: ArrayFieldConfig;
  value: any[];
  onChange: (value: any[]) => void;
  onAdd: (item: any) => void;
  onRemove: (index: number) => void;
}) {
  const handleAdd = () => {
    const defaultItem = field.itemConfig.type === "object" ? {} : "";
    onAdd(defaultItem);
  };

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{field.label}</h4>
        <Button
          type="button"
          size="sm"
          onClick={handleAdd}
          disabled={!!(field.maxItems && value.length >= field.maxItems)}
        >
          <Plus className="mr-1 h-4 w-4" />
          {field.addButtonLabel || "Ajouter"}
        </Button>
      </div>

      {value.map((item, index) => (
        <div
          key={index}
          className="flex items-start space-x-2 rounded border p-3"
        >
          <div className="flex-1">
            <FieldRenderer
              field={{ ...field.itemConfig, id: `${field.id}[${index}]` }}
              value={item}
              onChange={(newValue) => {
                const newArray = [...value];
                newArray[index] = newValue;
                onChange(newArray);
              }}
              onArrayAdd={() => {}}
              onArrayRemove={() => {}}
              formData={{}}
            />
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onRemove(index)}
            disabled={!!(field.minItems && value.length <= field.minItems)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {value.length === 0 && (
        <p className="text-muted-foreground py-4 text-center">
          Aucun élément. Cliquez sur "Ajouter" pour commencer.
        </p>
      )}
    </div>
  );
}

function DynamicListField({
  field,
  value,
  onChange,
  onAdd,
  onRemove,
}: {
  field: DynamicListFieldConfig;
  value: any[];
  onChange: (value: any[]) => void;
  onAdd: (item: any) => void;
  onRemove: (index: number) => void;
}) {
  const handleAdd = () => {
    onAdd(field.defaultItem || {});
  };

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{field.label}</h4>
        <Button
          type="button"
          size="sm"
          onClick={handleAdd}
          disabled={!!(field.maxItems && value.length >= field.maxItems)}
        >
          <Plus className="mr-1 h-4 w-4" />
          Ajouter un élément
        </Button>
      </div>

      {value.map((item, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              {field.showIndexes && (
                <Badge variant="secondary">#{index + 1}</Badge>
              )}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onRemove(index)}
                disabled={!!(field.minItems && value.length <= field.minItems)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(field.itemFields).map(([fieldKey, fieldConfig]) => (
              <FieldRenderer
                key={fieldKey}
                field={{ ...fieldConfig, id: fieldKey } as AdvancedFieldConfig}
                value={item[fieldKey]}
                onChange={(newValue) => {
                  const newArray = [...value];
                  newArray[index] = { ...item, [fieldKey]: newValue };
                  onChange(newArray);
                }}
                onArrayAdd={() => {}}
                onArrayRemove={() => {}}
                formData={{}}
              />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ObjectField({
  field,
  value,
  onChange,
}: {
  field: ObjectFieldConfig;
  value: any;
  onChange: (value: any) => void;
  formData: any;
}) {
  return (
    <div
      className={`space-y-4 rounded-lg border p-4 ${
        field.layout === "grid"
          ? `grid grid-cols-${field.columns || 2} gap-4`
          : ""
      }`}
    >
      {field.fields.map((subField) => (
        <FieldRenderer
          key={subField.id}
          field={subField}
          value={value[subField.id]}
          onChange={(newValue) =>
            onChange({ ...value, [subField.id]: newValue })
          }
          onArrayAdd={() => {}}
          onArrayRemove={() => {}}
          formData={{}}
        />
      ))}
    </div>
  );
}

function FileUploadField({
  field,
  value,
  onChange,
}: {
  field: FileUploadFieldConfig;
  value: any;
  onChange: (value: any) => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      onChange(field.multiple ? Array.from(files) : files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files) {
      onChange(field.multiple ? Array.from(files) : files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <div
        className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <Upload className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
        <p className="text-muted-foreground mb-2 text-sm">
          Glissez-déposez vos fichiers ici ou cliquez pour parcourir
        </p>
        <input
          type="file"
          accept={field.accept}
          multiple={field.multiple}
          onChange={handleFileChange}
          className="hidden"
          id={field.id}
        />
        <Label htmlFor={field.id} className="cursor-pointer">
          <Button type="button" variant="outline" size="sm">
            Choisir des fichiers
          </Button>
        </Label>
      </div>

      {value && (
        <div className="space-y-1">
          {Array.isArray(value) ? (
            value.map((file, index) => (
              <div
                key={index}
                className="bg-muted flex items-center justify-between rounded p-2 text-sm"
              >
                <span>{file.name}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const newFiles = value.filter(
                      (_: any, i: number) => i !== index,
                    );
                    onChange(newFiles.length > 0 ? newFiles : null);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))
          ) : (
            <div className="bg-muted flex items-center justify-between rounded p-2 text-sm">
              <span>{value.name}</span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onChange(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MultiSelect({
  options,
  value,
  onChange,
  placeholder,
  searchable,
  maxSelections,
  disabled,
}: {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  maxSelections?: number;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = searchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase()),
      )
    : options;

  const toggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : maxSelections && value.length >= maxSelections
        ? value
        : [...value, optionValue];
    onChange(newValue);
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full justify-between"
      >
        {value.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {value.slice(0, 2).map((v) => {
              const option = options.find((o) => o.value === v);
              return (
                <Badge key={v} variant="secondary" className="text-xs">
                  {option?.label}
                </Badge>
              );
            })}
            {value.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{value.length - 2}
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronDown className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="bg-background absolute z-10 mt-1 w-full rounded-md border shadow-lg">
          {searchable && (
            <div className="border-b p-2">
              <Input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8"
              />
            </div>
          )}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                role="button"
                tabIndex={0}
                className="hover:bg-muted flex cursor-pointer items-center space-x-2 p-2"
                onClick={() => toggleOption(option.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleOption(option.value);
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={value.includes(option.value)}
                  onChange={() => toggleOption(option.value)}
                  className="rounded"
                />
                <span className="text-sm">{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Utilitaires
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

function checkCondition(formData: any, condition: any): boolean {
  const value = getNestedValue(formData, condition.field);
  const operator = condition.operator || "equals";

  switch (operator) {
    case "equals":
      return value === condition.value;
    case "not-equals":
      return value !== condition.value;
    case "contains":
      return Array.isArray(value)
        ? value.includes(condition.value)
        : typeof value === "string"
          ? value.includes(condition.value)
          : false;
    case "greater":
      return Number(value) > Number(condition.value);
    case "less":
      return Number(value) < Number(condition.value);
    default:
      return true;
  }
}

export default AdvancedForm;
