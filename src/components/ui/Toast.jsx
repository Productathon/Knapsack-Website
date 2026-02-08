"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastContext = createContext(null);

const TOAST_DURATION = 4000;

const toastVariants = {
    success: {
        icon: CheckCircle2,
        className: "bg-green-50 border-green-200 text-green-800",
        iconClass: "text-green-500",
    },
    error: {
        icon: AlertCircle,
        className: "bg-red-50 border-red-200 text-red-800",
        iconClass: "text-red-500",
    },
    warning: {
        icon: AlertTriangle,
        className: "bg-yellow-50 border-yellow-200 text-yellow-800",
        iconClass: "text-yellow-500",
    },
    info: {
        icon: Info,
        className: "bg-blue-50 border-blue-200 text-blue-800",
        iconClass: "text-blue-500",
    },
};

function Toast({ id, message, variant = "info", onDismiss }) {
    const config = toastVariants[variant] || toastVariants.info;
    const Icon = config.icon;

    return (
        <div
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg",
                "animate-in slide-in-from-right-full duration-300",
                config.className
            )}
        >
            <Icon className={cn("h-5 w-5 shrink-0", config.iconClass)} />
            <p className="text-sm font-medium flex-1">{message}</p>
            <button
                onClick={() => onDismiss(id)}
                className="shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, variant = "info", duration = TOAST_DURATION) => {
        const id = Date.now() + Math.random();

        setToasts((prev) => [...prev, { id, message, variant }]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, duration);
        }

        return id;
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, dismissToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        id={toast.id}
                        message={toast.message}
                        variant={toast.variant}
                        onDismiss={dismissToast}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
