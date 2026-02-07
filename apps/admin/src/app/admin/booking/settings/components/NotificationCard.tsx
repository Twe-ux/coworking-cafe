import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";

interface NotificationCardProps {
  email: string;
  onUpdate: (value: string) => void;
}

export function NotificationCard({ email, onUpdate }: NotificationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="notificationEmail">Email de destination</Label>
          <Input
            id="notificationEmail"
            type="email"
            value={email}
            onChange={(e) => onUpdate(e.target.value)}
            placeholder="email"
          />
          <p className="text-xs text-muted-foreground">
            Email pour recevoir les rapports quotidiens
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
