import React from "react";
import { cn } from "@/lib/utils";

interface MobileWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const MobileWrapper = ({ children, className, ...props }: MobileWrapperProps) => {
    return (
        <main
            className={cn(
                "min-h-screen w-full max-w-[480px] mx-auto bg-background relative shadow-2xl overflow-hidden",
                className
            )}
            {...props}
        >
            {children}
        </main>
    );
};
