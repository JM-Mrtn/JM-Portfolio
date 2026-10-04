import React from "react";

import {
    ArrowLeft,
    ArrowRight
} from "lucide-react";


import { Providers } from "../components/providers";

import { Navbar } from "../components/site/navbar";

import { BottomNav } from "../components/site/bottom-nav";

import { ScrollGuide } from "../components/site/scroll-guide";

import { CaseShowcase } from "../components/site/case-showcase";

import { Reveal } from "../components/motion/reveal";

import { Button } from "../components/ui/button";

import Link from "../components/compat/link";

import {
    projects,
    getProjectBySlug
} from "@/lib/projects";
import { site } from "@/lib/site";



const chapters = [

    {
        key:"problem",
        label:"The problem"
    },

    {
        key:"approach",
        label:"The approach"
    },

    {
        key:"solution",
        label:"The solution"
    },

    {
        key:"outcome",
        label:"The outcome"
    },

];





export default function CaseStudy({ slug }) {


    const project =
        getProjectBySlug(slug);



    React.useEffect(()=>{


        document.title =
        project
        ?
        `${project.title} — ${site.name}`
        :
        `Work — ${site.name}`;


        window.scrollTo(0,0);


    },[project]);





    if(!project){

        return (

            <Providers>

                <Navbar/>


                <main
                className="
                mx-auto
                max-w-7xl
                px-6
                pt-40
                pb-24
                "
                >

                    <h1 className="text-4xl">
                        Project not found
                    </h1>


                    <Link
                    href="/work"
                    className="
                    mt-6
                    inline-flex
                    text-primary
                    "
                    >

                        Back to work

                    </Link>


                </main>


                <BottomNav/>

            </Providers>

        );

    }




    const index =
        projects.findIndex(
            item =>
            item.slug === project.slug
        );



    const next =
        projects[
            (index + 1)
            %
            projects.length
        ];





    const study =
        project.study || {

            intro:
            project.description || "",


            tech:
            project.technologies || [],


            gallery:
            [],


            problem:
            project.problem || "",


            approach:
            project.solution || "",


            solution:
            project.solution || "",


            outcome:
            project.outcome || ""

        };







return (

<Providers>


<Navbar/>



<main
id="main"
className="flex-1"
>


<article
className="
mx-auto
max-w-7xl
px-6
pt-32
pb-24
md:pt-40
"
>


<Reveal>


<Link

href="/work"

className="
inline-flex
items-center
gap-1.5
text-sm
text-muted-foreground
hover:text-foreground
"

>

<ArrowLeft
className="size-4"
/>

All work

</Link>





<div
className="
mt-10
max-w-3xl
"
>


<p className="eyebrow">

{project.client || "Project"}

{" · "}

{project.category}

</p>




<h1
className="
mt-4
text-4xl
sm:text-5xl
md:text-6xl
"
>

{project.title}

</h1>





<p
className="
mt-6
text-lg
leading-relaxed
text-muted-foreground
"
>

{study.intro}

</p>



</div>







<div
className="
mt-10
flex
flex-wrap
items-center
gap-x-8
gap-y-4
border-y
border-border
py-6
"
>


{

[
[
"Year",
project.year
],

[
"Role",
project.role
]

].map(([label,value])=>(

value &&

<div key={label}>

<p
className="
font-mono
text-[10px]
uppercase
tracking-[0.14em]
text-muted-foreground
"
>

{label}

</p>


<p
className="
mt-1
text-sm
font-medium
"
>

{value}

</p>


</div>

))

}





<div className="flex flex-wrap gap-2">


{

study.tech?.map((tech)=>(

<span

key={tech}

className="
rounded-lg
border
border-primary/15
bg-primary/[0.05]
px-3
py-1
text-xs
font-medium
text-primary/80
"

>

{tech}

</span>

))

}


</div>



</div>



</Reveal>








<Reveal delay={0.1}
className="mt-12"
>


<CaseShowcase

cover={project.image}

gallery={study.gallery}

title={project.title}

/>


</Reveal>







<div
className="
mt-20
space-y-16
md:space-y-20
"
>


{

chapters.map(
(chapter,i)=>(


<Reveal key={chapter.key}>


<section

className="
grid
gap-4
md:grid-cols-[220px_1fr]
md:gap-12
"

>


<div>


<span
className="
font-mono
text-xs
text-primary
"
>

{
String(i+1)
.padStart(2,"0")
}

</span>


<h2
className="
font-sans
text-lg
font-semibold
"
>

{chapter.label}

</h2>


</div>





<p
className="
max-w-2xl
text-base
leading-relaxed
text-muted-foreground
md:text-lg
"
>

{study[chapter.key]}

</p>


</section>


</Reveal>


)

)

}


</div>









<Reveal>


<div
className="
mt-24
rounded-2xl
border
border-border
bg-card
p-8
md:p-12
"
>


<div
className="
flex
flex-col
gap-6
md:flex-row
md:items-center
md:justify-between
"
>


<div>

<h2
className="
text-2xl
md:text-3xl
"
>

Have a similar project?

</h2>


<p
className="
mt-2
max-w-md
text-muted-foreground
"
>

Tell me what you want to build and I'll help turn it into a polished web experience.

</p>


</div>



<Button
asChild
size="lg"
className="btn-cta"
>

<Link href="/#contact">

Start a project

<ArrowRight className="size-4"/>

</Link>


</Button>


</div>


</div>





{

projects.length > 1 && next &&

<div
className="
mt-6
flex
justify-end
"
>


<Link

href={`/work/${next.slug}`}

className="
group
inline-flex
items-center
gap-2
text-sm
text-muted-foreground
hover:text-foreground
"

>


Next:
{next.title}


<ArrowRight
className="
size-4
transition-transform
group-hover:translate-x-0.5
"
/>


</Link>


</div>


}




</Reveal>





</article>


</main>



<BottomNav/>

<ScrollGuide/>


</Providers>

);


}