import { X } from "lucide-react";
import React, { useEffect } from "react";

interface DialogBoxProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footer?: React.ReactNode;
  maxWidth?: string;
  showHeader?: boolean;
}

const DialogBox: React.FC<DialogBoxProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  footer,
  maxWidth,
  showHeader = true,
}) => {
  // Handle ESC key press
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-full mx-4",
  };

  const widthClass = maxWidth ? `max-w-[${maxWidth}]` : sizeClasses[size];

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "dialog-title" : undefined}
    >
      <div
        className={`bg-purple-50/95 backdrop-blur-md rounded-2xl border border-purple-200/40 shadow-2xl w-full ${widthClass} max-h-[90vh] flex flex-col overflow-hidden ${className}`}
      >
        {/* Header */}
        {showHeader && (title || showCloseButton) && (
          <div
            className={`bg-gradient-to-r from-purple-500 to-purple-400 px-6 py-4 flex justify-between items-center ${headerClassName}`}
          >
            {title && (
              <h2
                id="dialog-title"
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "inherit" }}
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60 rounded"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div
          className={`flex-1 overflow-y-auto px-6 py-5 bg-purple-50/50 ${bodyClassName}`}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="bg-gray-50 border-t border-gray-100 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default DialogBox;
