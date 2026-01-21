# Composants Blog - apps/site

Documentation des composants Blog créés le 2026-01-21.

## Vue d'ensemble

4 composants React pour gérer l'affichage des articles et des commentaires :

- **ArticleCard** : Card individuelle d'article
- **ArticleList** : Grid responsive de cards
- **CommentForm** : Formulaire de commentaire
- **CommentSection** : Section complète avec liste + formulaire

## ArticleCard

### Props

```typescript
interface ArticleCardProps {
  article: ArticlePreview;
}
```

### Utilisation

```tsx
import { ArticleCard } from '@/components/blog';

<ArticleCard article={article} />
```

### Fonctionnalités

- Image cover avec next/image (lazy loading)
- Badge catégorie
- Titre et excerpt (tronqué automatiquement par CSS)
- Date de publication formatée en français
- Nombre de vues (affiché si > 0)
- Temps de lecture en minutes
- Link vers `/blog/[slug]`

### Styles requis

Classes SCSS à créer dans `styles/components/_article-card.scss` :

```scss
.article-card {
  // Container
  &__link { }

  // Image section
  &__image-wrapper { }
  &__image { }
  &__category { }

  // Content
  &__content { }
  &__title { }
  &__excerpt {
    display: -webkit-box;
    -webkit-line-clamp: 2;  // Tronquer à 2 lignes
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  // Meta
  &__meta { }
  &__meta-date { }
  &__meta-stats { }
  &__meta-views { }
  &__meta-read-time { }
}
```

---

## ArticleList

### Props

```typescript
interface ArticleListProps {
  articles: ArticlePreview[];
}
```

### Utilisation

```tsx
import { ArticleList } from '@/components/blog';

<ArticleList articles={articles} />
```

### Fonctionnalités

- Grid responsive : 1 col mobile, 2 cols tablet, 3 cols desktop
- Empty state si aucun article
- Gap entre les cards

### Styles requis

```scss
.article-list {
  &__grid {
    display: grid;
    gap: 2rem;

    // Mobile (1 col)
    grid-template-columns: 1fr;

    // Tablet (2 cols)
    @media (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }

    // Desktop (3 cols)
    @media (min-width: 1024px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &--empty { }
  &__empty-message { }
}
```

---

## CommentForm

### Props

```typescript
interface CommentFormProps {
  articleSlug: string;
  parentId?: string;        // Pour les réponses (nested comments)
  onSuccess?: () => void;   // Callback après succès
}
```

### Utilisation

```tsx
import { CommentForm } from '@/components/blog';

// Commentaire principal
<CommentForm
  articleSlug="article-slug"
  onSuccess={() => console.log('Commentaire publié')}
/>

// Réponse à un commentaire
<CommentForm
  articleSlug="article-slug"
  parentId="comment-id-123"
  onSuccess={() => fetchComments()}
/>
```

### Fonctionnalités

- Textarea avec validation (min 10 caractères)
- Gestion loading state
- Gestion erreurs
- Message de succès temporaire (2s)
- Appel API `POST /api/blog/[slug]/comments`
- Reset automatique après succès

### Validations

- Contenu requis
- Min 10 caractères
- Max 500 caractères (via CSS)

### Styles requis

```scss
.comment-form {
  &__field { }
  &__label { }
  &__textarea {
    &--error { }
  }
  &__error { }
  &__actions { }
  &__submit {
    &:disabled { }
  }
  &__success { }
}
```

---

## CommentSection

### Props

```typescript
interface CommentSectionProps {
  articleSlug: string;
}
```

### Utilisation

```tsx
import { CommentSection } from '@/components/blog';

<CommentSection articleSlug="article-slug" />
```

### Fonctionnalités

