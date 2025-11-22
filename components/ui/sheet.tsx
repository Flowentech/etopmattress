import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

import { Sheet } from './sheet';

const SheetTrigger = Sheet.Trigger;
const SheetContent = Sheet.Content;
const SheetHeader = Sheet.Header;
const SheetTitle = Sheet.Title;
const SheetDescription = Sheet.Description;

const SheetComponent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>
>(({ children, ...props }, ref) => (
  <SheetTrigger ref={ref} {...props}>
    {children}
  </SheetTrigger>
));
SheetComponent.displayName = SheetTrigger;

const SheetCloseButton = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Close ref={ref} className={cn(
    'absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity-0',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'disabled:pointer-events-none'
  )} {...props}>
    <X className="h-4 w-4" />
  </DialogPrimitive.Close>
));
SheetCloseButton.displayName = 'SheetCloseButton';

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetCloseButton
};