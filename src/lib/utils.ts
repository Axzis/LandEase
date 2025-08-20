import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { PageContent } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createDefaultPageContent(): PageContent {
  return [
    {
      id: "hero-1",
      type: "Section",
      props: { backgroundColor: "#F9FAFB", padding: "64px" },
      children: [
        {
          id: "head-1",
          type: "Heading",
          props: {
            text: "Welcome to Your New Page",
            level: "h1",
            align: "center",
          },
        },
        {
          id: "text-1",
          type: "Text",
          props: {
            text: "This is a starting point. Click on any element to edit it or drag new components from the left sidebar!",
            align: "center",
          },
        },
        {
          id: "btn-1",
          type: "Button",
          props: { text: "Learn More", href: "#", align: "center" },
        },
      ],
    },
    {
      id: "feat-1",
      type: "Section",
      props: { backgroundColor: "#FFFFFF", padding: "64px" },
      children: [
        {
          id: "head-2",
          type: "Heading",
          props: { text: "Our Features", level: "h2", align: "center" },
        },
        {
          id: "img-1",
          type: "Image",
          props: {
            src: "https://placehold.co/400x250",
            alt: "Feature image",
          },
        },
      ],
    },
  ]
}
