
import React, { Suspense } from 'react';
import { PageComponent } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { PageInspector } from './inspector-panels/page-inspector';
import { Skeleton } from '../ui/skeleton';

// Lazy load all inspector panels
const HeadingInspector = React.lazy(() => import('./inspector-panels/heading-inspector').then(module => ({ default: module.HeadingInspector })));
const TextInspector = React.lazy(() => import('./inspector-panels/text-inspector').then(module => ({ default: module.TextInspector })));
const ButtonInspector = React.lazy(() => import('./inspector-panels/button-inspector').then(module => ({ default: module.ButtonInspector })));
const ImageInspector = React.lazy(() => import('./inspector-panels/image-inspector').then(module => ({ default: module.ImageInspector })));
const SectionInspector = React.lazy(() => import('./inspector-panels/section-inspector').then(module => ({ default: module.SectionInspector })));
const NavbarInspector = React.lazy(() => import('./inspector-panels/navbar-inspector').then(module => ({ default: module.NavbarInspector })));
const FooterInspector = React.lazy(() => import('./inspector-panels/footer-inspector').then(module => ({ default: module.FooterInspector })));
const ColumnsInspector = React.lazy(() => import('./inspector-panels/columns-inspector').then(module => ({ default: module.ColumnsInspector })));
const VideoInspector = React.lazy(() => import('./inspector-panels/video-inspector').then(module => ({ default: module.VideoInspector })));
const FormInspector = React.lazy(() => import('./inspector-panels/form-inspector').then(module => ({ default: module.FormInspector })));

interface InspectorPanelProps {
  selectedComponent: PageComponent | null;
  onUpdateComponent: (id: string, newProps: any) => void;
  onClearSelection: () => void;
  pageBackgroundColor: string;
  onUpdatePageBackgroundColor: (color: string) => void;
}

const inspectorMap = {
  Heading: HeadingInspector,
  Text: TextInspector,
  Button: ButtonInspector,
  Image: ImageInspector,
  Section: SectionInspector,
  Navbar: NavbarInspector,
  Footer: FooterInspector,
  Columns: ColumnsInspector,
  Video: VideoInspector,
  Form: FormInspector,
};

const InspectorLoader = () => (
    <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
        </div>
    </div>
);

export function InspectorPanel({ selectedComponent, onUpdateComponent, pageBackgroundColor, onUpdatePageBackgroundColor }: InspectorPanelProps) {
  const Inspector = selectedComponent ? inspectorMap[selectedComponent.type as keyof typeof inspectorMap] : null;

  const key = selectedComponent ? selectedComponent.id : 'page-inspector';

  return (
      <div className="p-4 h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={key}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Suspense fallback={<InspectorLoader />}>
              {selectedComponent && Inspector ? (
                <Inspector
                  component={selectedComponent}
                  onUpdate={onUpdateComponent}
                />
              ) : (
                <PageInspector 
                  backgroundColor={pageBackgroundColor}
                  onUpdateBackgroundColor={onUpdatePageBackgroundColor}
                />
              )}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>
  );
}
