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

  // Drag interaction flags
  const isDraggingRef = useRef(false);
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const lastMouseXRef = useRef(0);
  const lastMouseTimeRef = useRef(0);
  const mouseSamplesRef = useRef<Array<{ dx: number; dt: number; time: number }>>([]);
  const rafIdRef = useRef<number | null>(null);

  const stopAnimation = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      innerRef.current = el;
      if (containerRef) {
        containerRef(el);
      }
    },
    [containerRef]
  );

  // Smooth, luxurious inertia glide for desktop mouse release
  const startDesktopGlide = useCallback((initialVelocityPxPerMs: number) => {
    stopAnimation();
    const container = innerRef.current;
    if (!container) return;

    if (Math.abs(initialVelocityPxPerMs) < 0.05) return;

    // Cap velocity for natural, fluid momentum flick
    const maxVelocity = 3.2;
    let velocity = Math.sign(initialVelocityPxPerMs) * Math.min(Math.abs(initialVelocityPxPerMs), maxVelocity);

    let lastTime = performance.now();

    const step = (currentTime: number) => {
      if (!innerRef.current) return;
      const dt = Math.min(32, currentTime - lastTime);
      lastTime = currentTime;

      // Silky smooth physical deceleration curve
      velocity *= Math.pow(0.952, dt / 16.67);

      innerRef.current.scrollLeft -= velocity * dt;

      if (Math.abs(velocity) > 0.03) {
        rafIdRef.current = requestAnimationFrame(step);
      } else {
        rafIdRef.current = null;
      }
    };

    rafIdRef.current = requestAnimationFrame(step);
  }, [stopAnimation]);

  // Touch handling on mobile:
  // Use native hardware-accelerated 120Hz compositor scrolling (never blocks the main thread with preventDefault)
  // while tracking movement to suppress accidental card clicks when swiping.
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let moved = false;

    const onTouchStart = (e: TouchEvent) => {
      stopAnimation();
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      moved = false;
      isDraggingRef.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const dx = Math.abs(e.touches[0].clientX - touchStartX);
      const dy = Math.abs(e.touches[0].clientY - touchStartY);

      if (dx > 8 || dy > 8) {
        moved = true;
        if (dx > dy) {
          isDraggingRef.current = true;
        }
      }
    };

    const onTouchEnd = () => {
      if (moved && isDraggingRef.current) {
        // Keep isDragging active briefly so card onClick is prevented
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 120);
      } else {
        isDraggingRef.current = false;
      }
    };

    // Native touch listeners with passive: true for buttery 120Hz scrolling
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });

    const onWheel = () => {
      stopAnimation();
    };
    el.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
      el.removeEventListener("wheel", onWheel);
    };
  }, [stopAnimation]);

  // Desktop Mouse Drag Handling (Click and drag smoothly on desktop)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !innerRef.current) return;
    stopAnimation();

    isMouseDownRef.current = true;
    isDraggingRef.current = false;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startScrollLeftRef.current = innerRef.current.scrollLeft;
    lastMouseXRef.current = e.clientX;
    lastMouseTimeRef.current = performance.now();
    mouseSamplesRef.current = [];

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isMouseDownRef.current || !innerRef.current) return;
      const now = performance.now();
      const totalDx = moveEvent.clientX - startXRef.current;
      const dx = moveEvent.clientX - lastMouseXRef.current;

      if (Math.abs(totalDx) > 5) {
        isDraggingRef.current = true;
      }

      if (isDraggingRef.current) {
        innerRef.current.scrollLeft = startScrollLeftRef.current - totalDx;
        const dt = Math.max(1, now - lastMouseTimeRef.current);
        mouseSamplesRef.current.push({ dx, dt, time: now });
        mouseSamplesRef.current = mouseSamplesRef.current.filter(s => now - s.time < 100);

        lastMouseXRef.current = moveEvent.clientX;
        lastMouseTimeRef.current = now;
      }
    };

    const onMouseUp = () => {
      isMouseDownRef.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      if (isDraggingRef.current) {
        const recent = mouseSamplesRef.current;
        if (recent.length > 0) {
          const sumDx = recent.reduce((acc, s) => acc + s.dx, 0);
          const sumDt = Math.max(1, recent.reduce((acc, s) => acc + s.dt, 0));
          const velocity = sumDx / sumDt; // px per ms
          startDesktopGlide(velocity);
        }
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 100);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Intercept click on child cards if dragging occurred
  const handleClickCapture = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, [stopAnimation]);

  return (
    <div
      id={id}
      ref={setRef}
      onMouseDown={handleMouseDown}
      onClickCapture={handleClickCapture}
      className={`${className} cursor-grab active:cursor-grabbing select-none`}
      style={{
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-x pan-y",
        overscrollBehaviorX: "contain",
        scrollBehavior: "auto",
        willChange: "scroll-position",
        transform: "translateZ(0)"
      }}
    >
      {children}
    </div>
  );
};
