import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

import { PortalTutorialDataSource } from '../../../services';
import { FileIcon, FileSizePipe, SafeUrlPipe } from '../../../../../shared';

@Component({
  selector: 'app-tutorials-detail-page',
  imports: [
    CommonModule,
    ButtonModule,
    TagModule,
    FileIcon,
    FileSizePipe,
    SafeUrlPipe,
  ],
  templateUrl: './tutorials-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TutorialsDetailPage {
  private router = inject(Router);
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private portalTutorialService = inject(PortalTutorialDataSource);

  slug = input.required<string>();

  tutorial = rxResource({
    params: () => ({ id: this.slug() }),
    stream: ({ params }) => this.portalTutorialService.findBySlug(params.id),
  });

  goBack() {
    this.location.back();
  }
}
