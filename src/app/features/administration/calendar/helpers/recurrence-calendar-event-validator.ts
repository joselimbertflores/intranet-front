import { AbstractControl, ValidatorFn } from '@angular/forms';

export const recurrenceValidator: ValidatorFn = (group: AbstractControl) => {
  if (group.disabled) return null;

  const freq: string | null = group.get('frequency')?.value;
  const days: string[] = group.get('byWeekDays')?.value;

  if (!freq) return { requiredFrequency: true };

  if (freq === 'WEEKLY' && (!days || days.length === 0)) {
    return { weeklyRequiresDays: true };
  }

  return null;
};
