'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { StaffNote, NoteDestination, StaffNoteCreateData } from '@/types/staffNote'
import { triggerSidebarRefresh } from '@/lib/events/sidebar-refresh'

function getQueryKey(destination: NoteDestination) {
  return ['staff-notes', destination]
}

async function fetchNotes(destination: NoteDestination): Promise<StaffNote[]> {
  const res = await fetch(`/api/staff-notes?destination=${destination}`)
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'Erreur chargement notes')
  return data.data
}

async function createNote(payload: StaffNoteCreateData): Promise<StaffNote> {
  const res = await fetch('/api/staff-notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok || !data.success) throw new Error(data.error || 'Erreur envoi')
  return data.data
}

async function markNoteRead(id: string): Promise<void> {
  const res = await fetch(`/api/staff-notes/${id}`, { method: 'PATCH' })
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'Erreur mise à jour')
}

async function deleteNote(id: string): Promise<void> {
  const res = await fetch(`/api/staff-notes/${id}`, { method: 'DELETE' })
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'Erreur suppression')
}

export function useStaffNotes(destination: NoteDestination, { fetchEnabled = true }: { fetchEnabled?: boolean } = {}) {
  const queryClient = useQueryClient()
  const queryKey = getQueryKey(destination)

  const { data: notes = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchNotes(destination),
    staleTime: 30_000,
    enabled: fetchEnabled,
  })

  const sendMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      if (destination === 'admin') triggerSidebarRefresh()
      void queryClient.invalidateQueries({ queryKey })
    },
    // No onError — NotepadNoteForm handles errors via mutateAsync try/catch to avoid double toasts
  })

  const markReadMutation = useMutation({
    mutationFn: markNoteRead,
    onSuccess: (_data, id) => {
      queryClient.setQueryData<StaffNote[]>(queryKey, (prev = []) =>
        prev.filter((n) => n.id !== id)
      )
    },
    onError: () => toast.error('Impossible de marquer comme lu'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: (_data, id) => {
      queryClient.setQueryData<StaffNote[]>(queryKey, (prev = []) =>
        prev.filter((n) => n.id !== id)
      )
      triggerSidebarRefresh()
    },
    onError: () => toast.error('Impossible de supprimer'),
  })

  return {
    notes,
    isLoading,
    sendNote: sendMutation.mutateAsync,
    isSending: sendMutation.isPending,
    markRead: markReadMutation.mutate,
    deleteNote: deleteMutation.mutate,
  }
}
