import {
  DestroyRef,
  Directive,
  ElementRef,
  OnInit,
  Renderer2,
  inject,
  input,
  numberAttribute,
} from '@angular/core';

const revealCallbacks = new Map<Element, () => void>();
let revealObserver: IntersectionObserver | null = null;

function releaseObserverWhenIdle(): void {
  if (revealCallbacks.size > 0) return;

  revealObserver?.disconnect();
  revealObserver = null;
}

function observeOnce(
  element: Element,
  reveal: () => void,
): () => void {
  const observer =
    revealObserver ??
    (revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const callback = revealCallbacks.get(entry.target);
          callback?.();
          revealCallbacks.delete(entry.target);
          revealObserver?.unobserve(entry.target);
        }

        releaseObserverWhenIdle();
      },
      {
        rootMargin: '0px 0px -10% 0px',
        threshold: 0,
      },
    ));

  revealCallbacks.set(element, reveal);

  try {
    observer.observe(element);
  } catch (error) {
    revealCallbacks.delete(element);
    releaseObserverWhenIdle();
    throw error;
  }

  return () => {
    if (!revealCallbacks.delete(element)) return;

    revealObserver?.unobserve(element);
    releaseObserverWhenIdle();
  };
}

@Directive({
  selector: '[landingReveal]',
  host: {
    'data-landing-reveal': 'pending',
    '[style.--landing-reveal-delay.ms]': 'delay()',
  },
})
export class LandingReveal implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  readonly delay = input(0, {
    alias: 'landingRevealDelay',
    transform: numberAttribute,
  });

  ngOnInit(): void {
    const element = this.elementRef.nativeElement;
    const view = element.ownerDocument.defaultView;

    if (
      !view ||
      !('IntersectionObserver' in view) ||
      view.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      this.reveal(element);
      return;
    }

    try {
      const stopObserving = observeOnce(element, () => {
        this.reveal(element);
      });
      this.destroyRef.onDestroy(stopObserving);
    } catch {
      this.reveal(element);
    }
  }

  private reveal(element: HTMLElement): void {
    this.renderer.setAttribute(element, 'data-landing-reveal', 'revealed');
  }
}
