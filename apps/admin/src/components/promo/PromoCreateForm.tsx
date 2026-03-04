"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  promoCreateSchema,
  type PromoCreateFormValues,
} from "@/lib/validations/promo";
import type { CreatePromoCodeRequest } from "@/types/promo";
import { Card } from "../ui/card";

interface PromoCreateFormProps {
  onSubmit: (data: CreatePromoCodeRequest) => Promise<void>;
  loading?: boolean;
}

/**
 * Formulaire de création d'un nouveau code promo avec validation Zod
 */
export function PromoCreateForm({
  onSubmit,
  loading = false,
}: PromoCreateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PromoCreateFormValues>({
    resolver: zodResolver(promoCreateSchema),
    defaultValues: {
      code: "",
      token: crypto.randomUUID(), // Généré automatiquement
      description: "",
      discountType: "percentage",
      discountValue: 0,
      validFrom: new Date().toISOString().split("T")[0],
      validUntil: "",
      maxUses: 0,
    },
  });

  // Fonction pour regénérer le token
  const regenerateToken = () => {
    form.setValue("token", crypto.randomUUID());
  };

  const handleSubmit = async (values: PromoCreateFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit({ ...values, code: values.code.toUpperCase() });
      toast.success("Code promo créé avec succès");
      form.reset({
        code: "",
        token: crypto.randomUUID(), // Nouveau token pour le prochain code
        description: "",
        discountType: "percentage",
        discountValue: 0,
        validFrom: new Date().toISOString().split("T")[0],
        validUntil: "",
        maxUses: 0,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la création"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const discountType = form.watch("discountType");
  const isDisabled = loading || isSubmitting;

  return (
    <Form {...form}>
      <Card className="p-6">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code promo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="SUMMER2026"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                      disabled={isDisabled}
                    />
                  </FormControl>
                  <FormDescription>
                    Majuscules, chiffres, - et _ uniquement
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token unique (généré automatiquement)</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        {...field}
                        readOnly
                        className="bg-muted font-mono text-sm"
                        title="Token unique pour le lien QR"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={regenerateToken}
                      className="border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
                      disabled={isDisabled}
                      title="Regénérer le token"
                    >
                      🔄
                    </Button>
                  </div>
                  <FormDescription>
                    Utilisé pour le lien : /promo/{field.value.slice(0, 8)}...
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Promo été - 20% de réduction"
                    {...field}
                    disabled={isDisabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="discountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de réduction</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isDisabled}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="percentage">
                        Pourcentage (%)
                      </SelectItem>
                      <SelectItem value="fixed">Montant fixe (€)</SelectItem>
                      <SelectItem value="free_item">Article gratuit</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discountValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Valeur{" "}
                    {discountType === "percentage"
                      ? "(%)"
                      : discountType === "fixed"
                      ? "(€)"
                      : ""}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="20"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                      disabled={isDisabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="validFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valide à partir du</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} disabled={isDisabled} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="validUntil"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expire le</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} disabled={isDisabled} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="maxUses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre d'utilisations max</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0 = illimité"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value, 10) || 0)
                    }
                    disabled={isDisabled}
                  />
                </FormControl>
                <FormDescription>0 = utilisations illimitées</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            variant="outline"
            disabled={isDisabled}
            className="w-full border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
          >
            {isSubmitting ? "Création en cours..." : "Créer le code promo"}
          </Button>
        </form>
      </Card>
    </Form>
  );
}
