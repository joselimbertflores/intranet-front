import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';


import { SectionTreeNodeResponse } from '../../interfaces';
import { OrganizationalUnitDatasource } from '../../services';
import { FormUtils } from '../../../../../helpers';

interface DialogData {
  section?: SectionTreeNodeResponse;
  parent?: SectionTreeNodeResponse;
}
@Component({
  selector: 'app-organizational-unit-editor',
  imports: [
    ReactiveFormsModule,
    
    FormsModule,
  ],
  templateUrl: './organizational-unit-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationalUnitEditor {
  // private diagloRef = inject(DynamicDialogRef);
  private formBuilder = inject(FormBuilder);
  private sectionService = inject(OrganizationalUnitDatasource);

  // readonly data: DialogData = inject(DynamicDialogConfig).data;

  readonly formUtils = FormUtils;

  form: FormGroup = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    parentId: [null],
    isActive: [true],
  });

  ngOnInit() {
    this.loadForm();
  }

  close() {
    // this.diagloRef.close();
  }

  save() {
    // if (this.form.invalid) return this.form.markAllAsTouched();
    // const subscription = this.data.section
    //   ? this.sectionService.update(this.data.section.id, this.form.value)
    //   : this.sectionService.create(this.form.value);
    // subscription.subscribe((resp) => {
    //   this.diagloRef.close(resp);
    // });
  }

  private loadForm(): void {
    // const { parent, section } = this.data;
    // this.form.patchValue({ ...section, parentId: parent?.id });
  }
}
