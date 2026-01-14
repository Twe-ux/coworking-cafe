"use client";

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

// Types pour les données du staff
export type StaffFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  numberSecu: string;
  adresse: string;
  zipcode: string;
  city: string;
  framework: string;
  times: string;
  hourlyRate: string;
  startDate: string;
  endDate: string;
  hidden: boolean;
  mdp: string;
};

// Options pour les sélecteurs
export const CONTRACT_TYPES = [
  { value: "CDI", label: "CDI" },
  { value: "CDD", label: "CDD" },
  { value: "Freelance", label: "Freelance" },
  { value: "Stage", label: "Stage" },
];

export const CONTRACT_TIMES = [
  { value: "12h", label: "12H" },
  { value: "15h", label: "15H" },
  { value: "18h", label: "18H" },
  { value: "21h", label: "21H" },
  { value: "24h", label: "24H" },
  { value: "35h", label: "35H" },
];

// Composant pour les informations personnelles
export function PersonalInfoSection({
  formData,
  onChange,
  errors,
}: {
  formData: StaffFormData;
  onChange: (field: keyof StaffFormData, value: string | boolean) => void;
  errors: Partial<Record<keyof StaffFormData, string>>;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Informations Personnelles</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="firstName">Prénom *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
            className={errors.firstName ? "border-red-500" : ""}
            required
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
          )}
        </div>

        <div>
          <Label htmlFor="lastName">Nom *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
            className={errors.lastName ? "border-red-500" : ""}
            required
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onChange("email", e.target.value)}
            className={errors.email ? "border-red-500" : ""}
            required
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Téléphone *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            className={errors.phone ? "border-red-500" : ""}
            required
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="numberSecu">Numéro de Sécurité Sociale</Label>
          <Input
            id="numberSecu"
            value={formData.numberSecu}
            onChange={(e) => onChange("numberSecu", e.target.value)}
            placeholder="1 23 45 67 890 123 45"
          />
        </div>
      </div>
    </div>
  );
}

// Composant pour l'adresse
export function AddressSection({
  formData,
  onChange,
  errors: _errors,
}: {
  formData: StaffFormData;
  onChange: (field: keyof StaffFormData, value: string) => void;
  errors: Partial<Record<keyof StaffFormData, string>>;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Adresse</h3>

      <div>
        <Label htmlFor="adresse">Adresse</Label>
        <Input
          id="adresse"
          value={formData.adresse}
          onChange={(e) => onChange("adresse", e.target.value)}
          placeholder="123 Rue de la Paix"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="zipcode">Code Postal</Label>
          <Input
            id="zipcode"
            value={formData.zipcode}
            onChange={(e) => onChange("zipcode", e.target.value)}
            placeholder="75001"
          />
        </div>

        <div>
          <Label htmlFor="city">Ville</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => onChange("city", e.target.value)}
            placeholder="Paris"
          />
        </div>
      </div>
    </div>
  );
}

// Composant pour les informations de contrat
export function ContractSection({
  formData,
  onChange,
  errors,
}: {
  formData: StaffFormData;
  onChange: (field: keyof StaffFormData, value: string) => void;
  errors: Partial<Record<keyof StaffFormData, string>>;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Informations de Contrat</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="framework">Type de Contrat *</Label>
          <Select
            value={formData.framework}
            onValueChange={(value) => onChange("framework", value)}
          >
            <SelectTrigger className={errors.framework ? "border-red-500" : ""}>
              <SelectValue placeholder="Sélectionnez un type" />
            </SelectTrigger>
            <SelectContent>
              {CONTRACT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.framework && (
            <p className="mt-1 text-sm text-red-500">{errors.framework}</p>
          )}
        </div>

        <div>
          <Label htmlFor="times">Temps de Travail *</Label>
          <Select
            value={formData.times}
            onValueChange={(value) => onChange("times", value)}
          >
            <SelectTrigger className={errors.times ? "border-red-500" : ""}>
              <SelectValue placeholder="Sélectionnez les heures" />
            </SelectTrigger>
            <SelectContent>
              {CONTRACT_TIMES.map((time) => (
                <SelectItem key={time.value} value={time.value}>
                  {time.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.times && (
            <p className="mt-1 text-sm text-red-500">{errors.times}</p>
          )}
        </div>

        <div>
          <Label htmlFor="hourlyRate">Taux Horaire (€) *</Label>
          <Input
            id="hourlyRate"
            type="number"
            step="0.01"
            min="0"
            value={formData.hourlyRate}
            onChange={(e) => onChange("hourlyRate", e.target.value)}
            className={errors.hourlyRate ? "border-red-500" : ""}
            placeholder="15.00"
            required
          />
          {errors.hourlyRate && (
            <p className="mt-1 text-sm text-red-500">{errors.hourlyRate}</p>
          )}
        </div>

        <div>
          <Label htmlFor="mdp">Mot de Passe (4 chiffres) *</Label>
          <Input
            id="mdp"
            type="password"
            maxLength={4}
            value={formData.mdp}
            onChange={(e) => onChange("mdp", e.target.value.replace(/\D/g, ""))}
            className={errors.mdp ? "border-red-500" : ""}
            placeholder="1234"
            required
          />
          {errors.mdp && (
            <p className="mt-1 text-sm text-red-500">{errors.mdp}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="startDate">Date de Début</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => onChange("startDate", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="endDate">Date de Fin</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => onChange("endDate", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

// Composant pour les paramètres
export function SettingsSection({
  formData,
  onChange,
}: {
  formData: StaffFormData;
  onChange: (field: keyof StaffFormData, value: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Paramètres</h3>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="hidden">Employé Masqué</Label>
          <p className="text-muted-foreground text-sm">
            Cet employé n'apparaîtra pas dans la liste principale
          </p>
        </div>
        <Switch
          id="hidden"
          checked={formData.hidden}
          onCheckedChange={(checked) => onChange("hidden", checked)}
        />
      </div>
    </div>
  );
}
