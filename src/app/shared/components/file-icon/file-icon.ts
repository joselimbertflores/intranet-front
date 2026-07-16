import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';

const extensionIconMap: Record<string, string> = {
  pdf: 'ui-icon ui-icon-file-pdf text-red-500',
  doc: 'ui-icon ui-icon-file-word text-blue-600',
  docx: 'ui-icon ui-icon-file-word text-blue-600',
  odt: 'ui-icon ui-icon-file-word text-blue-600',
  xls: 'ui-icon ui-icon-file-excel text-green-600',
  xlsx: 'ui-icon ui-icon-file-excel text-green-600',
  ods: 'ui-icon ui-icon-file-excel text-green-600',
  ppt: 'ui-icon ui-icon-file text-orange-500',
  pptx: 'ui-icon ui-icon-file text-orange-500',
  odp: 'ui-icon ui-icon-file text-orange-500',
  jpg: 'ui-icon ui-icon-image text-orange-400',
  jpeg: 'ui-icon ui-icon-image text-orange-400',
  png: 'ui-icon ui-icon-image text-orange-400',
  webp: 'ui-icon ui-icon-image text-orange-400',
  mp4: 'ui-icon ui-icon-video text-purple-600',
  webm: 'ui-icon ui-icon-video text-purple-600',
  mp3: 'ui-icon ui-icon-volume-up text-purple-500',
  ogg: 'ui-icon ui-icon-volume-up text-purple-500',
};

@Component({
  selector: 'file-icon',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: ` <i
    [class]="iconClass()"
    class="shrink-0"
    style="font-size: 1.5rem"
  ></i>`,
})
export class FileIcon {
  mimeType = input<string>('');
  fileName = input<string>('');

  iconClass = computed(() => {
    const mimeType = this.mimeType();

    if (mimeType.includes('pdf')) return 'ui-icon ui-icon-file-pdf text-red-500';
    if (mimeType.startsWith('image/')) return 'ui-icon ui-icon-image text-orange-400';
    if (mimeType.startsWith('video/')) return 'ui-icon ui-icon-video text-purple-600';
    if (mimeType.startsWith('audio/')) return 'ui-icon ui-icon-volume-up text-purple-500';
    if (mimeType.includes('word') || mimeType.includes('opendocument.text')) {
      return 'ui-icon ui-icon-file-word text-blue-600';
    }
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
      return 'ui-icon ui-icon-file-excel text-green-600';
    }
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
      return 'ui-icon ui-icon-file text-orange-500';
    }
    const extension = this.fileName().trim().split('.').pop()?.toLowerCase() ?? '';
    return extensionIconMap[extension] ?? 'ui-icon ui-icon-file text-gray-500';
  });
}
