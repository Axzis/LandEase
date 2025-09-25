'use server';

import type { PageContent } from '@/lib/types';
import fs from 'fs/promises';
import path from 'path';

interface PublishedPageData {
  content: PageContent;
  pageName: string;
  pageBackgroundColor?: string;
}

const jsonFilePath = path.join(process.cwd(), 'src', 'lib', 'published-pages.json');

async function readPublishedPages(): Promise<Record<string, PublishedPageData>> {
  try {
    const fileContent = await fs.readFile(jsonFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    // If the file doesn't exist or is empty, return an empty object.
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {};
    }
    console.error("Error reading published pages file:", error);
    return {};
  }
}

export async function getPublishedPage(pageId: string): Promise<PublishedPageData | null> {
  const pages = await readPublishedPages();
  return pages[pageId] || null;
}

export async function updatePublishedPage(pageId: string, data: PublishedPageData | null) {
    const pages = await readPublishedPages();
    
    if (data === null) {
      // If data is null, it means we are unpublishing, so remove the page.
      delete pages[pageId];
    } else {
      // Otherwise, add or update the page data.
      pages[pageId] = data;
    }

    try {
        await fs.writeFile(jsonFilePath, JSON.stringify(pages, null, 2), 'utf-8');
    } catch (error) {
        console.error("Error writing to published pages file:", error);
        throw new Error("Could not update published pages file.");
    }
}
