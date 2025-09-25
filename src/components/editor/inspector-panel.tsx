
import { PageComponent } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { HeadingInspector } from './inspector-panels/heading-inspector';
import { TextInspector } from './inspector-panels/text-inspector';
import { ButtonInspector } from './inspector-panels/button-inspector';
import { ImageInspector } from './inspector-panels/image-inspector';
import { SectionInspector } from './inspector-panels/section-inspector';
import { PageInspector } from './inspector-panels/page-inspector';
import { NavbarInspector } from './inspector-panels/navbar-inspector';
import { FooterInspector } from './inspector-panels/footer-inspector';
import { ColumnsInspector } from './inspector-panels/columns-inspector';
import { VideoInspector } from './inspector-panels/video-inspector';
import { FormInspector } from './inspector-panels/form-inspector';

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
          </motion.div>
        </AnimatePresence>
      </div>
  );
}
