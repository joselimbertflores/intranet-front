import { DatePipe, Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideExternalLink,
  lucideFileText,
  lucideRefreshCw,
} from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';

import { FileSizePipe } from '../../../../../shared';
import { TutorialBlockType } from '../../../interfaces';
import { PortalTutorialDataSource } from '../../../services';
import { TutorialYoutubeUrlPipe } from '../tutorial-youtube-url.pipe';

@Component({
  selector: 'app-tutorials-detail-page',
  imports: [
    DatePipe,
    FileSizePipe,
    HlmBadgeImports,
    HlmButtonImports,
    HlmSkeletonImports,
    NgIcon,
    TutorialYoutubeUrlPipe,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideExternalLink,
      lucideFileText,
      lucideRefreshCw,
    }),
  ],
  templateUrl: './tutorials-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TutorialsDetailPage {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly dataSource = inject(PortalTutorialDataSource);
  private readonly previousUrl =
    this.router.currentNavigation()?.previousNavigation?.finalUrl?.toString() ??
    this.router.lastSuccessfulNavigation()?.previousNavigation?.finalUrl?.toString() ??
    null;
  private readonly canReturnToTutorialList =
    this.previousUrl === '/tutorials' ||
    Boolean(this.previousUrl?.startsWith('/tutorials?'));

  readonly slug = input.required<string>();
  readonly blockType = TutorialBlockType;
  readonly tutorial = rxResource({
    params: () => ({ slug: this.slug() }),
    stream: ({ params }) => this.dataSource.findBySlug(params.slug),
  });
  readonly notFound = computed(() => {
    const error = this.tutorial.error();
    return error instanceof HttpErrorResponse && error.status === 404;
  });

  goBack(): void {
    if (this.canReturnToTutorialList) {
      this.location.back();
      return;
    }
    void this.router.navigate(['/tutorials']);
  }
}
