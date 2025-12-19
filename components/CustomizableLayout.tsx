import React, { useState, useEffect } from 'react';
import { 
  GripVertical, Eye, EyeOff, RotateCcw, Layout, Check, 
  Maximize2, Minimize2 
} from 'lucide-react';
import { DashboardWidgetConfig, WidgetSize } from '../types';

interface WidgetDefinition {
  id: string;
  title: string; // Used for the "Edit" menu
  content: React.ReactNode;
  defaultSize?: WidgetSize;
}

interface CustomizableLayoutProps {
  viewId: string; // Unique ID for LocalStorage (e.g., 'home', 'invest', 'trans')
  widgets: WidgetDefinition[];
}

export const CustomizableLayout: React.FC<CustomizableLayoutProps> = ({ viewId, widgets }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [layout, setLayout] = useState<DashboardWidgetConfig[]>(() => {
    const saved = localStorage.getItem(`layout_${viewId}`);
    if (saved) return JSON.parse(saved);
    
    // Default Layout Generation
    return widgets.map((w, index) => ({
      id: w.id,
      visible: true,
      order: index,
      size: w.defaultSize || 'full'
    }));
  });

  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  // Sync when widget definitions change (e.g. new features added)
  useEffect(() => {
    setLayout(prev => {
      const existingIds = new Set(prev.map(i => i.id));
      const newWidgets = widgets.filter(w => !existingIds.has(w.id)).map((w, idx) => ({
        id: w.id,
        visible: true,
        order: prev.length + idx,
        size: w.defaultSize || 'full'
      }));
      return [...prev, ...newWidgets];
    });
  }, [widgets.length]);

  useEffect(() => {
    localStorage.setItem(`layout_${viewId}`, JSON.stringify(layout));
  }, [layout, viewId]);

  const toggleVisibility = (id: string) => {
    setLayout(prev => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  };

  const toggleSize = (id: string) => {
    setLayout(prev => prev.map(w => w.id === id ? { ...w, size: w.size === 'full' ? 'half' : 'full' } : w));
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newLayout = [...layout];
    const item = newLayout.splice(draggedItem, 1)[0];
    newLayout.splice(index, 0, item);
    
    // Update order numbers
    const updatedOrder = newLayout.map((w, i) => ({ ...w, order: i }));
    setLayout(updatedOrder);
    setDraggedItem(index);
  };

  const resetLayout = () => {
    if(window.confirm('Reset this view to default?')) {
      const defaultL = widgets.map((w, index) => ({
        id: w.id,
        visible: true,
        order: index,
        size: w.defaultSize || 'full'
      }));
      setLayout(defaultL);
      setIsEditMode(false);
    }
  };

  // Sort widgets based on layout order
  const sortedWidgets = widgets
    .map(w => {
      const config = layout.find(l => l.id === w.id);
      return { 
        ...w, 
        config: config || { id: w.id, visible: true, order: 999, size: 'full' as WidgetSize } 
      };
    })
    .sort((a, b) => a.config.order - b.config.order);

  return (
    <div className="relative pb-20">
       {/* Edit Toggle Bar */}
       <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-2xl font-bold text-white capitalize">{viewId} Dashboard</h2>
          <div className="flex gap-2">
             {isEditMode && (
                <button onClick={resetLayout} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 transition-colors" title="Reset Layout">
                   <RotateCcw className="w-5 h-5" />
                </button>
             )}
             <button 
               onClick={() => setIsEditMode(!isEditMode)}
               className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isEditMode ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/60 hover:text-white'}`}
             >
                {isEditMode ? <Check className="w-4 h-4" /> : <Layout className="w-4 h-4" />}
                {isEditMode ? 'Done' : 'Customize'}
             </button>
          </div>
       </div>

       {/* Grid Layout */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedWidgets.map((widget, index) => {
             // If not edit mode and hidden, don't render
             if (!isEditMode && !widget.config.visible) return null;

             const isHalf = widget.config.size === 'half';

             return (
                <div 
                  key={widget.id}
                  draggable={isEditMode}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={() => setDraggedItem(null)}
                  className={`
                     transition-all duration-300
                     ${isHalf ? 'col-span-1' : 'col-span-1 md:col-span-2'}
                     ${isEditMode ? 'border-2 border-dashed border-white/20 p-2 rounded-3xl bg-black/20 cursor-move relative' : ''} 
                     ${draggedItem === index ? 'opacity-50 scale-95' : 'opacity-100'}
                  `}
                >
                   {/* Edit Controls Overlay */}
                   {isEditMode && (
                      <div className="flex justify-between items-center mb-2 px-2 bg-black/40 rounded-lg p-1 backdrop-blur-sm absolute top-2 right-2 left-2 z-20">
                         <div className="flex items-center gap-2">
                            <GripVertical className="w-5 h-5 text-white/50" />
                            <span className="text-xs font-bold text-white/70 truncate">{widget.title}</span>
                         </div>
                         <div className="flex gap-1">
                            <button 
                              onClick={() => toggleSize(widget.id)}
                              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                              title="Toggle Size"
                            >
                               {isHalf ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
                            </button>
                            <button 
                              onClick={() => toggleVisibility(widget.id)}
                              className={`p-1.5 rounded-lg transition-colors ${widget.config.visible ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/30'}`}
                            >
                               {widget.config.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            </button>
                         </div>
                      </div>
                   )}

                   {/* Widget Content */}
                   <div className={`h-full ${isEditMode && !widget.config.visible ? 'opacity-30 pointer-events-none filter grayscale pt-10' : ''} ${isEditMode ? 'pt-10' : ''}`}>
                      {widget.content}
                   </div>
                </div>
             );
          })}
       </div>
    </div>
  );
};