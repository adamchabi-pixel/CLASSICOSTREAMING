import React, { useRef, useEffect, useCallback } from "react";

interface MomentumCarouselProps {
  id: string;
  className?: string;
  children: React.ReactNode;
  containerRef?: (el: HTMLDivElement | null) => void;
}

export const MomentumCarousel: React.FC<MomentumCarouselProps> = ({
  id,
  className = "flex gap-4 sm:gap-8 overflow-x-auto no-scrollbar pt-4 px-1 pb-6 sm:pb-10",
  children,
  containerRef
}) => {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const isPointerDownRef = useRef(false);
  const startXRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  const stopAnimation = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  // Set the combined ref
  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      innerRef.current = el;
      if (containerRef) {
        containerRef(el);
      }
    },
    [containerRef]
  );

  // Physics-based momentum deceleration: "c normal au début après ca freine"
  const startMomentumDeceleration = useCallback(() => {
    stopAnimation();
    const container = innerRef.current;
    if (!container) return;

    let currentVelocity = velocityRef.current;
    // Cap maximum initial velocity for a natural, controlled feel
    const maxVelocity = 40;
    if (Math.abs(currentVelocity) > maxVelocity) {
      currentVelocity = Math.sign(currentVelocity) * maxVelocity;
    }

    // Only apply momentum if there's noticeable flick
    if (Math.abs(currentVelocity) < 0.8) return;

    // Friction factor: 0.93 gives a smooth glide that visibly decelerates and brakes softly
    const friction = 0.93;
    const minThreshold = 0.35;

    const animate = () => {
      if (!innerRef.current) return;
      innerRef.current.scrollLeft -= currentVelocity;
      currentVelocity *= friction;

      if (Math.abs(currentVelocity) > minThreshold) {
        rafIdRef.current = requestAnimationFrame(animate);
      } else {
        rafIdRef.current = null;
      }
    };

    rafIdRef.current = requestAnimationFrame(animate);
  }, [stopAnimation]);

  // Mouse / Pointer Drag Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary button
    if (e.button !== 0) return;
    stopAnimation();

    isPointerDownRef.current = true;
    isDraggingRef.current = false;
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current || !innerRef.current) return;

    const now = performance.now();
    const dt = Math.max(1, now - lastTimeRef.current);
    const dx = e.clientX - lastXRef.current;

    // Filter minor jitter before claiming a drag
    if (Math.abs(e.clientX - startXRef.current) > 5) {
      isDraggingRef.current = true;
    }

    if (isDraggingRef.current) {
      innerRef.current.scrollLeft -= dx;
      // Exponential moving average for velocity calculation (pixels per ~16ms frame)
      const instantVelocity = (dx / dt) * 16;
      velocityRef.current = velocityRef.current * 0.6 + instantVelocity * 0.4;

      lastXRef.current = e.clientX;
      lastTimeRef.current = now;
    }
  };

  const handlePointerUp = () => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;

    if (isDraggingRef.current) {
      startMomentumDeceleration();
      // Keep isDraggingRef active briefly so child click handler can ignore accidental click
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 50);
    }
  };

  const handlePointerCancel = () => {
    isPointerDownRef.current = false;
    isDraggingRef.current = false;
    stopAnimation();
  };

  // Intercept click on children if dragging happened
  const handleClickCapture = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, [stopAnimation]);

  return (
    <div
      id={id}
      ref={setRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClickCapture={handleClickCapture}
      className={`${className} cursor-grab active:cursor-grabbing select-none`}
      style={{
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-x pan-y"
      }}
    >
      {children}
    </div>
  );
};
