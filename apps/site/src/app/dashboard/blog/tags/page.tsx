'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Button, Table, Modal, Form, Spinner, Badge } from 'react-bootstrap';
import {
  useGetTagsQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} from '@/store/api/blogApi';
import { useNotification } from '@/hooks/useNotification';
import IconifyIcon from '@/components/dashboard/wrappers/IconifyIcon';

const TagsPage = () => {
  const { data, isLoading, error } = useGetTagsQuery({ limit: 100 });
  const [createTag, { isLoading: isCreating }] = useCreateTagMutation();
  const [updateTag, { isLoading: isUpdating }] = useUpdateTagMutation();
  const [deleteTag, { isLoading: isDeleting }] = useDeleteTagMutation();
  const { success, error: showError } = useNotification();

  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6c757d',
  });

  const handleOpenModal = (tag?: any) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({
        name: tag.name,
        description: tag.description || '',
        color: tag.color || '#6c757d',
      });
    } else {
      setEditingTag(null);
      setFormData({
        name: '',
        description: '',
        color: '#6c757d',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTag(null);
    setFormData({ name: '', description: '', color: '#6c757d' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTag) {
        await updateTag({
          id: editingTag._id,
          data: formData,
        }).unwrap();
        success('Tag mis à jour avec succès');
      } else {
        await createTag(formData).unwrap();
        success('Tag créé avec succès');
      }
      handleCloseModal();
    } catch (err: any) {
      showError(err?.data?.error || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce tag ?')) {
      return;
    }

    try {
      await deleteTag(id).unwrap();
      success('Tag supprimé avec succès');
    } catch (err: any) {
      showError(err?.data?.error || 'Erreur lors de la suppression');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-3">Chargement des tags...</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <CardTitle as="h4" className="mb-0">Gestion des Tags</CardTitle>
          <Button variant="primary" onClick={() => handleOpenModal()}>
            <IconifyIcon icon="solar:add-circle-outline" className="me-2" />
            Nouveau Tag
          </Button>
        </CardHeader>
        <CardBody>
          {error ? (
            <div className="alert alert-danger">
              Erreur lors du chargement des tags
            </div>
          ) : !data?.tags || data.tags.length === 0 ? (
            <div className="text-center py-5">
              <IconifyIcon icon="solar:tag-outline" className="fs-48 text-muted mb-3" />
              <h5>Aucun tag</h5>
              <p className="text-muted mb-3">
                Commencez par créer votre premier tag
              </p>
              <Button variant="primary" onClick={() => handleOpenModal()}>
                Créer un tag
              </Button>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Description</th>
                  <th>Couleur</th>
                  <th>Articles</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.tags.map((tag) => (
                  <tr key={tag._id}>
                    <td>
                      <strong>{tag.name}</strong>
                    </td>
                    <td>{tag.description || <span className="text-muted">-</span>}</td>
                    <td>
                      <Badge
                        style={{
                          backgroundColor: tag.color || '#6c757d',
                          color: '#fff',
                        }}
                      >
                        {tag.color || '#6c757d'}
                      </Badge>
                    </td>
                    <td>{tag.articleCount || 0}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleOpenModal(tag)}
                      >
                        <IconifyIcon icon="solar:pen-outline" />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(tag._id)}
                        disabled={isDeleting}
                      >
                        <IconifyIcon icon="solar:trash-bin-outline" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingTag ? 'Modifier le tag' : 'Nouveau tag'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nom *</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Nom du tag"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du tag"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Couleur</Form.Label>
              <div className="d-flex gap-2 align-items-center">
                <Form.Control
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  style={{ width: '60px', height: '40px' }}
                />
                <Form.Control
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#6c757d"
                />
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default TagsPage;
