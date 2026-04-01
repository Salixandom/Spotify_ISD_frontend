import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidthClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidthClassName = "max-w-xl",
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" />
      <div
        className={`relative z-10 w-full ${maxWidthClassName}
        rounded-2xl border border-white/18 bg-white/[0.08] backdrop-blur-2xl
        shadow-[0_20px_80px_rgba(0,0,0,0.55)]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-16 -left-14 w-44 h-44 rounded-full bg-spotify-green/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-14 w-44 h-44 rounded-full bg-cyan-300/10 blur-3xl pointer-events-none" />

        <div className="relative px-5 py-4 border-b border-white/12 flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-semibold text-white tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-white/16 bg-white/[0.04]
            text-white/70 hover:text-white hover:bg-white/[0.10] transition-colors
            flex items-center justify-center"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative p-5">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
