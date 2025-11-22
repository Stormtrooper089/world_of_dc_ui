import { X } from "lucide-react";
import React, { ReactNode } from "react";

interface DialogBoxProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
  showCloseButton?: boolean;
}

const DialogBox: React.FC<DialogBoxProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "2xl",
  showCloseButton = true,
}) => {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg shadow-2xl ${maxWidthClasses[maxWidth]} w-full max-h-[90vh] flex flex-col border border-purple-200`}
      >
        {/* Header */}
        {title && (
          <div className="flex justify-between items-center p-6 border-b border-purple-200 bg-white/50 rounded-t-lg">
            <h2 className="text-2xl font-bold text-purple-900">{title}</h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-purple-400 hover:text-purple-600 hover:bg-purple-100 rounded-full p-1 transition-colors"
                aria-label="Close dialog"
              >
                <X className="h-6 w-6" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-purple-50/50 to-indigo-50/50">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DialogBox;
