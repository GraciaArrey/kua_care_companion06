import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth";

export function SignOutDialog({
  open,
  onOpenChange,
  onConfirmed,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirmed?: () => void;
}) {
  const { signOut, profile } = useAuth();
  const name =
    profile?.caregiver_name?.trim() ||
    (profile?.caregiver_role
      ? profile.caregiver_role.charAt(0).toUpperCase() + profile.caregiver_role.slice(1)
      : "caregiver");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to sign out, {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            You can come back anytime. Your progress, notes and saved places stay safe.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Stay signed in</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              await signOut();
              onConfirmed?.();
            }}
          >
            Sign out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
