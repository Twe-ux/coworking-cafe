/**
 * Print Requests Page
 * Display and manage print requests from clients
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Download, CheckCircle, FileText, RefreshCw } from 'lucide-react';

interface PrintAttachment {
  filename: string;
  contentType: string;
  size: number;
  sizeFormatted: string;
}

interface PrintRequest {
  id: string;
  from: string;
  subject: string;
  date: string;
  text?: string;
  attachments: PrintAttachment[];
  status: 'pending' | 'processed';
  uid?: number;
}

interface PrintStats {
  pending: number;
  totalAttachments: number;
}

export default function PrintRequestsPage() {
  const [requests, setRequests] = useState<PrintRequest[]>([]);
  const [stats, setStats] = useState<PrintStats>({ pending: 0, totalAttachments: 0 });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/print-requests');
      const result = await response.json();

      if (result.success) {
        setRequests(result.data.requests);
        setStats(result.data.stats);
      }
    } catch (error) {
      console.error('Error fetching print requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDownload = async (requestId: string, filename: string) => {
    try {
      const response = await fetch(
        `/api/print-requests/${requestId}/download?filename=${encodeURIComponent(filename)}`
      );

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Erreur lors du téléchargement');
    }
  };

  const handleMarkProcessed = async (requestId: string) => {
    setProcessing(requestId);
    try {
      const response = await fetch(`/api/print-requests/${requestId}/mark-processed`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        // Refresh list
        await fetchRequests();
      } else {
        alert('Erreur lors du marquage comme traité');
      }
    } catch (error) {
      console.error('Error marking as processed:', error);
      alert('Erreur lors du marquage comme traité');
    } finally {
      setProcessing(null);
    }
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.includes('pdf')) return '📄';
    if (contentType.includes('word')) return '📝';
    if (contentType.includes('excel')) return '📊';
    if (contentType.includes('image')) return '🖼️';
    return '📎';
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Printer className="h-8 w-8" />
            Demandes d'Impression
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez les documents envoyés par vos clients pour impression
          </p>
        </div>

        <Button onClick={fetchRequests} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demandes en attente</CardTitle>
            <Printer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents à imprimer</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAttachments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      {loading && requests.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Chargement...</p>
          </CardContent>
        </Card>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Printer className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Aucune demande d'impression en attente</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{request.subject}</CardTitle>
                    <CardDescription>
                      De : {request.from} • {new Date(request.date).toLocaleString('fr-FR')}
                    </CardDescription>
                  </div>
                  <Badge variant={request.status === 'processed' ? 'secondary' : 'default'}>
                    {request.status === 'processed' ? 'Traité' : 'En attente'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                {request.text && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {request.text}
                  </p>
                )}

                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {request.attachments.length} document(s) à imprimer :
                  </p>

                  <div className="space-y-2">
                    {request.attachments.map((attachment, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-muted p-3 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {getFileIcon(attachment.contentType)}
                          </span>
                          <div>
                            <p className="font-medium text-sm">{attachment.filename}</p>
                            <p className="text-xs text-muted-foreground">
                              {attachment.sizeFormatted}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(request.id, attachment.filename)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Télécharger
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => {
                              handleDownload(request.id, attachment.filename);
                              // Auto-open print dialog after download
                              setTimeout(() => window.print(), 500);
                            }}
                          >
                            <Printer className="h-4 w-4 mr-1" />
                            Imprimer
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="secondary"
                      onClick={() => handleMarkProcessed(request.id)}
                      disabled={processing === request.id}
                      className="w-full"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {processing === request.id
                        ? 'Traitement...'
                        : 'Marquer comme traité'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
