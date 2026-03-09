"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, ...props }, ref) => (
        <input
            type="checkbox"
            ref={ref}
            className={cn(
                "h-4 w-4 rounded border-border text-green-600 focus:ring-green-500",
                className
            )}
            {...props}
        />
    )
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
