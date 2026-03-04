"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, FolderOpen } from "lucide-react";

export default function BlogPage() {
  const sections = [
    {
      title: "Articles",
      description: "Gérer les articles du blog",
      icon: BookOpen,
      href: "/admin/blog/articles",
    },
    {
      title: "Catégories",
      description: "Gérer les catégories d'articles",
      icon: FolderOpen,
      href: "/admin/blog/categories",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Blog</h1>
        <p className="text-muted-foreground">
          Gérer le contenu du blog
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href}>
              <Card className="hover:bg-green-50 hover:border-green-500 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle>{section.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {section.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
