import React from 'react';

interface BaseInspectorProps {
    title: string;
    children: React.ReactNode;
}

export function BaseInspector({ title, children }: BaseInspectorProps) {
    return (
        <div>
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">{title} Properties</h3>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
}
