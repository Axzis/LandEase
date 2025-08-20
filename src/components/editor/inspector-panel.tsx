import { PageComponent } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { HeadingInspector } from './inspector-panels/heading-inspector';
import { TextInspector } from './inspector-panels/text-inspector';
import { ButtonInspector } from './inspector-panels/button-inspector';
import { ImageInspector } from './inspector-panels/image-inspector';
import { SectionInspector } from './inspector-panels/section-inspector';
import { PageInspector } from './inspector-panels/page-inspector';
import { ScrollArea } from '../ui/scroll-area';

interface InspectorPanelProps {
  selectedComponent: PageComponent | null;
  onUpdateComponent: (id: string, newProps: any) => void;
  onClearSelection: () => void;
}

const inspectorMap = {
  Heading: HeadingInspector,
  Text: TextInspector,
  Button: ButtonInspector,
  Image: ImageInspector,
  Section: SectionInspector,
};

export function InspectorPanel({ selectedComponent, onUpdateComponent, onClearSelection }: InspectorPanelProps) {
  const Inspector = selectedComponent ? inspectorMap[selectedComponent.type as keyof typeof inspectorMap] : null;

  const key = selectedComponent ? selectedComponent.id : 'page-inspector';

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={key}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {selectedComponent && Inspector ? (
              <Inspector
                component={selectedComponent}
                onUpdate={onUpdateComponent}
              />
            ) : (
              <PageInspector />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}
