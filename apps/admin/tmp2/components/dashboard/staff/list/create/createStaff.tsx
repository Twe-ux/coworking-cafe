"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { AppDispatch } from "@/store";
import { createStaff } from "@/store/staff/api";
import React from "react";

import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

const CONTRACT_TYPES = [
  { value: "CDI", label: "CDI" },
  { value: "CDD", label: "CDD" },
  { value: "Freelance", label: "Freelance" },
  { value: "Stage", label: "Stage" },
];
const CONTRACT_TIMES = [
  { value: "12h", label: "12H" },
  { value: "15h", label: "15H" },
  { value: "18h", label: "18H" },
  { value: "21h", label: "21H" },
  { value: "24h", label: "24H" },
  { value: "35h", label: "35H" },
];

const initialFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "", // Mis à jour vers le format moderne
  numberSecu: "",
  adresse: "",
  zipcode: "",
  city: "",
  framework: "",
  times: "",
  hourlyRate: "",
  startDate: "", // Default to today
  endDate: "", // Default to today
  contract: "",
  mdp: "", // Champ pour le mot de passe ou l'identifiant
  isActive: true, // Mis à jour vers le format moderne
};

export default function CreateStaff() {
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: any) => state.staff);
  const [formData, setFormData] = React.useState(initialFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelect = (id: string, value: string | boolean) => {
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Les données sont maintenant directement compatibles
    const staffData = {
      ...formData,
      hourlyRate: Number(formData.hourlyRate),
      mdp: Number(formData.mdp),
      startDate: formData.startDate ? new Date(formData.startDate) : new Date(),
      endDate: formData.endDate ? new Date(formData.endDate) : new Date(),
    };

    dispatch(createStaff(staffData));
  };

  return (
    <Card className="flex p-6">
      {/* <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">Nom</label>
          <input
            id="firstName"
            type="text"
            className="w-full rounded border p-2"
            placeholder="Entrez le nom"
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">Prénom</label>
          <input
            id="lastName"
            type="text"
            className="w-full rounded border p-2"
            placeholder="Entrez le prénom"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            id="email"
            type="email"
            className="w-full rounded border p-2"
            placeholder="Entrez l'email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Création en cours..." : "Créer"}
        </button>
        {success && (
          <p className="mt-2 text-green-500">
            {formData.lastName} a été créé avec succès !
          </p>
        )}
        {error && <p className="mt-2 text-red-500">Erreur : {error}</p>}
      </form> */}
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid items-center gap-10">
            <div className="flex justify-between gap-2">
              <div className="flex-1 flex-col space-y-1.5">
                <Label className="pl-3" htmlFor="firstName">
                  Nom
                </Label>
                <Input
                  id="firstName"
                  placeholder="Nom"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex-1 flex-col space-y-1.5">
                <Label className="pl-3" htmlFor="lastName">
                  Prénom
                </Label>
                <Input
                  id="lastName"
                  placeholder="Prénom"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex-1 flex-col space-y-1.5">
                <Label className="pl-3" htmlFor="phone">
                  Téléphone
                </Label>
                <Input
                  id="phone"
                  placeholder="Téléphone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="flex justify-between gap-2">
              <div className="flex-1 flex-col space-y-1.5">
                <Label className="pl-3" htmlFor="numberSecu">
                  Numéro de sécurité social
                </Label>
                <Input
                  id="numberSecu"
                  placeholder="Numéro de sécurité social"
                  value={formData.numberSecu}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex-1 flex-col space-y-1.5">
                <Label className="pl-3" htmlFor="email">
                  Email
                </Label>
                <Input
                  id="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="flex justify-between gap-2">
              <div className="flex-1/2 flex-col space-y-1.5">
                <Label className="pl-3" htmlFor="adresse">
                  Adresse
                </Label>
                <Input
                  id="adresse"
                  placeholder="Adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex-1/5 flex-col space-y-1.5">
                <Label className="pl-3" htmlFor="zipcode">
                  Code postal
                </Label>
                <Input
                  id="zipcode"
                  placeholder="Code postal"
                  value={formData.zipcode}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex-1/5 flex-col space-y-1.5">
                <Label className="pl-3" htmlFor="city">
                  Ville
                </Label>
                <Input
                  id="city"
                  placeholder="Ville"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            {/* Type de contrat et durée */}
            <div className="flex justify-between gap-2">
              <div className="flex-1 flex-col space-y-1.5">
                <Label htmlFor="framework">Type de contrat</Label>
                <Select
                  value={formData.framework}
                  onValueChange={(v) => handleSelect("framework", v)}
                >
                  <SelectTrigger id="framework">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {CONTRACT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 flex-col space-y-1.5">
                <Label htmlFor="times">Durée hebdo</Label>
                <Select
                  value={formData.times}
                  onValueChange={(v) => handleSelect("times", v)}
                >
                  <SelectTrigger id="times">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {CONTRACT_TIMES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 flex-col space-y-1.5">
                <Label className="pl-3" htmlFor="hourlyRate">
                  Taux horraire brut
                </Label>
                <Input
                  id="hourlyRate"
                  placeholder="Taux horaire brut"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            {/* Dates de contrat */}
            <div className="flex justify-between gap-2">
              <div className="flex-1 flex-col space-y-1.5">
                <Label htmlFor="startDate">Date de début</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex-1 flex-col space-y-1.5">
                <Label htmlFor="endDate">Date de fin (optionnel)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>
              {/* <div className="flex-1 flex-col space-y-1.5">
                <Label htmlFor="contract">Nom du contrat (optionnel)</Label>
                <Input
                  id="contract"
                  placeholder="Nom du contrat"
                  value={formData.contract}
                  onChange={handleChange}
                />
              </div> */}
              <div className="flex w-full flex-1 flex-col items-center justify-center space-y-1.5">
                <Label htmlFor="isActive">Actif</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(v) => handleSelect("isActive", v)}
                  className={cn(
                    "data-[state=checked]:bg-(--chart-4) data-[state=unchecked]:bg-(--chart-5)",
                  )}
                />
              </div>
              <div className="flex w-full flex-1 flex-col items-center justify-center space-y-1.5">
                <Label htmlFor="mdp">Mot de passe</Label>
                <Input
                  id="mdp"
                  type="password"
                  value={formData.mdp}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-form-type="other"
                  data-lpignore="true"
                />
              </div>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              className={cn("bg-(--chart-5) text-white hover:bg-(--chart-4)")}
              type="submit"
              disabled={loading}
              onClick={() => router.push("/list")}
            >
              {loading ? "Enregistrement..." : "Etape suivante..."}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
