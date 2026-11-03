import NavigationBars from './navigation/NavigationBars';
import { ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
    centered?: boolean;
    className?: string;
}

export default function Layout({ children, centered = false, className = '' }: LayoutProps) {
    if (centered) {
        return (
            <NavigationBars>
                <div className={`min-h-screen bg-base-300 flex items-center justify-center p-4 ${className}`}>
                    {children}
                </div>
            </NavigationBars>
        );
    }

    return (
        <div className={`min-h-screen bg-base-300 ${className}`}>
            <NavigationBars>
                {children}
            </NavigationBars>
        </div>
    );
}
