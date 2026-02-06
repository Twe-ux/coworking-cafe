import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EmployeeInfo } from "@/types/cashRegister";

interface AdminUser {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clockedEmployees: EmployeeInfo[];
  adminUsers: AdminUser[];
  submitting: boolean;
  selectedAdmin: AdminUser | null;
  adminPin: string;
  pinError: string | null;
  onEmployeeSelect: (employeeId: string) => void;
  onAdminSelect: (admin: AdminUser) => void;
  onAdminPinChange: (pin: string) => void;
  onAdminConfirm: () => void;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  clockedEmployees,
  adminUsers,
  submitting,
  selectedAdmin,
  adminPin,
  pinError,
  onEmployeeSelect,
  onAdminSelect,
  onAdminPinChange,
  onAdminConfirm,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Qui a compté la caisse ?</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Employés pointés */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Employés pointés :</p>
            {clockedEmployees.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {clockedEmployees.map((emp) => (
                  <Button
                    key={emp.id}
                    variant="outline"
                    onClick={() => onEmployeeSelect(emp.id)}
                    disabled={submitting}
                    className="w-full text-sm h-9"
                  >
                    {emp.firstName} {emp.lastName?.charAt(0)}.
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic py-2">
                Aucun employé pointé actuellement
              </p>
            )}
          </div>

          {/* Admin/Dev avec sélection + PIN */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Admin / Gérant :</p>

            {/* Sélection admin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {adminUsers.map((admin) => (
                <Button
                  key={admin._id}
                  variant={
                    selectedAdmin?._id === admin._id ? "default" : "outline"
                  }
                  onClick={() => onAdminSelect(admin)}
                  disabled={submitting}
                  className="w-full text-sm"
                >
                  {admin.name}
                </Button>
              ))}
            </div>

            {/* Input PIN si admin sélectionné */}
            {selectedAdmin && (
              <div className="space-y-2 pt-2">
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={adminPin}
                  onChange={(e) => onAdminPinChange(e.target.value.replace(/\D/g, ""))}
                  placeholder="Code PIN (6 chiffres)"
                  className="text-center text-lg tracking-widest"
                  onFocus={(e) => e.target.select()}
                />
                {pinError && (
                  <p className="text-xs text-destructive">{pinError}</p>
                )}
                <Button
                  onClick={onAdminConfirm}
                  disabled={submitting || adminPin.length !== 6}
                  className="w-full"
                >
                  Confirmer
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
