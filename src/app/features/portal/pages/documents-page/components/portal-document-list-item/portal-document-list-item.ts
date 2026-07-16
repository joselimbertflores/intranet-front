import { Component, input } from '@angular/core';

import { FileIcon, FileSizePipe } from '../../../../../../shared';
import { PortalDocumentResponse } from '../../../../interfaces';

@Component({
  selector: 'portal-document-list-item',
  imports: [FileIcon, FileSizePipe],
  templateUrl: './portal-document-list-item.html',
})
export class PortalDocumentListItem {
  document = input.required<PortalDocumentResponse>();
}
