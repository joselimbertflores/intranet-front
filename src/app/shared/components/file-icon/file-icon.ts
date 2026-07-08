import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';

const extensionIconMap: Record<string, string> = {
  pdf: 'pi pi-file-pdf text-red-500',
  doc: 'pi pi-file-word text-blue-600',
  docx: 'pi pi-file-word text-blue-600',
  odt: 'pi pi-file-word text-blue-600',
  xls: 'pi pi-file-excel text-green-600',
  xlsx: 'pi pi-file-excel text-green-600',
  ods: 'pi pi-file-excel text-green-600',
  ppt: 'pi pi-file text-orange-500',
  pptx: 'pi pi-file text-orange-500',
  odp: 'pi pi-file text-orange-500',
  jpg: 'pi pi-image text-orange-400',
  jpeg: 'pi pi-image text-orange-400',
  png: 'pi pi-image text-orange-400',
  webp: 'pi pi-image text-orange-400',
  mp4: 'pi pi-video text-purple-600',
  webm: 'pi pi-video text-purple-600',
  mp3: 'pi pi-volume-up text-purple-500',
  ogg: 'pi pi-volume-up text-purple-500',
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

    if (mimeType.includes('pdf')) return 'pi pi-file-pdf text-red-500';
    if (mimeType.startsWith('image/')) return 'pi pi-image text-orange-400';
    if (mimeType.startsWith('video/')) return 'pi pi-video text-purple-600';
    if (mimeType.startsWith('audio/')) return 'pi pi-volume-up text-purple-500';
    if (mimeType.includes('word') || mimeType.includes('opendocument.text')) {
      return 'pi pi-file-word text-blue-600';
    }
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
      return 'pi pi-file-excel text-green-600';
    }
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
      return 'pi pi-file text-orange-500';
    }
    const extension = this.fileName().trim().split('.').pop()?.toLowerCase() ?? '';
    return extensionIconMap[extension] ?? 'pi pi-file text-gray-500';
  });
}
