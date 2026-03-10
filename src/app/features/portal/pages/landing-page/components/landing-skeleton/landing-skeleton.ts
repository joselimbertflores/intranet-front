import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'landing-skeleton',
  imports: [],
  template: `
  <!-- Loader skeleton  from landing sections-->
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingSkeleton { }
