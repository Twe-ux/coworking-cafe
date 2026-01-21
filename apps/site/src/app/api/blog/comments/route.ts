/**
 * API Route: POST /api/blog/comments
 * Créer un commentaire sur un article
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Comment, Article } from '@coworking-cafe/database';
import type { ApiResponse } from '@/types';

/**
 * Données de la requête
 */
interface CreateCommentRequest {
  articleSlug: string;
  content: string;
  parentId?: string; // Pour les réponses
}

/**
 * POST /api/blog/comments
 * Créer un nouveau commentaire sur un article (nécessite authentification)
 *
 * Body:
 * - articleSlug: string (slug de l'article)
 * - content: string (contenu du commentaire, max 2000 caractères)
 * - parentId?: string (optionnel, pour les réponses)
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ message: string }>>> {
  try {
    // 1. VÉRIFIER L'AUTHENTIFICATION
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vous devez être connecté pour poster un commentaire.',
        },
        { status: 401 }
      );
    }

    // 2. RÉCUPÉRER ET VALIDER LES DONNÉES
    const body: CreateCommentRequest = await request.json();
    const { articleSlug, content, parentId } = body;

    // Validation des données
    if (!articleSlug || !content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le slug de l\'article et le contenu sont requis.',
        },
        { status: 400 }
      );
    }

    // Validation longueur contenu
    if (content.length < 1 || content.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le commentaire doit contenir entre 1 et 2000 caractères.',
        },
        { status: 400 }
      );
    }

    // 3. VÉRIFIER QUE L'ARTICLE EXISTE
    const article = await Article.findOne({
      slug: articleSlug,
      status: 'published',
      isDeleted: false,
    }).lean();

    if (!article) {
      return NextResponse.json(
        {
          success: false,
          error: 'Article introuvable ou non publié.',
        },
        { status: 404 }
      );
    }

    // 4. SI RÉPONSE, VÉRIFIER QUE LE COMMENTAIRE PARENT EXISTE
    if (parentId) {
      const parentComment = await Comment.findById(parentId).lean();

      if (!parentComment) {
        return NextResponse.json(
          {
            success: false,
            error: 'Commentaire parent introuvable.',
          },
          { status: 404 }
        );
      }

      // Vérifier que le parent appartient au même article
      if (parentComment.article.toString() !== article._id.toString()) {
        return NextResponse.json(
          {
            success: false,
            error: 'Le commentaire parent n\'appartient pas à cet article.',
          },
          { status: 400 }
        );
      }
    }

    // 5. CRÉER LE COMMENTAIRE (status: pending par défaut)
    await Comment.create({
      content: content.trim(),
      article: article._id,
      user: session.user.id,
      parent: parentId || null,
      status: 'pending', // Nécessite modération
    });

    return NextResponse.json({
      success: true,
      data: {
        message: 'Votre commentaire a été soumis et sera visible après modération.',
      },
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Une erreur est survenue lors de la création du commentaire.',
      },
      { status: 500 }
    );
  }
}
