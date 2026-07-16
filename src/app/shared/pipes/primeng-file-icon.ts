import { Pipe, type PipeTransform } from '@angular/core';

type FileCategory =
  | 'pdf'
  | 'document'
  | 'spreadsheet'
  | 'image'
  | 'video'
  | 'compressed'
  | 'other';

const FILE_ICONS: Record<FileCategory, string> = {
  pdf: 'ui-icon ui-icon-file-pdf text-red-500',
  document: 'ui-icon ui-icon-file-word text-blue-500',
  spreadsheet: 'ui-icon ui-icon-file-excel text-green-500',
  image: 'ui-icon ui-icon-image text-yellow-500',
  video: 'ui-icon ui-icon-video text-purple-500',
  compressed: 'ui-icon ui-icon-file-zip text-orange-500',
  other: 'ui-icon ui-icon-file text-gray-500',
};

const EXTENSION_MAP: Record<string, FileCategory> = {
  pdf: 'pdf',
  doc: 'document',
  docx: 'document',
  txt: 'document',
  xls: 'spreadsheet',
  xlsx: 'spreadsheet',
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  gif: 'image',
  svg: 'image',
  mp4: 'video',
  avi: 'video',
  mov: 'video',
  zip: 'compressed',
  rar: 'compressed',
  '7z': 'compressed',
};

@Pipe({
  name: 'primengFileIcon',
})
export class PrimengFileIconPipe implements PipeTransform {
  transform(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (!extension) return FILE_ICONS.other;
    return FILE_ICONS[EXTENSION_MAP[extension] ?? 'other'];
  }
}
