import { Button } from "@/components/ui/button";
import { ArrowRight, Coffee, MapPin, Shield, Wifi } from "lucide-react";
import Link from "next/link";

/**
 * Page 403 - IP Restricted Access
 *
 * Affichée quand l'accès provient d'une IP non autorisée
 * Design moderne et élégant (style landing page premium)
 * Different de /forbidden (permissions insuffisantes)
 */
export default function IpRestrictedPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-300/30 to-teal-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-300/30 to-blue-300/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-teal-300/20 to-cyan-300/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          {/* Card principale */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20">
            {/* Icône élégante */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                {/* Cercle animé en arrière-plan */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full blur-xl opacity-50 animate-pulse" />

                {/* Icône principale */}
                <div className="relative bg-gradient-to-br from-blue-500 to-teal-500 rounded-full p-6 shadow-lg">
                  <Shield className="w-16 h-16 text-white" strokeWidth={1.5} />
                </div>
              </div>
            </div>

            {/* Titre principal */}
            <div className="text-center mb-6">
              <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Accès Restreint
              </h1>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>Accès depuis une localisation non autorisée</span>
              </div>
            </div>

            {/* Message principal */}
            <div className="text-center mb-8 space-y-4">
              <p className="text-lg text-gray-700 leading-relaxed">
                Cette interface d'administration n'est pas accessible.
              </p>

              <p className="text-base text-gray-600 leading-relaxed">
                Pour des raisons de sécurité, l'accès est restreint.
              </p>
            </div>

            {/* Features du café */}
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl p-6 mb-8 border border-blue-100">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Coffee className="w-5 h-5 text-teal-600" />
                Venez nous rendre visite
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full" />
                  <span>Espaces de coworking modernes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>Wi-Fi ultra rapide</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                  <span>Café et snacks sur place</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full" />
                  <span>Salles de réunion équipées</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center">
              <Button
                asChild
                size="lg"
                className="group bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-base"
              >
                <Link
                  href="https://coworkingcafe.fr"
                  className="flex items-center gap-2"
                >
                  <span>Découvrir notre site</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            {/* Note technique discrète */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-400">Code d'erreur: 403</p>
            </div>
          </div>

          {/* Footer info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
              <Wifi className="w-4 h-4 text-teal-500" />
              <span>
                Besoin d'aide ? Contactez-nous sur{" "}
                <a
                  href="https://coworkingcafe.fr"
                  className="text-teal-600 hover:text-teal-700 font-medium underline decoration-dotted underline-offset-4"
                >
                  notre site web
                </a>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
