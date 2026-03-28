import React from "react";
import { ExternalLink } from "lucide-react";

type FooterLink = {
    label: string;
    href: string;
};

type FooterSection = {
    title: string;
    links: FooterLink[];
};

const FOOTER_SECTIONS: FooterSection[] = [
    {
        title: "Company",
        links: [
            { label: "About", href: "#" },
            { label: "Jobs", href: "#" },
            { label: "For the Record", href: "#" },
        ],
    },
    {
        title: "Communities",
        links: [
            { label: "For Artists", href: "#" },
            { label: "Developers", href: "#" },
            { label: "Advertising", href: "#" },
            { label: "Investors", href: "#" },
            { label: "Vendors", href: "#" },
        ],
    },
    {
        title: "Useful links",
        links: [
            { label: "Support", href: "#" },
            { label: "Free Mobile App", href: "#" },
            { label: "Popular by Country", href: "#" },
            { label: "Import your music", href: "#" },
        ],
    },
    {
        title: "Spotify Plans",
        links: [
            { label: "Premium Individual", href: "#" },
            { label: "Premium Duo", href: "#" },
            { label: "Premium Family", href: "#" },
            { label: "Premium Student", href: "#" },
            { label: "Spotify Free", href: "#" },
        ],
    },
];

const LEGAL_LINKS: FooterLink[] = [
    { label: "Legal", href: "#" },
    { label: "Safety & Privacy Center", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Cookies", href: "#" },
    { label: "About Ads", href: "#" },
    { label: "Accessibility", href: "#" },
];

const InstagramIcon: React.FC<{ size?: number; className?: string }> = ({
    size = 18,
    className,
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className={className}
    >
        <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="5"
            stroke="currentColor"
            strokeWidth="1.8"
        />
        <circle
            cx="12"
            cy="12"
            r="4.2"
            stroke="currentColor"
            strokeWidth="1.8"
        />
        <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" />
    </svg>
);

const XIcon: React.FC<{ size?: number; className?: string }> = ({
    size = 18,
    className,
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className={className}
    >
        <path
            d="M4 4h4.2l4.1 5.6L17.3 4H20l-6.4 7.3L20.2 20H16l-4.4-6-5.2 6H3.7l6.8-7.8L4 4Z"
            fill="currentColor"
        />
    </svg>
);

const FacebookIcon: React.FC<{ size?: number; className?: string }> = ({
    size = 18,
    className,
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className={className}
    >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path
            d="M13.2 8.1h1.7V5.6h-2c-2.3 0-3.7 1.4-3.7 3.9v1.6H7.4v2.5h1.8v4.8h2.7v-4.8h2.2l.3-2.5h-2.5V9.7c0-1 .3-1.6 1.3-1.6Z"
            fill="currentColor"
        />
    </svg>
);

const SOCIAL_LINKS = [
    { label: "Instagram", href: "#", Icon: InstagramIcon },
    { label: "X", href: "#", Icon: XIcon },
    { label: "Facebook", href: "#", Icon: FacebookIcon },
];

export const PageFooter: React.FC = () => {
    return (
        <footer
            className="mt-12 pt-10 pb-8 px-6 md:px-8 border-t border-white/12 text-white/80"
            aria-label="Page footer"
        >
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10">
                {/* Link columns */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
                    {FOOTER_SECTIONS.map((section) => (
                        <nav key={section.title} aria-label={section.title}>
                            <h3 className="text-white font-bold text-lg mb-3">
                                {section.title}
                            </h3>
                            <ul className="space-y-2.5">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="inline-flex items-center gap-1 text-white/70 hover:text-white transition-colors"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>

                {/* Social icons */}
                <div className="flex items-start lg:justify-end gap-3">
                    {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                        <a
                            key={label}
                            href={href}
                            aria-label={label}
                            title={label}
                            className="w-11 h-11 rounded-full border border-white/15
                         bg-white/[0.06] backdrop-blur-xl
                         text-white/80 hover:text-white hover:bg-white/[0.12]
                         flex items-center justify-center transition-colors"
                        >
                            <Icon size={18} />
                        </a>
                    ))}
                </div>
            </div>

            {/* Divider */}
            <div className="mt-10 border-t border-white/10 pt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <nav
                    aria-label="Legal links"
                    className="flex flex-wrap items-center gap-x-5 gap-y-2"
                >
                    {LEGAL_LINKS.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="text-sm text-white/55 hover:text-white/85 transition-colors inline-flex items-center gap-1"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <p className="text-sm text-white/45 whitespace-nowrap inline-flex items-center gap-1">
                    © 2026 Spotify AB
                    <ExternalLink size={12} className="opacity-60" />
                </p>
            </div>
        </footer>
    );
};

export default PageFooter;
