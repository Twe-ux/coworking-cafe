import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { NotificationDebug } from "@/components/NotificationDebug";

export const metadata = {
  title: "Debug Notifications | Admin",
  description: "Outil de diagnostic pour les notifications push",
};

export default async function NotificationDebugPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !["dev", "admin"].includes(session.user.role || "")) {
    redirect("/forbidden");
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Debug Notifications</h1>
        <p className="text-muted-foreground mt-2">
          Outil de diagnostic et de test pour les notifications push PWA
        </p>
      </div>

      <NotificationDebug />

      {/* Documentation */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Documentation</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg space-y-2">
            <h3 className="font-semibold text-green-600">✅ Supporté</h3>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Chrome Desktop (Windows, Mac, Linux)</li>
              <li>Edge Desktop</li>
              <li>Firefox Desktop</li>
              <li>Safari Desktop (limité)</li>
              <li>Chrome Android</li>
              <li>Samsung Internet</li>
            </ul>
          </div>

          <div className="p-4 border rounded-lg space-y-2">
            <h3 className="font-semibold text-red-600">❌ Non supporté</h3>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>iOS / iPhone (tous navigateurs)</li>
              <li>iPad OS</li>
              <li>Safari iOS</li>
              <li>Chrome iOS (utilise le moteur Safari)</li>
              <li>Firefox iOS (utilise le moteur Safari)</li>
            </ul>
          </div>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            💡 Alternative pour iOS
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Sur iOS, seule la <strong>Badge API</strong> fonctionne (pastille avec nombre sur l'icône de l'app).
            Pour les notifications réelles, il faudrait développer une app native iOS.
          </p>
        </div>

        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            ⚠️ Safari Desktop
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
            Safari sur macOS a un support limité des notifications push :
          </p>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
            <li>Les notifications locales fonctionnent</li>
            <li>Les push notifications nécessitent Safari 16+ et macOS 13+</li>
            <li>L'utilisateur doit installer la PWA (ajouter à l'écran d'accueil)</li>
            <li>Les permissions système doivent être activées dans Préférences Système → Notifications</li>
          </ul>
        </div>

        <div className="p-4 border rounded-lg space-y-2">
          <h3 className="font-semibold">🔧 Dépannage Safari Desktop</h3>
          <ol className="text-sm space-y-2 list-decimal list-inside">
            <li>
              <strong>Vérifier les permissions système :</strong>
              <p className="ml-6 text-muted-foreground">
                Préférences Système → Notifications → Safari → Autoriser les notifications
              </p>
            </li>
            <li>
              <strong>Installer la PWA :</strong>
              <p className="ml-6 text-muted-foreground">
                Fichier → Ajouter au Dock (Safari 17+)
              </p>
            </li>
            <li>
              <strong>Tester en local d'abord :</strong>
              <p className="ml-6 text-muted-foreground">
                Utilisez le bouton "Test notification locale" ci-dessus
              </p>
            </li>
            <li>
              <strong>Consulter les logs :</strong>
              <p className="ml-6 text-muted-foreground">
                Ouvrez la console (Cmd+Option+C) et regardez les messages [Service Worker] et [Notifications]
              </p>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
