// Centralized modal animation configuration
// One place to tweak timings and distances for ALL popups/modals

export const MODAL_ANIM_IN_MS = 600; // enter/open duration
export const MODAL_ANIM_OUT_MS = 300; // leave/close duration (2x faster)

// Shared Tailwind class snippets for Headless UI Transitions
export const MODAL_OVERLAY_BASE = 'fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity';
export const MODAL_OVERLAY_ENTER = `ease-out duration-[${MODAL_ANIM_IN_MS}ms]`;
export const MODAL_OVERLAY_LEAVE = `ease-in duration-[${MODAL_ANIM_OUT_MS}ms]`;

export const MODAL_PANEL_ENTER = `ease-out duration-[${MODAL_ANIM_IN_MS}ms]`;
export const MODAL_PANEL_ENTER_FROM = 'opacity-0 translate-y-24 sm:translate-y-28 sm:scale-95';
export const MODAL_PANEL_ENTER_TO = 'opacity-100 translate-y-0 sm:scale-100';

export const MODAL_PANEL_LEAVE = `ease-in duration-[${MODAL_ANIM_OUT_MS}ms]`;
export const MODAL_PANEL_LEAVE_FROM = 'opacity-100 translate-y-0 sm:scale-100';
export const MODAL_PANEL_LEAVE_TO = 'opacity-0 translate-y-24 sm:translate-y-28 sm:scale-95';

// Helper to build non-HeadlessUI classes (when we toggle visibility manually)
export function buildNonHeadlessUiPanelClasses(isVisible: boolean, extra: string = ''): string {
  const duration = isVisible ? MODAL_ANIM_IN_MS : MODAL_ANIM_OUT_MS;
  const ease = isVisible ? 'ease-out' : 'ease-in';
  const transform = isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24 sm:translate-y-28';
  return `${extra} transform transition-all ${ease} duration-[${duration}ms] ${transform}`.trim();
}

export function buildNonHeadlessUiOverlayClasses(isVisible: boolean): string {
  const duration = isVisible ? MODAL_ANIM_IN_MS : MODAL_ANIM_OUT_MS;
  const opacity = isVisible ? 'opacity-100' : 'opacity-0';
  return `${MODAL_OVERLAY_BASE} duration-[${duration}ms] ${opacity}`.trim();
}


