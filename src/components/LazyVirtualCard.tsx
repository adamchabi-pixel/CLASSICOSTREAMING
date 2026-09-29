import React from "react";

interface LazyVirtualCardProps {
  children: React.ReactNode;
  key?: string;
  className?: string;
  placeholderClassName?: string;
  priority?: boolean;
}

export default function LazyVirtualCard({ children, className, priority = false }: LazyVirtualCardProps) {
  return (
    <div className={`shrink-0 ${className || "w-[140px] min-[400px]:w-[160px] sm:w-[210px] aspect-[2/3]"}`}>
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<any>, {
            priority: (children as any).props.priority ?? priority,
          })
        : children}
    </div>
  );
}
