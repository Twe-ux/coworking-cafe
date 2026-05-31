"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStaffNotes } from "@/hooks/useStaffNotes";
import { Bell, NotebookPen, Shield, Users } from "lucide-react";
import { NotepadNoteForm } from "./NotepadNoteForm";
import { NotepadStaffInbox } from "./NotepadStaffInbox";

export function StaffNotepad() {
  const { notes } = useStaffNotes("staff");
  const unreadCount = notes.length;
  const hasMessages = unreadCount > 0;

  return (
    <Card className="bg-orange-50/50">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <NotebookPen className="h-4 w-4 text-orange-500" />
          Évènements à signaler
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3">
        <Tabs defaultValue="staff">
          <TabsList className="w-full h-8 mb-3 flex">
            <TabsTrigger
              value="staff"
              className={`text-xs h-7 gap-1.5 ${hasMessages ? "flex-[2]" : "flex-1"}`}
            >
              <Users className="h-3.5 w-3.5" />
              Pour l&apos;équipe
            </TabsTrigger>
            <TabsTrigger
              value="admin"
              className={`text-xs h-7 gap-1.5 ${hasMessages ? "flex-[2]" : "flex-1"}`}
            >
              <Shield className="h-3.5 w-3.5" />
              Pour l&apos;admin
            </TabsTrigger>
            {/* Onglet Message — demi-largeur, à droite, visible si messages non lus */}
            {hasMessages && (
              <TabsTrigger
                value="messages"
                className="flex-[1] text-xs h-7 gap-1 relative"
              >
                <Bell className="h-3 w-3" />
                <span className="hidden sm:inline">Message</span>
                <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] bg-blue-500 pointer-events-none">
                  {unreadCount}
                </Badge>
              </TabsTrigger>
            )}
          </TabsList>

          {hasMessages && (
            <TabsContent value="messages" className="mt-0">
              <NotepadStaffInbox />
            </TabsContent>
          )}

          <TabsContent value="staff" className="mt-0">
            <NotepadNoteForm destination="staff" />
          </TabsContent>

          <TabsContent value="admin" className="mt-0">
            <NotepadNoteForm destination="admin" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
