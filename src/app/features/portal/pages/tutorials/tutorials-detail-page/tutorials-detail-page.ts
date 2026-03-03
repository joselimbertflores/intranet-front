import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
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
  private location = inject(Location);
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
