import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideFile,
  lucideFileAudio,
  lucideFileImage,
  lucideFileSpreadsheet,
  lucideFileText,
  lucideFileVideo,
  lucidePresentation,
} from '@ng-icons/lucide';

const extensionIconMap: Readonly<Record<string, string>> = {
  pdf: 'lucideFileText',
  doc: 'lucideFileText',
  docx: 'lucideFileText',
  odt: 'lucideFileText',
  xls: 'lucideFileSpreadsheet',
  xlsx: 'lucideFileSpreadsheet',
  ods: 'lucideFileSpreadsheet',
  ppt: 'lucidePresentation',
  pptx: 'lucidePresentation',
  odp: 'lucidePresentation',
  jpg: 'lucideFileImage',
  jpeg: 'lucideFileImage',
  png: 'lucideFileImage',
  webp: 'lucideFileImage',
  mp4: 'lucideFileVideo',
  webm: 'lucideFileVideo',
  mp3: 'lucideFileAudio',
  ogg: 'lucideFileAudio',
};

@Component({
  selector: 'file-icon',
  imports: [NgIcon],
  providers: [
    provideIcons({
      lucideFile,
      lucideFileAudio,
      lucideFileImage,
      lucideFileSpreadsheet,
      lucideFileText,
      lucideFileVideo,
      lucidePresentation,
    }),
  ],
  template: `<ng-icon [name]="iconName()" aria-hidden="true" />`,
  host: {
    class: 'inline-flex text-primary',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileIcon {
  readonly mimeType = input('');
  readonly fileName = input('');

  readonly iconName = computed(() => {
    const mimeType = this.mimeType().toLocaleLowerCase();

    if (mimeType.includes('pdf')) return 'lucideFileText';
    if (mimeType.startsWith('image/')) return 'lucideFileImage';
    if (mimeType.startsWith('video/')) return 'lucideFileVideo';
    if (mimeType.startsWith('audio/')) return 'lucideFileAudio';
    if (mimeType.includes('word') || mimeType.includes('opendocument.text')) {
      return 'lucideFileText';
    }
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
      return 'lucideFileSpreadsheet';
    }
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
      return 'lucidePresentation';
    }

    const extension = this.fileName().trim().split('.').pop()?.toLowerCase();
    return (extension && extensionIconMap[extension]) || 'lucideFile';
  });
}
