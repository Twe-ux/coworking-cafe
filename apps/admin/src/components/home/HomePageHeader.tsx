import { CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

/**
 * Header de la page d'accueil
 * - Logo avec lien vers /admin
 * - Titre
 * - Date du jour
 *
 * Respecte CLAUDE.md : Composant < 200 lignes
 */
export function HomePageHeader() {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <div className="flex aspect-square size-12 items-center justify-center rounded-lg overflow-hidden shrink-0">
            <Image
              src="/logo/logo-circle.webp"
              alt="CoworKing Café"
              width={48}
              height={48}
              className="object-cover"
            />
          </div>
        </Link>
        <div>
          <CardTitle className="text-2xl">CoworKing Café</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Vue d'ensemble de la journée -{" "}
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </CardHeader>
  );
}
