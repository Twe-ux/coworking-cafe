export type NoteDestination = 'staff' | 'admin'

export interface StaffNote {
  id: string
  destination: NoteDestination
  content: string
  senderEmployeeId: string
  senderName: string
  createdAt: string
  isRead: boolean
  readAt?: string
}

export interface StaffNoteCreateData {
  destination: NoteDestination
  content: string
  pin: string
}
