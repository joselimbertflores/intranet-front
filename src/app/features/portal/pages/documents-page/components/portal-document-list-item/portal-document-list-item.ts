import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDownload } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';

import { FileIcon, FileSizePipe } from '../../../../../../shared';
import { PortalDocumentResponse } from '../../../../interfaces';

@Component({
  selector: 'portal-document-list-item',
  imports: [
    DatePipe,
    FileIcon,
    FileSizePipe,
    HlmBadgeImports,
    HlmButton,
    NgIcon,
  ],
  providers: [provideIcons({ lucideDownload })],
  templateUrl: './portal-document-list-item.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortalDocumentListItem {
  readonly document = input.required<PortalDocumentResponse>();
}
