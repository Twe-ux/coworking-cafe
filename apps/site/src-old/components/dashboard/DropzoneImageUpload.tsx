'use client';

import { useState } from 'react';
import { Card, FormLabel, Spinner, Alert } from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import IconifyIcon from './wrappers/IconifyIcon';

interface DropzoneImageUploadProps {
  onImageUpload: (url: string) => void;
  currentImage?: string;
  label?: string;
  folder?: string;
}

const DropzoneImageUpload = ({
  onImageUpload,
  currentImage,
  label = "Image à la une",
  folder = "blog"
}: DropzoneImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(currentImage || '');

  const handleDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
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
      {label && <FormLabel>{label}</FormLabel>}

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {preview ? (
        <Card>
          <Card.Body>
            <div className="position-relative mb-3">
              <img
                src={preview}
                alt="Preview"
                className="img-fluid rounded"
                style={{ maxHeight: '400px', width: '100%', objectFit: 'cover' }}
              />
            </div>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleRemove}
              disabled={uploading}
            >
              <IconifyIcon icon="solar:trash-bin-outline" className="me-2" />
              Supprimer l'image
            </button>
          </Card.Body>
        </Card>
      ) : (
        <Dropzone
          onDrop={handleDrop}
          accept={{
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/webp': ['.webp'],
            'image/gif': ['.gif']
          }}
          maxFiles={1}
          disabled={uploading}
        >
          {({ getRootProps, getInputProps, isDragActive }) => (
            <div
              {...getRootProps()}
              className={`dropzone dropzone-custom py-5 ${isDragActive ? 'border-primary' : ''}`}
              style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
            >
              <div className="dz-message text-center">
                <input {...getInputProps()} disabled={uploading} />
                <IconifyIcon
                  icon="bx:cloud-upload"
                  height={48}
                  width={48}
                  className="mb-3 text-primary"
                />
                <h4 className="mb-2">
                  {uploading
                    ? 'Upload en cours...'
                    : isDragActive
                    ? 'Déposez l\'image ici...'
                    : 'Glissez-déposez votre image ici, ou cliquez pour parcourir'}
                </h4>
                <p className="text-muted fs-13 mb-0">
                  (1600 x 1200 recommandé. Formats PNG, JPG, WebP et GIF autorisés. Max 10 MB)
                </p>
              </div>
            </div>
          )}
        </Dropzone>
      )}

      {uploading && (
        <div className="text-center mt-3">
          <Spinner animation="border" size="sm" className="me-2" />
          <span>Upload en cours...</span>
        </div>
      )}
    </div>
  );
};

export default DropzoneImageUpload;
