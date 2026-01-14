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
  CONTRACT_TIMES,
  CONTRACT_TYPES,
  StaffFormData,
} from "@/hooks/use-staff-form";
import { cn } from "@/lib/utils";

// Props pour les composants
interface BaseFormFieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
}

interface InputFieldProps extends BaseFormFieldProps {
  type?: "text" | "email" | "tel" | "number" | "date";
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface SelectFieldProps extends BaseFormFieldProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: readonly { value: string; label: string }[];
}

interface SwitchFieldProps extends BaseFormFieldProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  description?: string;
}

// Composant Input avec gestion d'erreur
export function FormInputField({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
  className,
}: InputFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label
        htmlFor={id}
        className={cn(
          required && "after:ml-0.5 after:text-red-500 after:content-['*']",
        )}
      >
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={cn(error && "border-red-500 focus-visible:ring-red-500")}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p
          id={`${id}-error`}
          className="flex items-center gap-1 text-sm text-red-600"
        >
          <span className="text-red-500">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}

// Composant Select avec gestion d'erreur
export function FormSelectField({
  id,
  label,
  value,
  onValueChange,
  placeholder = "Sélectionner...",
  options,
  error,
  required = false,
  className,
}: SelectFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label
        htmlFor={id}
        className={cn(
          required && "after:ml-0.5 after:text-red-500 after:content-['*']",
        )}
      >
        {label}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={id}
          className={cn(error && "border-red-500 focus:ring-red-500")}
          aria-describedby={error ? `${id}-error` : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p
          id={`${id}-error`}
          className="flex items-center gap-1 text-sm text-red-600"
        >
          <span className="text-red-500">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}

// Composant Switch avec gestion d'erreur
export function FormSwitchField({
  id,
  label,
  checked,
  onCheckedChange,
  description,
  error,
  className,
}: SwitchFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor={id}>{label}</Label>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
      {error && (
        <p
          id={`${id}-error`}
          className="flex items-center gap-1 text-sm text-red-600"
        >
          <span className="text-red-500">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}

// Section Informations personnelles
export function PersonalInfoSection({
  formData,
  errors,
  onInputChange,
}: {
  formData: StaffFormData;
  errors: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations personnelles</CardTitle>
        <CardDescription>
          Renseignez les informations de base du membre du personnel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormInputField
            id="firstName"
            label="Prénom"
            placeholder="Entrez le prénom"
            value={formData.firstName}
            onChange={onInputChange}
            error={errors.firstName}
            required
          />
          <FormInputField
            id="lastName"
            label="Nom"
            placeholder="Entrez le nom"
            value={formData.lastName}
            onChange={onInputChange}
            error={errors.lastName}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormInputField
            id="email"
            label="Email"
            type="email"
            placeholder="exemple@email.com"
            value={formData.email}
            onChange={onInputChange}
            error={errors.email}
            required
          />
          <FormInputField
            id="phone"
            label="Téléphone"
            type="tel"
            placeholder="06 12 34 56 78"
            value={formData.phone}
            onChange={onInputChange}
            error={errors.phone}
            required
          />
        </div>

        <FormInputField
          id="numberSecu"
          label="Numéro de sécurité sociale"
          placeholder="1 23 45 67 890 123 45"
          value={formData.numberSecu}
          onChange={onInputChange}
          error={errors.numberSecu}
        />
      </CardContent>
    </Card>
  );
}

// Section Adresse
export function AddressSection({
  formData,
  errors,
  onInputChange,
}: {
  formData: StaffFormData;
  errors: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Adresse</CardTitle>
        <CardDescription>
          Informations de domicile du membre du personnel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormInputField
          id="adresse"
          label="Adresse"
          placeholder="12 rue de la Paix"
          value={formData.adresse}
          onChange={onInputChange}
          error={errors.adresse}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormInputField
            id="zipcode"
            label="Code postal"
            placeholder="75001"
            value={formData.zipcode}
            onChange={onInputChange}
            error={errors.zipcode}
          />
          <FormInputField
            id="city"
            label="Ville"
            placeholder="Paris"
            value={formData.city}
            onChange={onInputChange}
            error={errors.city}
            className="md:col-span-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Section Contrat
export function ContractSection({
  formData,
  errors,
  onSelectChange,
}: {
  formData: StaffFormData;
  errors: Record<string, string>;
  onSelectChange: (id: string, value: string | boolean) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations contractuelles</CardTitle>
        <CardDescription>Détails du contrat de travail</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormSelectField
            id="framework"
            label="Type de contrat"
            value={formData.framework}
            onValueChange={(value) => onSelectChange("framework", value)}
            options={CONTRACT_TYPES}
            error={errors.framework}
            required
          />
          <FormSelectField
            id="times"
            label="Temps de travail"
            value={formData.times}
            onValueChange={(value) => onSelectChange("times", value)}
            options={CONTRACT_TIMES}
            error={errors.times}
            required
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Section Rémunération et dates
export function CompensationSection({
  formData,
  errors,
  onInputChange,
  onSelectChange,
}: {
  formData: StaffFormData;
  errors: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (id: string, value: string | boolean) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rémunération et période</CardTitle>
        <CardDescription>
          Détails de rémunération et dates du contrat
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormInputField
            id="hourlyRate"
            label="Taux horaire (€)"
            type="number"
            placeholder="15.50"
            value={formData.hourlyRate}
            onChange={onInputChange}
            error={errors.hourlyRate}
            required
          />
          <FormInputField
            id="startDate"
            label="Date de début"
            type="date"
            value={formData.startDate}
            onChange={onInputChange}
            error={errors.startDate}
          />
          <FormInputField
            id="endDate"
            label="Date de fin"
            type="date"
            value={formData.endDate}
            onChange={onInputChange}
            error={errors.endDate}
          />
        </div>

        <FormInputField
          id="mdp"
          label="Mot de passe (numérique)"
          type="number"
          placeholder="1234"
          value={formData.mdp}
          onChange={onInputChange}
          error={errors.mdp}
        />

        <FormSwitchField
          id="isActif"
          label="Membre actif"
          description="Détermine si le membre du personnel est actuellement actif"
          checked={formData.isActif}
          onCheckedChange={(checked) => onSelectChange("isActif", checked)}
          error={errors.isActif}
        />
      </CardContent>
    </Card>
  );
}

// Section Actions du formulaire
export function FormActions({
  onSubmit,
  onCancel,
  onReset,
  loading = false,
  submitLabel = "Créer le personnel",
  cancelLabel = "Annuler",
  resetLabel = "Réinitialiser",
}: {
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  onReset?: () => void;
  loading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  resetLabel?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          {onReset && (
            <Button
              type="button"
              variant="outline"
              onClick={onReset}
              disabled={loading}
            >
              {resetLabel}
            </Button>
          )}
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            type="submit"
            onClick={onSubmit}
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? "Création..." : submitLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
