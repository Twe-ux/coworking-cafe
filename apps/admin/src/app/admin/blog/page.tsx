import { BookOpen, FolderTree, MessagesSquare, FileText } from "lucide-react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function BlogPage() {
  const modules = [
    {
      title: "Articles",
      description: "Gérer les articles du blog",
      icon: FileText,
      href: "/admin/blog/articles",
      stats: "Créer et modifier",
    },
    {
      title: "Catégories",
      description: "Organiser les articles par catégories",
      icon: FolderTree,
      href: "/admin/blog/categories",
      stats: "Hiérarchie",
    },
    {
      title: "Commentaires",
      description: "Modérer les commentaires des articles",
      icon: MessagesSquare,
      href: "/admin/blog/comments",
      stats: "Modération",
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="w-8 h-8" />
          Blog
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestion des articles, catégories et commentaires
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => (
          <Link key={module.href} href={module.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <module.icon className="w-8 h-8 text-primary" />
                  <span className="text-xs text-muted-foreground">{module.stats}</span>
                </div>
                <CardTitle className="mt-4">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
