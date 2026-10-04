export const projects = [

    {
        slug: "lumispire",

        title: "LUMISPIRE",

        client: "LTC Group of Companies",

        category: "Web Development",

        image: "/projects/lumispire/cover.svg",

        description:
            "A polished corporate website for LTC Group of Companies with a clear, responsive presentation across devices.",

        year: "2026",

        featured: true,

        role:
            "Frontend Developer",

        technologies: [
            "React",
            "Vite",
            "Tailwind CSS"
        ],

        problem:
            "The company needed a professional digital presence that could clearly communicate their services.",

        solution:
            "Designed and developed a responsive corporate website with modern layouts and user-focused interactions.",

        outcome:
            "Created a cleaner online experience with improved accessibility and brand presentation.",


        study: {

            intro:
                "A modern corporate website designed to improve the company's digital presence and communicate its services effectively.",


            tech: [
                "React",
                "Vite",
                "Tailwind CSS"
            ],


            gallery: [],


            problem:
                "The company needed a professional website that could present their services clearly and provide a better user experience.",


            approach:
                "Focused on clean layouts, responsive design, and a structured content experience.",


            solution:
                "Built a modern responsive website using React and Tailwind CSS with reusable components.",


            outcome:
                "Delivered a polished digital platform with improved presentation and usability."

        }

    },





    {
        slug: "silingan-lifestyle-solutions",

        title: "SILINGAN LIFESTYLE SOLUTIONS",

        client:
            "Silingan Lifestyle Solutions",


        category: "Web Development",

        image: null,

        description:
            "A modern lifestyle platform designed with an elegant interface and responsive experience.",


        year: "2026",

        featured: true,


        role:
            "Full Stack Developer",


        technologies: [
            "React",
            "Node.js",
            "Tailwind CSS"
        ],



        problem:
            "The business needed an online platform that represents their services professionally.",


        solution:
            "Built a responsive website focusing on usability, clean design, and performance.",


        outcome:
            "Delivered a modern platform that improves customer interaction.",



        study: {

            intro:
                "A lifestyle-focused website created to provide users with a clean and engaging digital experience.",


            tech:[
                "React",
                "Node.js",
                "Tailwind CSS"
            ],


            gallery:[],


            problem:
                "The brand needed a modern online presence that communicates their services clearly.",


            approach:
                "Created an intuitive interface focused on usability and responsive design.",


            solution:
                "Developed a full-stack solution with modern frontend technologies.",


            outcome:
                "Improved the brand's online visibility and user experience."

        }

    },





    {
        slug: "lumispire-manpower-services",

        title: "MANPOWER SERVICES",

        client:
            "Lumispire Manpower Services",


        category: "Web Development",

        image: null,


        description:
            "A professional website created for manpower and recruitment services.",


        year: "2026",

        featured:true,


        role:
            "Web Developer",


        technologies:[
            "React",
            "Vite",
            "Tailwind CSS"
        ],


        problem:
            "The company required a digital solution to showcase their manpower services.",


        solution:
            "Developed a structured website with clear service information.",


        outcome:
            "Provided a professional online presence for their business.",



        study: {

            intro:
                "A service-focused website designed to showcase manpower solutions.",


            tech:[
                "React",
                "Vite",
                "Tailwind CSS"
            ],


            gallery:[],


            problem:
                "The company needed a platform to present their services effectively.",


            approach:
                "Organized information into a simple and user-friendly experience.",


            solution:
                "Created a responsive website with modern components.",


            outcome:
                "Delivered a professional web presence."

        }

    },





    {
        slug:"lumispire-resort-venue",

        title:"RESORT AND VENUE",

        client:
            "Lumispire Resort",


        category:"Web Development",

        image:null,


        description:
            "A booking-focused website designed for resort and venue services.",


        year:"2026",

        featured:false,


        role:
            "Frontend Developer",


        technologies:[
            "React",
            "Tailwind CSS"
        ],


        study:{

            intro:
                "A resort website experience focused on presenting venues and services.",


            tech:[
                "React",
                "Tailwind CSS"
            ],


            gallery:[],


            problem:
                "The business needed a better way to showcase their venue.",


            approach:
                "Designed a visual and responsive browsing experience.",


            solution:
                "Created a modern interface highlighting resort information.",


            outcome:
                "Improved online presentation of resort services."

        }

    },





    {
        slug:"lumispire-training-assessment",

        title:"TRAINING AND ASSESSMENT",

        client:
            "Lumispire Training",


        category:"Web Development",

        image:null,


        description:
            "A digital platform for training and assessment services.",


        year:"2026",

        featured:false,


        role:
            "Frontend Developer",


        technologies:[
            "React",
            "Vite"
        ],



        study:{

            intro:
                "A platform created to organize training and assessment services.",


            tech:[
                "React",
                "Vite"
            ],


            gallery:[],


            problem:
                "The organization needed a structured digital platform.",


            approach:
                "Focused on clarity, accessibility, and organized content.",


            solution:
                "Developed a responsive application interface.",


            outcome:
                "Created a cleaner digital workflow."

        }

    }

];





export const categories = [

    {
        key:"Web Development",

        blurb:
        "Websites and digital platforms built with modern technologies."
    },


    {
        key:"Mobile Development",

        blurb:
        "Mobile applications designed for performance and usability."
    },


    {
        key:"AI Projects",

        blurb:
        "AI-powered solutions and intelligent digital experiences."
    }

];






export function sortForDisplay(projects){


    return [...projects].sort((a,b)=>{


        if(a.featured && !b.featured){

            return -1;

        }


        if(!a.featured && b.featured){

            return 1;

        }


        return Number(b.year)-Number(a.year);


    });


}







export function getProjectBySlug(slug){


    return projects.find(

        (project)=>

        project.slug === slug

    );


}