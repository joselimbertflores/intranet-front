import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';



import { DirectorySite, DirectorySitePayload } from '../../interfaces';
import { DirectoryDataSource } from '../../pages/services';
import { FormUtils } from '../../../../../helpers';

@Component({
  selector: 'app-directory-site-editor',
  imports: [
    ReactiveFormsModule,
  
  ],
  templateUrl: './directory-site-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DirectorySiteEditor {
  // private readonly dialogRef = inject(DynamicDialogRef);
  private readonly dataSource = inject(DirectoryDataSource);
  // private readonly site: DirectorySite | undefined = inject(DynamicDialogConfig).data;
  private readonly formBuilder = inject(FormBuilder);

  readonly formUtils = FormUtils;
  readonly form = this.formBuilder.nonNullable.group({
    // name: [this.site?.name ?? '', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    // isActive: [this.site?.isActive ?? true],
  });

  close(): void {
    // this.dialogRef.close();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // const value = this.form.getRawValue();
    // const dto: DirectorySitePayload = { name: value.name.trim(), isActive: value.isActive };
    // const request = this.site
    //   ? this.dataSource.updateSite(this.site.id, dto)
    //   : this.dataSource.createSite(dto);
    // request.subscribe((site) => this.dialogRef.close(site));
  }
}
