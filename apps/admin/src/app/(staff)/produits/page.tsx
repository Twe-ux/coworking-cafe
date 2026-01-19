import { redirect } from 'next/navigation'

/**
 * Page d'accueil du menu - Redirige vers les recettes
 */
export default function MenuPage() {
  redirect('/menu/recipes')
}
