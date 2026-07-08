"use client";

import Image from "next/image";
import { X, ExternalLink } from "lucide-react";
import { getImageUrl } from "@/lib/image-url";

/**
 * PopupCard - Shared component for popup display
 * Used by both:
 * - Frontend SpecialEventPopup (live on homepage)
 * - Admin PopupManager preview modal
 * 
 * IMPORTANT: Any visual changes here affect BOTH locations!
 */

interface PopupCardProps {
    title: string;
    message: string;
    imageUrl?: string | null;
    linkUrl?: string | null;
    linkText?: string | null;
    onClose?: () => void;
    showCloseButton?: boolean;
    /** Size variant: 'default' for live popup, 'preview' for admin */
    variant?: "default" | "preview";
}

export function PopupCard({
    title,
    message,
    imageUrl,
    linkUrl,
    linkText,
    onClose,
    showCloseButton = true,
    variant = "default",
}: PopupCardProps) {
    // No longer using variant for sizing - always render identically
    return (
        <div className="glass-card rounded-2xl overflow-hidden max-w-[90vw] sm:max-w-sm w-full">
            {/* Close Button */}
            {showCloseButton && onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-accent-coral/20 transition-colors"
                    aria-label="Close"
                >
                    <X size={18} />
                </button>
            )}

            {/* Image - Using object-contain for full visibility, no cropping */}
            {imageUrl && (
                <div className="relative bg-neutral-100 dark:bg-neutral-900">
                    <Image
                        src={getImageUrl(imageUrl)}
                        alt={title}
                        width={600}
                        height={400}
                        className="w-full h-auto object-contain"
                        style={{ maxHeight: "250px" }}
                    />
                    {/* Gradient overlay for text readability */}
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background/80 to-transparent" />
                </div>
            )}

            {/* Content */}
            <div className={`p-6 ${imageUrl ? "-mt-6 relative z-10" : ""}`}>
                <h3 className="font-display tracking-wide mb-2 text-xl">
                    {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {message}
                </p>

                {/* CTA Button */}
                {linkUrl && (() => {
                    const isSubscribe = linkText && /abone/i.test(linkText);
                    const finalUrl = isSubscribe ? "/#newsletter" : linkUrl;
                    const isAnchor = finalUrl.startsWith("#") || finalUrl.startsWith("/#");

                    return (
                        <div className="flex justify-center mt-4">
                            <a
                                href={finalUrl}
                                target={isAnchor ? undefined : "_blank"}
                                rel={isAnchor ? undefined : "noopener noreferrer"}
                                onClick={() => {
                                    if (onClose) onClose();
                                }}
                                className="btn-primary py-2 text-sm inline-flex items-center gap-2"
                            >
                                {linkText || "Learn More"}
                                {!isAnchor && <ExternalLink size={14} />}
                            </a>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
}

export default PopupCard;
