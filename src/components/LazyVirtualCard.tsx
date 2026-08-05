import React, { useState, useEffect, useRef } from "react";

// Singleton observer to share across all cards for massive performance gain
let sharedObserver: IntersectionObserver | null = null;
const callbacks = new WeakMap<Element, (isIntersecting: boolean) => void>();

function getObserver() {
  if (typeof window === "undefined") return null;
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const callback = callbacks.get(entry.target);
            if (callback) {
              callback(true);
              if (sharedObserver) sharedObserver.unobserve(entry.target);
            }
          }
        });
      },
      {
        rootMargin: "400px", // Preload slightly more
        threshold: 0.01,
      }
    );
  }
  return sharedObserver;
}

interface LazyVirtualCardProps {
  children: React.ReactNode;
  key?: string;
  className?: string;
  priority?: boolean;
}

export default function LazyVirtualCard({ children, className, priority = false }: LazyVirtualCardProps) {
  const [isIntersecting, setIsIntersecting] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return;
    
    const el = containerRef.current;
    if (!el) return;
    
    callbacks.set(el, setIsIntersecting);
    const observer = getObserver();
    if (observer) {
      observer.observe(el);
    }
    
    return () => {
      if (observer && el) {
        observer.unobserve(el);
      }
      callbacks.delete(el);
    };
  }, [priority]);

  return (
    <div
      ref={containerRef}
      className={`shrink-0 ${className || "w-[140px] min-[400px]:w-[160px] sm:w-[210px] aspect-[2/3]"}`}
      style={{ containIntrinsicSize: "170px 255px" }}
    >
      {isIntersecting ? (
        children
      ) : (
        <div className="w-full h-full rounded-xl bg-neutral-900 border border-neutral-800/40 opacity-30" />
      )}
    </div>
  );
}