- Fetch automatique des commentaires au mount
- Affichage du nombre de commentaires
- Vérification session utilisateur (NextAuth)
- Formulaire principal (si connecté)
- Message "Connectez-vous" (si non connecté)
- Liste des commentaires avec réponses (nested)
- Bouton "Répondre" sur chaque commentaire (sauf nested)
- Refresh automatique après nouveau commentaire
- Loading state
- Error state
- Empty state

### Nested Comments

Les réponses (replies) sont affichées en dessous du commentaire parent avec un style visuel différent (classe `comment--nested`).

### Styles requis

```scss
.comment-section {
  &__title { }
  &__form { }
  &__login-message { }
  &__loading { }
  &__error { }
  &__empty { }
  &__list { }
}

.comment {
  &--nested {
    margin-left: 2rem;  // Indentation
  }

  &__header { }
  &__author { }
  &__author-avatar { }
  &__author-name { }
  &__date { }
  &__content { }
  &__actions { }
  &__likes { }
  &__reply-btn { }
  &__reply-form { }
  &__replies { }
}
```

---

## API Routes requises

Les composants nécessitent les routes API suivantes :

### GET /api/blog/[slug]/comments

Récupérer les commentaires d'un article.

**Response:**
```typescript
{
  success: true,
  data: ArticleComment[]
}
```

### POST /api/blog/[slug]/comments

Créer un nouveau commentaire.

**Request Body:**
```typescript
{
  articleSlug: string,
  content: string,
  parentId?: string
}
```

**Response:**
```typescript
{
  success: true,
  data: ArticleComment
}
```

---

## Exemple de page complète

```tsx
// app/(site)/blog/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { Article } from '@coworking-cafe/database';
import { CommentSection } from '@/components/blog';

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await Article.findOne({ slug: params.slug, status: 'published' });

  if (!article) {
    notFound();
  }

  return (
    <article className="page-article">
      <header>
        <h1>{article.title}</h1>
        <p>{article.excerpt}</p>
      </header>

      <div dangerouslySetInnerHTML={{ __html: article.content }} />

      <CommentSection articleSlug={article.slug} />
    </article>
  );
}
```

```tsx
// app/(site)/blog/page.tsx
import { Article } from '@coworking-cafe/database';
import { ArticleList } from '@/components/blog';

export default async function BlogPage() {
  const articles = await Article.find({ status: 'published' })
    .populate('category', 'name slug')
    .sort({ publishedAt: -1 })
    .lean();

  // Mapper les données pour correspondre à ArticlePreview
  const articlesPreview = articles.map(article => ({
    id: article._id.toString(),
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    coverImage: article.coverImage,
    category: {
      id: article.category._id.toString(),
      name: article.category.name,
      slug: article.category.slug
    },
    tags: article.tags,
    publishedAt: article.publishedAt,
    views: article.views,
    readTime: article.readTime
  }));

  return (
    <main className="page-blog">
      <h1>Blog</h1>
      <ArticleList articles={articlesPreview} />
    </main>
  );
}
```

---

## Notes importantes

### TypeScript

- **Zéro `any` types** : Tous les composants sont strictement typés
- Types importés depuis `@/types`
- Props interfaces explicites

### Performance

- Images avec `next/image` (lazy loading automatique)
- Fetch côté serveur quand possible
- Client components uniquement si interactivité requise

### Responsive

- Grid responsive dans ArticleList
- Styles SCSS à adapter selon la charte graphique

### Sécurité

- Sanitisation du contenu HTML (dangerouslySetInnerHTML uniquement pour contenu édité dans admin)
- Validation côté client ET serveur
- Auth requise pour poster des commentaires

---

## Checklist intégration

- [ ] Créer les styles SCSS correspondants
- [ ] Créer les API routes (`/api/blog/[slug]/comments`)
- [ ] Tester responsive (mobile, tablet, desktop)
- [ ] Vérifier NextAuth configuration
- [ ] Tester avec données réelles
- [ ] Vérifier accessibilité (labels, alt text)
- [ ] Optimiser images (WebP/AVIF)

---

_Documentation créée le 2026-01-21_
