/**
 * Base form components — public API cho toàn hệ thống.
 *
 * Mỗi field component:
 * - Nhận `control` từ react-hook-form (useForm)
 * - Tích hợp label, required mark, error message, hint text
 * - Xử lý format/parse đặc thù (tiền VN, ngày tháng...)
 *
 * @example
 * ```tsx
 * const form = useForm<Values>({ resolver: zodResolver(schema) });
 *
 * <div className="grid grid-cols-2 gap-x-4 gap-y-3">
 *   <TextField  control={form.control} name="ma"      label="Mã"          required />
 *   <NumberField control={form.control} name="sapXep" label="Thứ tự"               />
 *   <DateField   control={form.control} name="ngay"   label="Ngày bắt đầu" className="col-span-2" />
 *   <CurrencyField control={form.control} name="giaTriHopDong" label="Giá trị hợp đồng" className="col-span-2" />
 * </div>
 * ```
 */

export { FormField } from './FormField';
export { FormSection } from './FormSection';
export { TextField } from './TextField';
export { NumberField } from './NumberField';
export { CurrencyField } from './CurrencyField';
export { DateField } from './DateField';
export { SelectField } from './SelectField';
export { TextareaField } from './TextareaField';

// Types
export type { FormFieldProps } from './FormField';
export type { SelectOption } from './SelectField';
