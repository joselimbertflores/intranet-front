import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-icon',
  imports: [],
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      class="shrink-0"
    >
      <defs>
        <linearGradient
          id="logoGradient"
          x1="80"
          y1="80"
          x2="420"
          y2="420"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" style="stop-color: var(--p-primary-600)" />
          <stop offset="100%" style="stop-color: var(--p-primary-300)" />
        </linearGradient>

        <clipPath id="circleClip">
          <circle cx="256" cy="256" r="230" />
        </clipPath>
      </defs>

      <circle cx="256" cy="256" r="230" fill="url(#logoGradient)" />

      <g
        class="stroke-surface-0"
        stroke-width="30"
        stroke-linecap="round"
        fill="none"
        clip-path="url(#circleClip)"
      >
        <path d="M30 380 C120 330 150 305 190 290" />
        <path d="M190 290 C260 225 310 200 365 175" />
        <path d="M365 175 C395 240 395 285 360 345" />
        <path d="M190 300 C260 315 310 330 350 350" />
      </g>

      <g class="fill-surface-0">
        <circle cx="190" cy="290" r="42" />
        <circle cx="365" cy="175" r="46" />
        <circle cx="350" cy="350" r="60" />
      </g>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppIcon {
  size = input<number>(32);
}
