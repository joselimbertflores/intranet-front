import { Component, input } from '@angular/core';

import { ButtonModule } from 'primeng/button';

import { FileIcon, FileSizePipe } from '../../../../../../shared';
import { PortalDocumentResponse } from '../../../../interfaces';

@Component({
  selector: 'portal-document-grid-card',
  imports: [ButtonModule, FileIcon, FileSizePipe],
  templateUrl: './portal-document-grid-card.html',
})
export class PortalDocumentGridCard {
  document = input.required<PortalDocumentResponse>();
}
