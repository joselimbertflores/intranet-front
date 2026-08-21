import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ThemeService } from './core/theme/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('intranet-frontend');

  constructor() {
    inject(ThemeService);
  }

  readonly toastBreakpoints = {
    '920px': {
      width: '70%',
      right: '1rem',
      left: '1rem',
    },
    '640px': {
      width: 'calc(100% - 2rem)',
      right: '1rem',
      left: '1rem',
    },
  };
}
