import { Directive, ElementRef, inject } from '@angular/core';
import type { AnimationCallbackEvent } from '@angular/core';
import { playIfMotionAllowed } from '../dynamic-form/gsap-motion.util';
import { buildCollapseEnterTimeline, buildCollapseExitTimeline } from './wwell-collapse-animate.animation';

/**
 * Drop-in smooth open/close for any block Angular's control flow (`@if`/`@for`) adds or removes
 * from the DOM — a section swapping from its read display to an edit form, a timeline step
 * expanding, a filter row appearing. Without this, `@if` just snaps the DOM in and out instantly,
 * which is the "tabs" in this editor (section edit toggles, timeline step accordions) reading as
 * abrupt rather than smooth.
 *
 * Hooks Angular's native `animate.enter`/`animate.leave` (fired right before insertion / right
 * before removal — see @angular/core's `AnimationCallbackEvent`) to run a lightweight, compositor-
 * only (opacity + transform, never height — see wwell-collapse-animate.animation.ts) GSAP tween
 * instead of nothing. `animate.leave`'s `animationComplete()` is what actually lets Angular
 * detach the node, so the exit tween is guaranteed to finish on screen before the element
 * disappears, no matter what triggered the removal. Respects prefers-reduced-motion via the
 * shared `playIfMotionAllowed` (jumps straight to the end state, still resolving
 * `animationComplete()` either way, so a reduced-motion user is never left with an undetached
 * node stuck mid-removal).
 *
 * Usage: add the `appWwellCollapseAnimate` attribute directly to whichever element is the root of
 * the `@if`/`@else` branch that should transition — e.g. both the read-display root and the
 * edit-form root of a section, so switching between them cross-fades instead of swapping instantly.
 */
@Directive({
  selector: '[appWwellCollapseAnimate]',
  standalone: true,
  host: {
    '(animate.enter)': 'onEnter($event)',
    '(animate.leave)': 'onLeave($event)',
  },
})
export class WwellCollapseAnimateDirective {
  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected onEnter(event: AnimationCallbackEvent): void {
    playIfMotionAllowed(buildCollapseEnterTimeline(this.hostEl, () => event.animationComplete()));
  }

  protected onLeave(event: AnimationCallbackEvent): void {
    playIfMotionAllowed(buildCollapseExitTimeline(this.hostEl, () => event.animationComplete()));
  }
}
