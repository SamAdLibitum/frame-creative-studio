import type { ElementAnimationConfig } from '../../types/studio.ts';

export interface MotionBaseProps {
  x: number;
  y: number;
  opacity: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
}

export interface EvaluatedMotionProps {
  x: number;
  y: number;
  opacity: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
}

function clamp(val: number, min: number, max: number): number {
  if (!Number.isFinite(val)) return min;
  return Math.max(min, Math.min(max, val));
}

function easeOutCubic(t: number): number {
  const u = clamp(t, 0, 1);
  return 1 - Math.pow(1 - u, 3);
}

function easeInOutSine(t: number): number {
  const u = clamp(t, 0, 1);
  return -(Math.cos(Math.PI * u) - 1) / 2;
}

/**
 * Pure, deterministic motion evaluator (0–5s timeline, zero Math.random, never mutates input).
 */
export function evaluateElementMotion(
  baseProps: MotionBaseProps,
  animation: ElementAnimationConfig | undefined,
  timeSec: number,
): EvaluatedMotionProps {
  const baseX = Number.isFinite(baseProps.x) ? baseProps.x : 0;
  const baseY = Number.isFinite(baseProps.y) ? baseProps.y : 0;
  const baseOpacity = clamp(
    Number.isFinite(baseProps.opacity) ? baseProps.opacity : 1,
    0,
    1,
  );
  const baseScaleX = Number.isFinite(baseProps.scaleX ?? 1)
    ? (baseProps.scaleX ?? 1)
    : 1;
  const baseScaleY = Number.isFinite(baseProps.scaleY ?? 1)
    ? (baseProps.scaleY ?? 1)
    : 1;
  const baseRotation = Number.isFinite(baseProps.rotation ?? 0)
    ? (baseProps.rotation ?? 0)
    : 0;

  if (!animation || !animation.preset || animation.preset === 'none') {
    return {
      x: baseX,
      y: baseY,
      opacity: baseOpacity,
      scaleX: baseScaleX,
      scaleY: baseScaleY,
      rotation: baseRotation,
    };
  }

  const t = clamp(timeSec, 0, 5);
  const duration = clamp(animation.duration, 0.3, 3.0);
  const delay = clamp(animation.delay, 0, 2.0);
  const localTime = Math.max(0, t - delay);
  const progress = clamp(localTime / duration, 0, 1);

  switch (animation.preset) {
    case 'fade-in': {
      const eased = easeOutCubic(progress);
      return {
        x: baseX,
        y: baseY,
        opacity: t < delay ? 0 : baseOpacity * eased,
        scaleX: baseScaleX,
        scaleY: baseScaleY,
        rotation: baseRotation,
      };
    }

    case 'slide-up': {
      const eased = easeOutCubic(progress);
      const slideDistance = 64;
      return {
        x: baseX,
        y: baseY + slideDistance * (1 - eased),
        opacity: t < delay ? 0 : baseOpacity * eased,
        scaleX: baseScaleX,
        scaleY: baseScaleY,
        rotation: baseRotation,
      };
    }

    case 'float': {
      const phase = (localTime / duration) * Math.PI * 2;
      const offsetY = t < delay ? 0 : Math.sin(phase) * 14;
      return {
        x: baseX,
        y: baseY + offsetY,
        opacity: baseOpacity,
        scaleX: baseScaleX,
        scaleY: baseScaleY,
        rotation: baseRotation,
      };
    }

    case 'slow-zoom': {
      const eased = easeInOutSine(progress);
      const zoomFactor = 1 + 0.08 * eased;
      return {
        x: baseX,
        y: baseY,
        opacity: baseOpacity,
        scaleX: baseScaleX * zoomFactor,
        scaleY: baseScaleY * zoomFactor,
        rotation: baseRotation,
      };
    }

    case 'pulse': {
      const phase = (localTime / duration) * Math.PI * 2;
      const wave = t < delay ? 0 : Math.sin(phase);
      const scaleFactor = 1 + 0.035 * wave;
      const opFactor = 1 - 0.12 * (0.5 - 0.5 * wave);
      return {
        x: baseX,
        y: baseY,
        opacity: clamp(baseOpacity * opFactor, 0, 1),
        scaleX: baseScaleX * scaleFactor,
        scaleY: baseScaleY * scaleFactor,
        rotation: baseRotation,
      };
    }

    default:
      return {
        x: baseX,
        y: baseY,
        opacity: baseOpacity,
        scaleX: baseScaleX,
        scaleY: baseScaleY,
        rotation: baseRotation,
      };
  }
}
