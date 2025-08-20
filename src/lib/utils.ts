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
      props: { backgroundColor: "#FFFFFF", padding: "64px" },
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
            text: "This is your starting point. Click on any element to edit it or drag new components from the left sidebar!",
            align: "center",
          },
        },
        {
          id: "btn-1",
          type: "Button",
          props: { text: "Get Started", href: "#", align: "center" },
        },
      ],
    },
  ];
}
