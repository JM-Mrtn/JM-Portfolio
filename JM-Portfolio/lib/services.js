export const services = [
    {
        slug: "custom-software",
        window: "services/custom-software",
        icon: "blocks",

        title: "Custom Software · Web & Mobile Apps",

        tagline: "Building scalable applications for web and mobile platforms.",

        summary:
            "Custom digital solutions designed around your needs, from business systems and web applications to mobile experiences.",

        outcomes: [
            "Web applications",
            "Mobile applications",
            "Custom systems & dashboards",
        ],

        detail: {
            intro:
                "I build software solutions that transform ideas into functional digital products. From planning and interface design to development and deployment, every application is built with performance, usability, and scalability in mind.",

            features: [
                {
                    title: "Business web applications",
                    desc:
                        "Modern web systems that improve workflows, manage data, and help organizations operate efficiently.",
                },
                {
                    title: "Mobile applications",
                    desc:
                        "User-focused mobile experiences built for Android and cross-platform environments.",
                },
                {
                    title: "Custom dashboards",
                    desc:
                        "Centralized dashboards that turn complex information into clear and actionable insights.",
                },
                {
                    title: "Management systems",
                    desc:
                        "Custom solutions for inventory, booking, operations, and internal business processes.",
                },
                {
                    title: "Responsive platforms",
                    desc:
                        "Applications designed to work seamlessly across desktops, tablets, and mobile devices.",
                },
                {
                    title: "API & system integrations",
                    desc:
                        "Connecting applications and services to create smoother digital workflows.",
                },
            ],

            fitFor: [
                "Businesses needing custom software solutions",
                "Teams replacing manual processes",
                "Organizations requiring web or mobile platforms",
                "Projects needing scalable digital systems",
                "Ideas that need to become real applications",
            ],

            categoryKey: "Custom Software",
        },
    },


    {
        slug: "ai-automation",
        window: "services/ai-automation",
        icon: "bot",

        title: "AI Automation",

        tagline: "Creating intelligent solutions with artificial intelligence.",

        summary:
            "AI-powered systems that automate repetitive tasks, improve workflows, and help businesses work smarter.",

        outcomes: [
            "AI-powered workflows",
            "Intelligent assistants",
            "Automated processes",
        ],

        detail: {
            intro:
                "I integrate artificial intelligence into software solutions to automate repetitive tasks, improve productivity, and create smarter digital experiences.",

            features: [
                {
                    title: "AI assistants",
                    desc:
                        "Intelligent assistants that help users access information and complete tasks faster.",
                },
                {
                    title: "Workflow automation",
                    desc:
                        "Automating repetitive processes to reduce manual work and improve efficiency.",
                },
                {
                    title: "AI-powered data processing",
                    desc:
                        "Using AI to analyze, organize, and extract valuable information from data.",
                },
                {
                    title: "Smart integrations",
                    desc:
                        "Connecting AI capabilities with existing platforms and applications.",
                },
                {
                    title: "AI-enhanced applications",
                    desc:
                        "Adding intelligent features to websites and mobile applications.",
                },
                {
                    title: "Human-controlled AI systems",
                    desc:
                        "Building AI solutions where users stay in control of important decisions.",
                },
            ],

            fitFor: [
                "Teams looking to automate repetitive tasks",
                "Businesses exploring AI solutions",
                "Applications needing intelligent features",
                "Workflows that require faster processing",
                "Projects involving AI integration",
            ],

            categoryKey: "AI Engineering",
        },
    },
];


export function getService(slug) {
    return services.find((s) => s.slug === slug);
}