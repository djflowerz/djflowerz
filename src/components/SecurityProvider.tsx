'use client'
import { useEffect } from 'react'

export default function SecurityProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent F12, Cmd+Shift+I, Cmd+Shift+C, Cmd+Option+J, Ctrl+Shift+I, etc.
            if (
                e.key === 'F12' ||
                (e.metaKey && e.altKey && e.key === 'i') ||
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.shiftKey && e.key === 'C') ||
                (e.metaKey && e.shiftKey && e.key === 'C')
            ) {
                e.preventDefault();
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return <>{children}</>;
}
