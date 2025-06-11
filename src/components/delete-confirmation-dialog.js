import * as React from 'react'; // React is required for JSX
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog"; // Adjust path as per your project structure
import { Button } from "./ui/button"; // Adjust path as per your project structure

// Import Lucide-React icon (ensure 'lucide-react' is installed in your project)
import { Trash2 } from "lucide-react";

// --- JSDoc Type Definitions ---
/**
 * @typedef {'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'} ButtonVariant
 */

/**
 * @typedef {'default' | 'sm' | 'lg' | 'icon'} ButtonSize
 */

/**
 * @typedef {Object} ButtonProps
 * @property {ButtonVariant} [variant]
 * @property {ButtonSize} [size]
 */

/**
 * @typedef {Object} DeleteConfirmationDialogProps
 * @property {() => void} onConfirm - Function to call when deletion is confirmed.
 * @property {string} [itemName="this item"] - The name of the item being deleted.
 * @property {React.ReactNode} [trigger] - Optional custom trigger element. If not provided, a default button with a Trash2 icon is used.
 * @property {ButtonVariant} [triggerVariant="destructive"] - Variant for the default trigger button.
 * @property {ButtonSize} [triggerSize="icon"] - Size for the default trigger button.
 */

/**
 * A dialog component to confirm deletion actions.
 * This component expects the actual UI components (AlertDialog, Button) to be imported from your project's component library.
 *
 * @param {DeleteConfirmationDialogProps} props
 */
export function DeleteConfirmationDialog({
  onConfirm,
  itemName = "this item",
  trigger,
  triggerVariant = "destructive",
  triggerSize = "icon",
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant={triggerVariant} size={triggerSize}>
            <Trash2 className="h-4 w-4" />
            {/* The sr-only class is typically for screen readers, hiding text visually */}
            <span className="sr-only">Delete {itemName}</span>
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete {itemName} and remove its data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={triggerVariant === 'destructive' ? buttonVariants({ variant: "destructive" }) : ""}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Helper from button.tsx - Shadcn typically defines this internally.
// This function returns Tailwind CSS classes based on the button variant.
// If your project doesn't use Tailwind, you'll need to adapt this to your CSS methodology.
/**
 * Helper function to determine button-specific classes based on variant.
 * @param {{variant: ButtonVariant}} param0
 * @returns {string} CSS classes string
 */
const buttonVariants = ({ variant }) => {
  if (variant === "destructive") return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
  return ""; // Return an empty string if no specific variant class is needed
};

// Assigning a display name is good practice for React DevTools.
DeleteConfirmationDialog.displayName = "DeleteConfirmationDialog";