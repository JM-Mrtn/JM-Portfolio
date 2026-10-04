/**
 * Tech-stack marquee — an infinite, seamless strip of the technologies
 * and tools I work with.
 */

import {
    siJavascript,
    siTypescript,
    siPython,
    siHtml5,
    siCss,
    siReact,
    siNextdotjs,
    siTailwindcss,
    siVite,
    siNodedotjs,
    siMysql,
    siPostgresql,
    siMongodb,
    siSupabase,
    siAndroidstudio,
    siFlutter,
    siExpo,
    siPostman,
    siVercel,
    siRender,
    siFigma,
    siFramer,
    siClaude,
} from "simple-icons";

import {
    Coffee,
    Database,
    Code2,
    Bot,
    Network,
} from "lucide-react";


const STACK = [
    // Programming Languages
    {
        name: "Java",
        lucide: Coffee,
    },
    {
        name: "JavaScript",
        icon: siJavascript,
    },
    {
        name: "TypeScript",
        icon: siTypescript,
    },
    {
        name: "Python",
        icon: siPython,
    },
    {
        name: "SQL",
        lucide: Database,
    },

    // Frontend Development
    {
        name: "HTML5",
        icon: siHtml5,
    },
    {
        name: "CSS3",
        icon: siCss,
    },
    {
        name: "React.js",
        icon: siReact,
    },
    {
        name: "Next.js",
        icon: siNextdotjs,
    },
    {
        name: "Tailwind CSS",
        icon: siTailwindcss,
    },
    {
        name: "Vite",
        icon: siVite,
    },

    // Backend Development
    {
        name: "Node.js",
        icon: siNodedotjs,
    },

    // Databases & Database Tools
    {
        name: "MySQL",
        icon: siMysql,
    },
    {
        name: "PostgreSQL",
        icon: siPostgresql,
    },
    {
        name: "MongoDB",
        icon: siMongodb,
    },
    {
        name: "Supabase",
        icon: siSupabase,
    },

    // Mobile Development
    {
        name: "Android Studio",
        icon: siAndroidstudio,
    },
    {
        name: "Flutter",
        icon: siFlutter,
    },
    {
        name: "React Native",
        icon: siReact,
    },
    {
        name: "Expo",
        icon: siExpo,
    },

    // Development Environments & Tools
    {
        name: "Visual Studio Code",
        lucide: Code2,
    },
    {
        name: "Postman",
        icon: siPostman,
    },

    // Deployment & Hosting
    {
        name: "Vercel",
        icon: siVercel,
    },
    {
        name: "Render",
        icon: siRender,
    },

    // UI/UX & Design
    {
        name: "Figma",
        icon: siFigma,
    },
    {
        name: "Framer",
        icon: siFramer,
    },

    // AI Tools
    {
        name: "Claude AI",
        icon: siClaude,
    },
    {
        name: "ChatGPT",
        lucide: Bot,
    },
    

    // Networking & IT Support
    {
        name: "Cisco Packet Tracer",
        lucide: Network,
    },
];


function TechIcon({ icon, lucide: LucideIcon }) {
    // Simple Icons
    if (icon) {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                className="
                    size-4
                    shrink-0
                    text-primary/70
                    transition-colors
                    duration-300
                    group-hover:text-primary-foreground
                "
            >
                <path d={icon.path} />
            </svg>
        );
    }

    // Lucide fallback icons
    if (LucideIcon) {
        return (
            <LucideIcon
                aria-hidden="true"
                strokeWidth={1.8}
                className="
                    size-4
                    shrink-0
                    text-primary/70
                    transition-colors
                    duration-300
                    group-hover:text-primary-foreground
                "
            />
        );
    }

    return null;
}


function Row({ hidden = false }) {
    return (
        <ul
            aria-hidden={hidden}
            className="
                flex
                w-max
                items-center
                gap-3
                pr-3
                md:gap-4
                md:pr-4
            "
        >
            {STACK.map(({ name, icon, lucide }) => (
                <li
                    key={name}
                    className="
                        group
                        flex
                        items-center
                        gap-2.5
                        whitespace-nowrap
                        rounded-lg
                        border
                        border-primary/15
                        bg-primary/[0.05]
                        px-5
                        py-3
                        transition-colors
                        duration-300
                        hover:border-primary
                        hover:bg-primary
                    "
                >
                    <TechIcon
                        icon={icon}
                        lucide={lucide}
                    />

                    <span
                        className="
                            font-mono
                            text-xs
                            uppercase
                            tracking-[0.14em]
                            text-primary/80
                            transition-colors
                            duration-300
                            group-hover:text-primary-foreground
                        "
                    >
                        {name}
                    </span>
                </li>
            ))}
        </ul>
    );
}


export function TechMarquee() {
    return (
        <section
            aria-label="Technologies I work with"
            className="w-full"
        >
            <div className="relative w-full overflow-hidden py-6">

                {/* Left fade */}
                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none
                        absolute
                        inset-y-0
                        left-0
                        z-10
                        w-16
                        bg-gradient-to-r
                        from-background
                        to-transparent
                        md:w-28
                    "
                />

                {/* Right fade */}
                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none
                        absolute
                        inset-y-0
                        right-0
                        z-10
                        w-16
                        bg-gradient-to-l
                        from-background
                        to-transparent
                        md:w-28
                    "
                />

                {/* Infinite marquee */}
                <div className="marquee-track flex w-max">
                    <Row />
                    <Row hidden />
                </div>

            </div>
        </section>
    );
}