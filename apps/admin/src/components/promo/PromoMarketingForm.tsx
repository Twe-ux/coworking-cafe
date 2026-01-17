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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  promoMarketingSchema,
  type PromoMarketingFormValues,
} from "@/lib/validations/promo";
import type { MarketingContent } from "@/types/promo";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  Image as ImageIcon,
  MessageSquare,
  MousePointerClick,
  RotateCcw,
  Save,
  Type,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface PromoMarketingFormProps {
  initialData?: MarketingContent;
  onSubmit: (data: MarketingContent) => Promise<void>;
  loading?: boolean;
}

/**
 * Formulaire d'édition du contenu marketing de la page scan avec validation Zod
 */
export function PromoMarketingForm({
  initialData,
  onSubmit,
  loading = false,
}: PromoMarketingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PromoMarketingFormValues>({
    resolver: zodResolver(promoMarketingSchema),
    defaultValues: {
      title: initialData?.title || "Code Promo Exclusif",
      message: initialData?.message || "Profitez de notre offre spéciale !",
      imageUrl: initialData?.imageUrl || "",
      ctaText: initialData?.ctaText || "Révéler le code",
    },
  });

  const handleSubmit = async (values: PromoMarketingFormValues) => {
    try {
      setIsSubmitting(true);
      const apiData: MarketingContent = {
        ...values,
        imageUrl: values.imageUrl || undefined,
      };
      await onSubmit(apiData);
      toast.success("Contenu marketing mis à jour", {
        description: "Les modifications ont été enregistrées avec succès",
        icon: <Check className="h-4 w-4" />,
      });
    } catch (error) {
      toast.error("Erreur", {
        description:
          error instanceof Error
            ? error.message
            : "Impossible de mettre à jour le contenu",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const messageLength = form.watch("message")?.length || 0;
  const titleLength = form.watch("title")?.length || 0;
  const ctaLength = form.watch("ctaText")?.length || 0;
  const imageUrl = form.watch("imageUrl");
  const isDisabled = loading || isSubmitting;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Contenu Marketing
        </CardTitle>
        <CardDescription>
          Personnalisez le message et l'apparence de la page scan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="flex justify-around">
              {/* Titre */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Type className="h-4 w-4 text-muted-foreground" />
                      Titre de la page
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Code Promo Exclusif"
                        {...field}
                        disabled={isDisabled}
                        className="text-base"
                      />
                    </FormControl>
                    <FormDescription className="flex items-center justify-between">
                      <span>Titre principal affiché en haut de la page</span>
                      <Badge
                        variant={titleLength > 90 ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {titleLength}/100
                      </Badge>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Texte du bouton */}
              <FormField
                control={form.control}
                name="ctaText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                      Texte du bouton
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Révéler le code"
                        {...field}
                        disabled={isDisabled}
                      />
                    </FormControl>
                    <FormDescription className="flex items-center justify-between">
                      <span>Texte affiché sur le bouton d'action</span>
                      <Badge
                        variant={ctaLength > 45 ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {ctaLength}/50
                      </Badge>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Message */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    Message marketing
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='<p class="lead">Vous avez scanné notre QR code exclusif !</p>

                                    <h5 class="mt-4 mb-3">✨ Vos avantages :</h5>
                                    <ul class="list-unstyled">
                                      <li>✅ 10% de réduction sur votre visite</li>
                                      <li>✅ Boissons à volonté incluses</li>
                                      <li>✅ Wifi très haut débit</li>
                                    </ul>'
                      className="min-h-[180px] font-mono text-sm border-code bg-code/10"
                      {...field}
                      disabled={isDisabled}
                    />
                  </FormControl>
                  <FormDescription className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        HTML
                      </Badge>
                      <span className="text-xs">autorisé</span>
                    </span>
                    <Badge
                      variant={
                        messageLength > 900 ? "destructive" : "secondary"
                      }
                      className="text-xs"
                    >
                      {messageLength}/1000
                    </Badge>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image URL */}
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    URL de l'image (optionnel)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://res.cloudinary.com/..."
                      {...field}
                      disabled={isDisabled}
                    />
                  </FormControl>
                  <FormDescription>
                    Image affichée sur la page scan
                  </FormDescription>
                  <FormMessage />

                  {/* Aperçu de l'image */}
                  {imageUrl && (
                    <div className="mt-3 rounded-lg border bg-muted/30 p-4">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        Aperçu
                      </p>
                      <div className="relative h-32 w-32 overflow-hidden rounded-md border bg-background">
                        <Image
                          src={imageUrl}
                          alt="Aperçu"
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={isDisabled}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Réinitialiser
              </Button>
              <Button
                type="submit"
                disabled={isDisabled}
                className="flex-1 gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Mettre à jour le contenu
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
