import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';

import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { lucideDownload } from '@ng-icons/lucide';

import { FileIcon, FileSizePipe } from '../../../../../../shared';
import { PortalDocumentResponse } from '../../../../interfaces';

export type DocumentViewMode = 'list' | 'grid';

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
})
export class PortalDocumentListItem {
  readonly document = input.required<PortalDocumentResponse>();
  readonly viewMode = input<DocumentViewMode>('list');
}
