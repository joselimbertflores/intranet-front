import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'public-page-header',
  template: `
    <header class="public-page-header">
      <svg
        class="public-page-header-pattern"
        viewBox="0 0 900 140"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <path class="contour-line contour-line-soft" d="M374 118c92-82 159 34 262-42S807 5 943 65" />
        <path class="contour-line" d="M407 139c88-77 158 35 258-35S830 30 949 85" />
        <path class="contour-line contour-line-soft" d="M450 157c81-66 150 31 247-31s158-69 260-20" />
        <path class="contour-line contour-line-fine" d="M520-8c61 46 119 10 180 43s121 42 227-3" />
        <g class="editorial-dots">
          <circle cx="566" cy="28" r="2" />
          <circle cx="612" cy="54" r="4.5" />
          <circle class="dot-soft" cx="659" cy="18" r="2.5" />
          <circle cx="706" cy="83" r="3" />
          <circle class="dot-soft" cx="754" cy="42" r="5.5" />
          <circle cx="806" cy="105" r="2" />
          <circle cx="850" cy="63" r="3.5" />
          <circle class="dot-soft" cx="904" cy="21" r="4" />
        </g>
      </svg>

      <div
        class="relative z-10 mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8"
      >
        <div class="max-w-3xl">
          <h1
            class="text-2xl font-bold leading-tight tracking-tight text-primary sm:text-3xl"
          >
            {{ title() }}
          </h1>

          <p
            class="mt-1.5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg"
          >
            {{ description() }}
          </p>
        </div>
      </div>
    </header>
  `,
  styles: `
    :host {
      display: block;
    }

    .public-page-header {
      position: relative;
      width: 100%;
      overflow: hidden;
      border-bottom: 1px solid
        color-mix(in oklch, var(--primary) 30%, var(--border));
      background:
        radial-gradient(
          ellipse at 82% -45%,
          color-mix(in oklch, var(--primary) 35%, transparent) 0%,
          transparent 52%
        ),
        linear-gradient(
          108deg,
          color-mix(in oklch, var(--landing-forest) 13%, var(--background)) 0%,
          color-mix(in oklch, var(--primary) 18%, var(--background)) 48%,
          color-mix(in oklch, var(--landing-teal) 36%, var(--background)) 100%
        );
      box-shadow:
        inset 0 1px color-mix(in srgb, white 20%, transparent),
        inset 0 -1px color-mix(in oklch, var(--primary) 15%, transparent);
    }

    .public-page-header-pattern {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      color: color-mix(
        in oklch,
        var(--primary) 66%,
        var(--landing-teal)
      );
      opacity: 0.5;
      pointer-events: none;
      mask-image: linear-gradient(90deg, transparent 34%, black 64%);
    }

    .contour-line {
      fill: none;
      stroke: currentColor;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 1.25;
      vector-effect: non-scaling-stroke;
    }

    .contour-line-soft {
      opacity: 0.62;
      stroke-width: 0.95;
    }

    .contour-line-fine {
      opacity: 0.42;
      stroke-width: 0.8;
    }

    .editorial-dots {
      fill: currentColor;
    }

    .dot-soft {
      opacity: 0.5;
    }

    @media (max-width: 639px) {
      .public-page-header {
        background:
          radial-gradient(
            ellipse at 98% -35%,
            color-mix(in oklch, var(--primary) 32%, transparent) 0%,
            transparent 48%
          ),
          linear-gradient(
            108deg,
            color-mix(
                in oklch,
                var(--landing-forest) 12%,
                var(--background)
              )
              0%,
            color-mix(in oklch, var(--primary) 17%, var(--background)) 58%,
            color-mix(in oklch, var(--landing-teal) 28%, var(--background))
              100%
          );
      }

      .public-page-header-pattern {
        opacity: 0.36;
        mask-image: linear-gradient(90deg, transparent 50%, black 82%);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicPageHeader {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
