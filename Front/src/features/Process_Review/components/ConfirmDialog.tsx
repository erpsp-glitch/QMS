import { useEffect, useRef } from "react";
import { FiAlertTriangle, FiX, FiInfo } from "react-icons/fi";

interface Props {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  showIcon?: boolean;
}

export default function ConfirmDialog({ 
  message, 
  onConfirm, 
  onCancel, 
  title = "Confirm Action",
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger",
  showIcon = true
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      } else if (e.key === "Enter") {
        onConfirm();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onConfirm, onCancel]);

  // Focus the confirm button when dialog opens
  useEffect(() => {
    if (confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
  }, []);

  // Get variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return {
          bg: "bg-amber-50",
          icon: "text-amber-500",
          button: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
          border: "border-amber-200"
        };
      case "info":
        return {
          bg: "bg-blue-50",
          icon: "text-blue-500",
          button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
          border: "border-blue-200"
        };
      case "danger":
      default:
        return {
          bg: "bg-red-50",
          icon: "text-red-500",
          button: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
          border: "border-red-200"
        };
    }
  };

  const variantStyles = getVariantStyles();

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 px-4 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn">
      <div 
        ref={dialogRef}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scaleIn border border-gray-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <div className={`flex items-start mb-4 p-4 rounded-lg ${variantStyles.bg} ${variantStyles.border}`}>
          {showIcon && (
            <div className={`flex-shrink-0 mr-3 ${variantStyles.icon}`}>
              {variant === "info" ? (
                <FiInfo className="w-6 h-6" />
              ) : (
                <FiAlertTriangle className="w-6 h-6" />
              )}
            </div>
          )}
          <div className="flex-1">
            <h2 
              id="dialog-title"
              className="text-lg font-semibold text-gray-800 mb-1"
            >
              {title}
            </h2>
            <p 
              id="dialog-description"
              className="text-gray-600"
            >
              {message}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 ml-4"
            aria-label="Close dialog"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row-reverse justify-end gap-3 mt-6">
          <button
            ref={confirmButtonRef}
            onClick={onConfirm}
            className={`px-5 py-2.5 text-white font-medium rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${variantStyles.button}`}
            autoFocus
          >
            {confirmText}
          </button>
          <button
            onClick={onCancel}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            {cancelText}
          </button>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}