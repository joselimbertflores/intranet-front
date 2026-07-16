import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  DirectoryEntryPayload,
  DirectoryEntryResponse,
  DirectorySite,
} from '../../interfaces';
import { DirectoryDataSource } from '../../pages/services';
import { FormUtils } from '../../../../../helpers';

interface DialogData {
  directory?: DirectoryEntryResponse;
}

@Component({
  selector: 'app-directory-editor',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './directory-editor.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class DirectoryEditor implements OnInit {
  // private readonly dialogRef = inject(DynamicDialogRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly directoryDataSource = inject(DirectoryDataSource);

  // readonly data: DialogData = inject(DynamicDialogConfig).data ?? {};
  readonly formUtils = FormUtils;
  readonly sites = signal<DirectorySite[]>([]);
  readonly areaSuggestions = signal<string[]>([]);
  private areaNames: string[] = [];

  readonly directoryForm = this.formBuilder.group({
    areaName: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(160)],
    ],
    contactLabel: ['', Validators.maxLength(160)],
    extensions: this.formBuilder.array<FormControl<string>>([]),
    phones: this.formBuilder.array<FormControl<string>>([]),
    email: ['', [Validators.email, Validators.maxLength(160)]],
    siteId: new FormControl<number | null>(null),
    siteDetails: ['', Validators.maxLength(200)],
    isActive: [true],
  });

  get extensions(): FormArray<FormControl<string>> {
    return this.directoryForm.controls.extensions;
  }

  get phones(): FormArray<FormControl<string>> {
    return this.directoryForm.controls.phones;
  }

  ngOnInit(): void {
    this.directoryDataSource.findAreaNames().subscribe((names) => {
      this.areaNames = names;
      this.areaSuggestions.set(names);
    });
    this.directoryDataSource
      .findSites()
      .subscribe((sites) => this.sites.set(sites));
    this.loadForm();
  }

  searchAreas(event: any): void {
    const term = event.query.trim().toLocaleLowerCase();
    this.areaSuggestions.set(
      this.areaNames.filter((name) => name.toLocaleLowerCase().includes(term)),
    );
  }

  addExtension(value = ''): void {
    this.extensions.push(this.createNumberControl(value, 30));
  }

  addPhone(value = ''): void {
    this.phones.push(this.createNumberControl(value, 40));
  }

  removeExtension(index: number): void {
    this.extensions.removeAt(index);
  }

  removePhone(index: number): void {
    this.phones.removeAt(index);
  }

  close(): void {
    // this.dialogRef.close();
  }

  save(): void {
    if (this.directoryForm.invalid) {
      this.directoryForm.markAllAsTouched();
      return;
    }

    const value = this.directoryForm.getRawValue();
    const dto: DirectoryEntryPayload = {
      areaName: (value.areaName ?? '').trim(),
      contactLabel: value.contactLabel?.trim() || null,
      extensions: this.cleanNumbers(value.extensions),
      phones: this.cleanNumbers(value.phones),
      email: value.email?.trim() || null,
      siteId: value.siteId,
      siteDetails: value.siteDetails?.trim() || null,
      isActive: value.isActive ?? true,
    };

    // const request = this.data.directory
    //   ? this.directoryDataSource.update(this.data.directory.id, dto)
    //   : this.directoryDataSource.create(dto);

    // request.subscribe((directory) => this.dialogRef.close(directory));
  }

  private loadForm(): void {
    // const directory = this.data.directory;
    // if (!directory) {
    //   this.addExtension();
    //   this.addPhone();
    //   return;
    // }
    // this.directoryForm.patchValue({
    //   areaName: directory.areaName,
    //   contactLabel: directory.contactLabel ?? '',
    //   email: directory.email ?? '',
    //   siteId: directory.siteId,
    //   siteDetails: directory.siteDetails ?? '',
    //   isActive: directory.isActive,
    // });
    // directory.extensions.forEach((extension) => this.addExtension(extension));
    // directory.phones.forEach((phone) => this.addPhone(phone));
    // if (!directory.extensions.length) this.addExtension();
    // if (!directory.phones.length) this.addPhone();
  }

  private createNumberControl(value: string, maxLength: number) {
    return this.formBuilder.nonNullable.control(
      value,
      Validators.maxLength(maxLength),
    );
  }

  private cleanNumbers(values: string[]): string[] {
    return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
  }
}
