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

  // Drag & Swipe State
  const isInteractingRef = useRef(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const directionLockRef = useRef<"horizontal" | "vertical" | null>(null);

  // Velocity sample buffer (stores recent displacements over trailing ~90ms)
  const samplesRef = useRef<Array<{ dx: number; dt: number; time: number }>>([]);
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

  // Progressive Braking Glide: normal at release, then smoothly and noticeably brakes to a halt at the end
  const startBrakingGlide = useCallback((velocityPxPerMs: number) => {
    stopAnimation();
    const container = innerRef.current;
    if (!container) return;

    // Negligible flick -> stay put
    if (Math.abs(velocityPxPerMs) < 0.12) return;

    // Strict velocity cap to keep swipe moderate and calm ("un peu moins rapide et sensible")
    const MAX_VELOCITY = 1.15; // px/ms
    const cappedVelocity = Math.sign(velocityPxPerMs) * Math.min(Math.abs(velocityPxPerMs), MAX_VELOCITY);

    // Limit glide distance to at most 60% of visible container width
    const maxGlide = container.clientWidth * 0.60;
    let glideDistance = cappedVelocity * 260;
    if (Math.abs(glideDistance) > maxGlide) {
      glideDistance = Math.sign(glideDistance) * maxGlide;
    }

    if (Math.abs(glideDistance) < 15) return;

    const startScroll = container.scrollLeft;
    // Bound target scroll within container boundaries
    const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);
    const targetScroll = Math.max(0, Math.min(maxScroll, startScroll - glideDistance));
    const totalTravel = targetScroll - startScroll;

    if (Math.abs(totalTravel) < 4) return;

    // Duration between 420ms and 650ms depending on travel
    const duration = Math.min(650, Math.max(420, Math.abs(totalTravel) * 1.4));
    const startTime = performance.now();

    // Quartic ease-out braking curve: rapid/steady travel early on, then prominent progressive braking to a soft halt
    const easeOutBraking = (t: number) => 1 - Math.pow(1 - t, 3.8);

    const animate = (currentTime: number) => {
      if (!innerRef.current) return;
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = easeOutBraking(progress);

      innerRef.current.scrollLeft = startScroll + totalTravel * ease;

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(animate);
      } else {
        rafIdRef.current = null;
      }
    };

    rafIdRef.current = requestAnimationFrame(animate);
  }, [stopAnimation]);

  // Touch Event Handling (Native listeners for passive: false support so horizontal swipe doesn't conflict)
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      stopAnimation();
      if (e.touches.length !== 1) return;

      const touch = e.touches[0];
      isInteractingRef.current = true;
      isDraggingRef.current = false;
      directionLockRef.current = null;
      startXRef.current = touch.clientX;
      startYRef.current = touch.clientY;
      lastXRef.current = touch.clientX;
      lastTimeRef.current = performance.now();
      samplesRef.current = [];
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isInteractingRef.current || e.touches.length !== 1) return;

      const touch = e.touches[0];
      const now = performance.now();
      const dx = touch.clientX - lastXRef.current;
      const totalDx = touch.clientX - startXRef.current;
      const totalDy = touch.clientY - startYRef.current;

      // Determine gesture direction on initial threshold
      if (directionLockRef.current === null) {
        if (Math.abs(totalDx) > 6 || Math.abs(totalDy) > 6) {
          if (Math.abs(totalDy) > Math.abs(totalDx)) {
            // User is scrolling the whole webpage vertically: let browser handle natively
            directionLockRef.current = "vertical";
          } else {
            // User is swiping horizontally through the movie carousel
            directionLockRef.current = "horizontal";
          }
        }
      }

      if (directionLockRef.current === "horizontal") {
        // Prevent native horizontal runaway scroll & pull navigation
        if (e.cancelable) {
          e.preventDefault();
        }
        isDraggingRef.current = true;

        if (innerRef.current) {
          // Weighted tracking sensitivity (0.90) for calm, non-jittery finger movement
          innerRef.current.scrollLeft -= dx * 0.90;
        }

        const dt = Math.max(1, now - lastTimeRef.current);
        samplesRef.current.push({ dx, dt, time: now });
        // Retain only samples from the last 90ms for accurate release flick velocity
        samplesRef.current = samplesRef.current.filter(s => now - s.time < 90);

        lastXRef.current = touch.clientX;
        lastTimeRef.current = now;
      }
    };

    const onTouchEnd = () => {
      if (!isInteractingRef.current) return;
      isInteractingRef.current = false;

      if (directionLockRef.current === "horizontal" && isDraggingRef.current) {
        // Compute release flick velocity from recent samples
        const recent = samplesRef.current;
        if (recent.length > 0) {
          const sumDx = recent.reduce((acc, s) => acc + s.dx, 0);
          const sumDt = Math.max(1, recent.reduce((acc, s) => acc + s.dt, 0));
          const velocity = sumDx / sumDt; // px per ms
          startBrakingGlide(velocity);
        }

        // Prevent accidental card click upon swipe completion
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 80);
      } else {
        isDraggingRef.current = false;
      }
      directionLockRef.current = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [startBrakingGlide, stopAnimation]);

  // Desktop Mouse Drag Handling
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    stopAnimation();

    isInteractingRef.current = true;
    isDraggingRef.current = false;
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    samplesRef.current = [];

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isInteractingRef.current || !innerRef.current) return;
      const now = performance.now();
      const dx = moveEvent.clientX - lastXRef.current;

      if (Math.abs(moveEvent.clientX - startXRef.current) > 5) {
        isDraggingRef.current = true;
      }

      if (isDraggingRef.current) {
        innerRef.current.scrollLeft -= dx * 0.90;
        const dt = Math.max(1, now - lastTimeRef.current);
        samplesRef.current.push({ dx, dt, time: now });
        samplesRef.current = samplesRef.current.filter(s => now - s.time < 90);

        lastXRef.current = moveEvent.clientX;
        lastTimeRef.current = now;
      }
    };

    const onMouseUp = () => {
      isInteractingRef.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      if (isDraggingRef.current) {
        const recent = samplesRef.current;
        if (recent.length > 0) {
          const sumDx = recent.reduce((acc, s) => acc + s.dx, 0);
          const sumDt = Math.max(1, recent.reduce((acc, s) => acc + s.dt, 0));
          const velocity = sumDx / sumDt;
          startBrakingGlide(velocity);
        }
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 80);
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
        touchAction: "pan-y",
        overscrollBehaviorX: "contain"
      }}
    >
      {children}
    </div>
  );
};
