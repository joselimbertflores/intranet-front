import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

const iconMap: Record<string, string> = {
  pdf: 'pi pi-file-pdf text-red-500',
  xlsx: 'pi pi-file-excel text-green-600',
  xls: 'pi pi-file-excel text-green-600',
  doc: 'pi pi-file-word text-blue-600',
  docx: 'pi pi-file-word text-blue-600',
  png: 'pi pi-image text-orange-400',
  jpg: 'pi pi-image text-orange-400',
  jpeg: 'pi pi-image text-orange-400',
  zip: 'pi pi-box text-yellow-600',
  rar: 'pi pi-box text-yellow-600',
  mp4: 'pi pi-video text-purple-600',
};

@Component({
  selector: 'file-icon',
  imports: [],
  template: `<i [class]="iconClass()" style="font-size: 1.5rem"></i>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileIcon {
  fileName = input.required<string>();

  iconClass = computed(() => {
    const ext = this.fileName().split('.').pop()?.toLowerCase() || '';
    return iconMap[ext] || 'pi pi-file text-gray-500';
  });
}
