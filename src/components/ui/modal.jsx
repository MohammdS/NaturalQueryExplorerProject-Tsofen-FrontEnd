import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

const Modal = ({ isOpen, onClose, children, className }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className={cn(
          "relative bg-card rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto",
          className
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-10"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        {children}
      </div>
    </div>
  );
};

const ModalHeader = ({ children, className }) => (
  <div className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)}>
    {children}
  </div>
);

const ModalContent = ({ children, className }) => (
  <div className={cn("p-6 pt-0", className)}>
    {children}
  </div>
);

const ModalFooter = ({ children, className }) => (
  <div className={cn("flex items-center justify-end space-x-2 p-6 pt-0", className)}>
    {children}
  </div>
);

const ModalTitle = ({ children, className }) => (
  <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
    {children}
  </h2>
);

const ModalDescription = ({ children, className }) => (
  <p className={cn("text-sm text-muted-foreground", className)}>
    {children}
  </p>
);

export { 
  Modal, 
  ModalHeader, 
  ModalContent, 
  ModalFooter, 
  ModalTitle, 
  ModalDescription 
};
