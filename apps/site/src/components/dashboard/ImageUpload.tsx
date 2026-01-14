'use client';

import { useState } from 'react';
import { Button, Spinner, Alert } from 'react-bootstrap';
import Image from 'next/image';

interface ImageUploadProps {
  onImageUpload: (url: string) => void;
  currentImage?: string;
  label?: string;
  folder?: string;
}

const ImageUpload = ({
  onImageUpload,
  currentImage,
  label = "Image à la une",
  folder = "blog"
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(currentImage || '');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Type de fichier invalide. Seuls JPEG, PNG, WebP et GIF sont autorisés.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('La taille du fichier ne doit pas dépasser 10 MB.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'upload');
      }

      const data = await response.json();
      setPreview(data.url);
      onImageUpload(data.url);
    } catch (err: any) {      setError(err.message || 'Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onImageUpload('');
  };

  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {preview ? (
        <div className="position-relative">
          <div className="border rounded p-2 mb-2">
            <img
              src={preview}
              alt="Preview"
              className="img-fluid rounded"
              style={{ maxHeight: '300px', objectFit: 'cover' }}
            />
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={handleRemove}
            disabled={uploading}
          >
            <i className="fa fa-trash me-2"></i>
            Supprimer l'image
          </Button>
        </div>
      ) : (
        <div>
          <input
            type="file"
            className="form-control"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <small className="text-muted d-block mt-1">
            Formats autorisés : JPEG, PNG, WebP, GIF. Taille max : 10 MB
          </small>
        </div>
      )}

      {uploading && (
        <div className="mt-2">
          <Spinner animation="border" size="sm" className="me-2" />
          <span>Upload en cours...</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
