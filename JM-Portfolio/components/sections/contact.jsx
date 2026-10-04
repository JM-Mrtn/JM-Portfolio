"use client";

import * as React from "react";
import emailjs from "@emailjs/browser";

import Link from "@/components/compat/link";

import { useForm, Controller } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
    AnimatePresence,
    motion
} from "framer-motion";

import {
    CheckCircle2,
    Loader2,
    Mail,
    Send
} from "lucide-react";


import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";


import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue

} from "@/components/ui/select";


import { Reveal } from "@/components/motion/reveal";

import { WindowCard } from "@/components/ui/window-card";

import {
    contactSchema,
    PROJECT_TYPES
} from "@/lib/contact-schema";


import {
    EASE_OUT
} from "@/lib/motion";


import {
    site
} from "@/lib/site";





function GithubIcon(props) {

    return (

        <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        {...props}
        >

        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.16 1.18a11 11 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.66.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/>

        </svg>

    );

}





function LinkedinIcon(props){

    return (

        <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        {...props}
        >

        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0Z"/>

        </svg>

    );

}





function FieldError({message}){

    if(!message)
        return null;


    return (

        <p className="
        mt-1.5
        text-xs
        text-destructive
        ">

        {message}

        </p>

    );

}






export function Contact({

    contactEmail = site.email,

    githubUrl = site.socials.github,

    linkedinUrl = site.socials.linkedin,

}) {


const [sent,setSent] = React.useState(false);



const {
    register,
    handleSubmit,
    control,
    formState:{
        errors,
        isSubmitting
    }

}

=
useForm({

    resolver:
    zodResolver(contactSchema),

    defaultValues:{
        website:""
    }

});







async function onSubmit(values){


    try{


        await emailjs.send(


            "service_jm",


            "template_366uzp4",


            {


                name:
                values.name,


                email:
                values.email,


                company:
                values.company,


                project:
                values.projectType,


                message:
                values.message


            },


            {


                publicKey:
                "fme2j52UrbGKBMLAJ"


            }



        );



        setSent(true);



    }

    catch(error){


        console.error(
            "EmailJS Error:",
            error
        );


        alert(
            "Unable to send message. Please try again."
        );


    }



}








return (

<section
id="contact"
className="relative min-h-[100svh] scroll-mt-0 overflow-hidden bg-background"
>


<div className="
mx-auto
flex
min-h-[100svh]
w-full
max-w-7xl
items-center
px-6
py-28
sm:py-32
lg:py-24
xl:max-w-[1480px]
xl:px-10
">


<div className="
grid
w-full
gap-14
lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]
lg:items-center
lg:gap-20
xl:gap-28
">



{/* LEFT */}

<Reveal>


<p className="eyebrow">
Contact
</p>


<h2 className="
mt-4
max-w-2xl
text-5xl
leading-[0.95]
sm:text-6xl
md:text-7xl
lg:text-[5.5rem]
">

Let's solve the busywork

</h2>



<p className="
mt-7
max-w-xl
text-base
leading-relaxed
text-muted-foreground
md:text-lg
">

Tell me what's slowing your business down.
If software can fix it, I'll show you how.
If it can't, I'll tell you that too.

</p>





<div className="
mt-12
max-w-xl
border-t
border-border
pt-8
md:mt-14
">


<p className="
eyebrow
!text-[10px]
">

Reach me directly

</p>



<ul className="
mt-4
space-y-1
">


<li>

<Link
href={`mailto:${contactEmail}`}
className="inline-flex items-center gap-3 py-2 text-base md:text-lg"
>

<Mail className="size-5 text-primary"/>

{contactEmail}

</Link>

</li>



<li>

<Link
href={githubUrl}
target="_blank"
rel="noopener noreferrer"
className="inline-flex items-center gap-3 py-2 text-base md:text-lg"
>

<GithubIcon className="size-5 text-primary"/>

GitHub

</Link>

</li>




<li>

<Link
href={linkedinUrl}
target="_blank"
rel="noopener noreferrer"
className="inline-flex items-center gap-3 py-2 text-base md:text-lg"
>

<LinkedinIcon className="size-5 text-primary"/>

LinkedIn

</Link>

</li>


</ul>


</div>


</Reveal>








{/* FORM */}


<Reveal delay={0.1}>


<WindowCard
label="contact/new-project"
className="w-full shadow-xl shadow-foreground/[0.06]"
contentClassName="p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14"
>


<AnimatePresence>


{

sent ?

(

<motion.div

initial={{
opacity:0,
y:16
}}

animate={{
opacity:1,
y:0
}}

className="
flex
min-h-[520px]
flex-col
items-center
justify-center
text-center
"

>


<CheckCircle2
className="size-10 text-primary"
/>


<h3 className="
mt-5
font-display
text-2xl
">

Message sent

</h3>



<p className="
mt-3
max-w-xs
text-sm
text-muted-foreground
">

Thanks, I've got it.
Expect a personal reply soon.

</p>


</motion.div>

)


:


(


<form

onSubmit={
handleSubmit(onSubmit)
}

noValidate

className="
space-y-5
md:space-y-6
"

>

<input
type="text"
tabIndex={-1}
autoComplete="off"
aria-hidden="true"
className="absolute -left-[9999px] h-px w-px overflow-hidden"
{...register("website")}
/>

<div className="
grid
gap-4
sm:grid-cols-2
">


<div>

<Label htmlFor="contact-name">
Name
</Label>


<Input
id="contact-name"
className="mt-2 h-12 px-4"
placeholder="Your name"
aria-invalid={Boolean(errors.name)}
{...register("name")}
/>


<FieldError
message={errors.name?.message}
/>


</div>





<div>

<Label htmlFor="contact-email">
Email
</Label>


<Input

id="contact-email"

type="email"

className="mt-2 h-12 px-4"

placeholder="you@company.com"

aria-invalid={Boolean(errors.email)}

{...register("email")}

/>


<FieldError
message={errors.email?.message}
/>


</div>


</div>







<div className="
grid
gap-4
sm:grid-cols-2
">


<div>

<Label htmlFor="contact-company">
Company
</Label>


<Input

id="contact-company"

className="mt-2 h-12 px-4"

placeholder="Your business"

aria-invalid={Boolean(errors.company)}

{...register("company")}

/>

<FieldError
message={errors.company?.message}
/>


</div>





<div>

<Label htmlFor="contact-project-type">
Project type
</Label>


<Controller

control={control}

name="projectType"

render={({field})=>(


<Select

value={field.value}

onValueChange={field.onChange}

>


<SelectTrigger
id="contact-project-type"
className="mt-2 h-12 w-full px-4"
aria-invalid={Boolean(errors.projectType)}
>

<SelectValue placeholder="Pick the closest fit"/>

</SelectTrigger>


<SelectContent>


{

PROJECT_TYPES.map(type=>(

<SelectItem
key={type}
value={type}
>

{type}

</SelectItem>

))

}


</SelectContent>


</Select>


)}

/>

<FieldError
message={errors.projectType?.message}
/>


</div>


</div>






<div>

<Label htmlFor="contact-message">
What's the problem?
</Label>


<Textarea

id="contact-message"

rows={4}

className="mt-2 min-h-32 px-4 py-3"

placeholder="Tell me about your project..."

aria-invalid={Boolean(errors.message)}

{...register("message")}

/>


<FieldError
message={errors.message?.message}
/>


</div>





<Button

type="submit"

size="lg"

disabled={isSubmitting}

className="btn-cta min-h-12 px-6"

>


{

isSubmitting

?

<>

<Loader2 className="size-4 animate-spin"/>

Sending...

</>


:

<>

Send message

<Send className="size-4"/>

</>

}


</Button>



</form>


)

}



</AnimatePresence>


</WindowCard>


</Reveal>




</div>

</div>


</section>


);


}