import { DatePipe, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideDownload, lucideFileText } from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';

import { FileSizePipe } from '../../../../../shared';
import { PortalTutorialDataSource } from '../../../services';
import { TutorialBlockType } from '../../../interfaces';
import { TutorialYoutubeUrlPipe } from '../tutorial-youtube-url.pipe';

@Component({
  selector: 'app-tutorials-detail-page',
  imports: [
    DatePipe,
    FileSizePipe,
    HlmBadge,
    HlmButtonImports,
    HlmSkeleton,
    NgIcon,
    TutorialYoutubeUrlPipe,
  ],
  providers: [provideIcons({ lucideArrowLeft, lucideDownload, lucideFileText })],
  templateUrl: './tutorials-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TutorialsDetailPage {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly dataSource = inject(PortalTutorialDataSource);
  private readonly hasPreviousNavigation = Boolean(
    this.router.currentNavigation()?.previousNavigation ??
      this.router.lastSuccessfulNavigation()?.previousNavigation,
  );

  readonly slug = input.required<string>();
  readonly blockType = TutorialBlockType;
  readonly tutorial = rxResource({
    params: () => ({ slug: this.slug() }),
    stream: ({ params }) => this.dataSource.findBySlug(params.slug),
  });

  goBack(): void {
    if (this.hasPreviousNavigation) {
      this.location.back();
      return;
    }
    void this.router.navigate(['/tutorials']);
  }
}
