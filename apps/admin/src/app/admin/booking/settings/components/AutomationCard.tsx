import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock } from "lucide-react"

interface AutomationCardProps {
  attendanceCheckTime: string
  dailyReportTime: string
  onUpdateAttendanceTime: (value: string) => void
  onUpdateReportTime: (value: string) => void
}

export function AutomationCard({
  attendanceCheckTime,
  dailyReportTime,
  onUpdateAttendanceTime,
  onUpdateReportTime,
}: AutomationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Automatisations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="attendanceCheckTime">
            Vérification présence (réservations J-1)
          </Label>
          <Input
            id="attendanceCheckTime"
            type="time"
            value={attendanceCheckTime}
            onChange={(e) => onUpdateAttendanceTime(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Heure de vérification automatique des présences
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dailyReportTime">Email récapitulatif quotidien</Label>
          <Input
            id="dailyReportTime"
            type="time"
            value={dailyReportTime}
            onChange={(e) => onUpdateReportTime(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Heure d'envoi du récapitulatif des réservations
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
