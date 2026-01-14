import ArticleRevision from '@/models/articleRevision';
import type { ArticleDocument } from '@/models/article/document';
import mongoose, { ObjectId } from 'mongoose';

/**
 * Create a revision snapshot of an article before updating it
 */
export async function createArticleRevision(
  article: ArticleDocument,
  author: mongoose.Types.ObjectId,
  changeDescription?: string
): Promise<void> {
  try {
    // Get the current revision number
    const lastRevision = await ArticleRevision.findOne({
      article: article._id,
    })
      .sort({ revisionNumber: -1 })
      .select('revisionNumber')
      .lean();

    const revisionNumber = (lastRevision?.revisionNumber || 0) + 1;

    // Create revision snapshot
    await ArticleRevision.create({
      article: article._id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      featuredImage: article.featuredImage,
      featuredImageAlt: article.featuredImageAlt,
      category: article.category,
      status: article.status,
      publishedAt: article.publishedAt,
      scheduledFor: article.scheduledFor,
      metaTitle: article.metaTitle,
      metaDescription: article.metaDescription,
      metaKeywords: article.metaKeywords,
      author,
      revisionNumber,
      changeDescription,
    });
  } catch (error) {    // Don't throw error - revision creation should not break article update
  }
}

/**
 * Restore an article from a specific revision
 */
export async function restoreArticleRevision(
  article: ArticleDocument,
  revisionNumber: number
): Promise<boolean> {
  try {
    const revision = await ArticleRevision.findOne({
      article: article._id,
      revisionNumber,
    });

    if (!revision) {
      return false;
    }

    // Update article with revision data
    article.title = revision.title;
    article.slug = revision.slug;
    article.content = revision.content;
    article.excerpt = revision.excerpt;
    article.featuredImage = revision.featuredImage;
    article.featuredImageAlt = revision.featuredImageAlt;
    if (revision.category) {
      article.category = revision.category as unknown as ObjectId;
    }
    article.metaTitle = revision.metaTitle;
    article.metaDescription = revision.metaDescription;
    article.metaKeywords = revision.metaKeywords ?? [];

    await article.save();
    return true;
  } catch (error) {    return false;
  }
}
