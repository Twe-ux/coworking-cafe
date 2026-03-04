"use client";

import { Terminal, Bell, Database, FileText, Wrench } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function DevToolsClient() {
  const tools = [
    {
      title: "Notifications",
      description: "Tester et déboguer le système de notifications push et badge",
      icon: Bell,
      href: "/admin/debug/notifications",
      status: "Actif",
    },
    {
      title: "Database",
      description: "Explorer et gérer la base de données MongoDB",
      icon: Database,
      href: "/admin/dev/database",
      status: "À venir",
      disabled: true,
    },
    {
      title: "Logs",
      description: "Consulter les logs de l'application en temps réel",
      icon: FileText,
      href: "/admin/dev/logs",
      status: "À venir",
      disabled: true,
    },
    {
      title: "API Tester",
      description: "Tester les endpoints API directement depuis l'interface",
      icon: Wrench,
      href: "/admin/dev/api-tester",
      status: "À venir",
      disabled: true,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Terminal className="w-8 h-8" />
          Dev Tools
        </h1>
        <p className="text-muted-foreground mt-2">
          Outils de développement et de débogage pour les développeurs
        </p>
      </div>

      <div className="space-y-3">
        {tools.map((tool) => {
          if (tool.disabled) {
            return (
              <div key={tool.href}>
                <Card className="transition-colors opacity-50 cursor-not-allowed">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <tool.icon className="w-5 h-5" />
                        {tool.title}
                      </CardTitle>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {tool.status}
                      </span>
                    </div>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            );
          }

          return (
            <Link key={tool.href} href={tool.href}>
              <Card className="transition-colors hover:bg-green-50 hover:border-green-500 cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <tool.icon className="w-5 h-5" />
                      {tool.title}
                    </CardTitle>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        tool.status === "Actif"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {tool.status}
                    </span>
                  </div>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
          💡 Information
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Cette section est réservée aux développeurs. Les outils marqués "À venir" seront implémentés progressivement.
        </p>
      </div>
    </div>
  );
}
