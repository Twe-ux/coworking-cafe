/**
 * ArticleClient Component - apps/site
 * Client component pour la liste des articles avec recherche, filtres et pagination
 */

'use client';

import { useState, useEffect } from 'react';
import { ArticleList } from '@/components/blog/ArticleList';
import { SearchBar } from '@/components/ui/SearchBar';
import { apiClient, handleApiError } from '@/lib/utils/api-client';
import type { ArticlePreview, Category } from '@/types';

export function ArticleClient() {
  const [articles, setArticles] = useState<ArticlePreview[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '6',
        status: 'published',
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      const response = await apiClient.get<{
        articles: ArticlePreview[];
        pages: number;
        total: number;
      }>(`/blog/articles?${params.toString()}`);

      if (response.success && response.data) {
        setArticles(response.data.articles);
        setTotalPages(response.data.pages);
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get<Category[]>('/blog/categories');

      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [page, searchQuery, selectedCategory]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  return (
    <>
      <section className="page-blog__hero">
        <div className="container">
          <h1 className="page-blog__title">Le Mag&apos;</h1>
          <p className="page-blog__subtitle">
            Actualités, conseils et astuces pour le coworking
          </p>
        </div>
      </section>

      <section className="page-blog py__130">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                  <p className="mt-3">Chargement des articles...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger">
                  <h5>Erreur de chargement</h5>
                  <p>
                    Impossible de charger les articles. Veuillez réessayer plus tard.
                  </p>
                </div>
              ) : (
                <>
                  <ArticleList articles={articles} />

                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center gap-2 mt-5">
                      <button
                        className="btn btn-outline-dark"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                      >
                        Précédent
                      </button>
                      <span className="align-self-center px-3">
                        Page {page} sur {totalPages}
                      </span>
                      <button
                        className="btn btn-outline-dark"
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                      >
                        Suivant
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="col-lg-4 mt-5 mt-lg-0">
              <div className="page-blog__sidebar">
                <div className="page-blog__sidebar-section">
                  <h3 className="page-blog__sidebar-title">Rechercher</h3>
                  <SearchBar onSearch={handleSearch} placeholder="Rechercher un article..." />
                </div>

                <div className="page-blog__sidebar-section">
                  <h3 className="page-blog__sidebar-title">Catégories</h3>
                  <div className="page-blog__categories">
                    <button
                      className={`page-blog__category-btn ${
                        selectedCategory === '' ? 'page-blog__category-btn--active' : ''
                      }`}
                      onClick={() => handleCategorySelect('')}
                    >
                      Toutes
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        className={`page-blog__category-btn ${
                          selectedCategory === category.id
                            ? 'page-blog__category-btn--active'
                            : ''
                        }`}
                        onClick={() => handleCategorySelect(category.id)}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
