import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ListingFormValues, ListingCategory, LISTING_CATEGORIES, CATEGORY_LABELS } from '../types';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.enum(LISTING_CATEGORIES as [ListingCategory, ...ListingCategory[]], {
    error: 'Select a valid category',
  }),
  type: z.enum(['offer', 'request'] as const),
  creditsPerHour: z.number().int().min(1, 'Min 1 credit').max(10, 'Max 10 credits'),
  tags: z.string(),
  radiusKm: z.number().min(1).max(20),
});

type FormValues = z.infer<typeof schema>;

interface ListingFormProps {
  onSubmit: (values: ListingFormValues) => Promise<void>;
  defaultValues?: Partial<ListingFormValues>;
  isSubmitting: boolean;
}

export function ListingForm({ onSubmit, defaultValues, isSubmitting }: ListingFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'offer',
      radiusKm: 5,
      creditsPerHour: 2,
      ...defaultValues,
    },
  });

  const type = watch('type');

  const [tagInput, setTagInput] = useState('');

  const tagsValue = watch('tags');
  const chips: string[] = tagsValue ? tagsValue.split(',').map((t: string) => t.trim()).filter(Boolean) : [];

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (!tag || chips.includes(tag)) return;
    setValue('tags', [...chips, tag].join(', '));
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setValue('tags', chips.filter((c) => c !== tag).join(', '));
  };

  const radiusValue = watch('radiusKm') ?? 5;
  const rangeProgress = `${((radiusValue - 1) / (20 - 1)) * 100}%`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Type toggle */}
      <div>
        <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-sub)] mb-2 block">Type</label>
        <div className="inline-flex bg-[var(--color-bg)] rounded-full p-1 border border-[var(--color-border)]">
          {(['offer', 'request'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setValue('type', t)}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 capitalize ${
                type === t
                  ? 'bg-[var(--color-primary)] text-white font-semibold shadow-sm'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {t === 'offer' ? 'Offer' : 'Request'}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-sub)] mb-1.5 block">Title</label>
        <input
          {...register('title')}
          className={`w-full bg-white border rounded-xl px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors ${errors.title ? 'border-red-300 focus:ring-red-400' : 'border-[var(--color-border)]'}`}
          placeholder="e.g. Piano lessons for beginners"
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-sub)] mb-1.5 block">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          className={`w-full bg-white border rounded-xl px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors resize-none ${errors.description ? 'border-red-300 focus:ring-red-400' : 'border-[var(--color-border)]'}`}
          placeholder="Describe what you're offering or looking for…"
        />
        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
      </div>

      {/* Category + Credits row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Category */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-sub)] mb-1.5 block">Category</label>
          <div className="relative">
            <select
              {...register('category')}
              className={`w-full appearance-none bg-white border rounded-xl px-4 py-3 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors pr-10 ${errors.category ? 'border-red-300 focus:ring-red-400' : 'border-[var(--color-border)]'}`}
            >
              <option value="">Select a category</option>
              {LISTING_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-muted)] text-xs">▾</div>
          </div>
          {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
        </div>

        {/* Credits stepper */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-sub)] mb-1.5 block">Credits / hour</label>
          {/* Hidden input for RHF */}
          <input type="hidden" {...register('creditsPerHour', { valueAsNumber: true })} />
          <div className="inline-flex items-center border border-[var(--color-border)] rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setValue('creditsPerHour', Math.max(1, (watch('creditsPerHour') ?? 1) - 1))}
              disabled={(watch('creditsPerHour') ?? 1) <= 1}
              className="px-4 py-2.5 bg-[var(--color-bg)] hover:bg-[var(--color-accent-light)] text-[var(--color-primary)] font-bold text-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              −
            </button>
            <span className="px-5 py-2.5 text-sm font-semibold text-[var(--color-text)] bg-white border-x border-[var(--color-border)] min-w-[3rem] text-center">
              {watch('creditsPerHour') ?? 1}
            </span>
            <button
              type="button"
              onClick={() => setValue('creditsPerHour', Math.min(10, (watch('creditsPerHour') ?? 1) + 1))}
              disabled={(watch('creditsPerHour') ?? 10) >= 10}
              className="px-4 py-2.5 bg-[var(--color-bg)] hover:bg-[var(--color-accent-light)] text-[var(--color-primary)] font-bold text-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
          {errors.creditsPerHour && <p className="text-xs text-red-500 mt-1">{errors.creditsPerHour.message}</p>}
        </div>
      </div>

      {/* Radius slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-sub)]">Radius</label>
          <span className="bg-[var(--color-accent-light)] text-[var(--color-primary)] text-xs font-semibold px-2.5 py-0.5 rounded-full">{radiusValue} km</span>
        </div>
        <input
          {...register('radiusKm', { valueAsNumber: true })}
          type="range"
          min={1}
          max={20}
          style={{ '--range-progress': rangeProgress } as React.CSSProperties}
          className="w-full"
        />
      </div>

      {/* Tags chip input */}
      <div>
        <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-sub)] mb-1.5 block">Tags</label>
        {/* Hidden input keeps RHF in sync */}
        <input type="hidden" {...register('tags')} />
        <div className="flex flex-wrap gap-2 bg-white border border-[var(--color-border)] rounded-xl px-3 py-2.5 min-h-[46px] items-center focus-within:ring-2 focus-within:ring-[var(--color-primary)] focus-within:border-transparent transition-colors">
          {chips.map((chip) => (
            <span key={chip} className="inline-flex items-center gap-1.5 bg-[var(--color-accent-light)] text-[var(--color-primary)] text-xs font-medium px-3 py-1 rounded-full">
              {chip}
              <button
                type="button"
                onClick={() => removeTag(chip)}
                className="hover:text-red-500 transition-colors leading-none"
                aria-label={`Remove tag ${chip}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addTag(tagInput);
              }
            }}
            onBlur={() => { if (tagInput.trim()) addTag(tagInput); }}
            placeholder={chips.length === 0 ? 'Type a tag and press Enter…' : ''}
            className="flex-1 min-w-[120px] text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] bg-transparent outline-none"
          />
        </div>
        <p className="text-xs text-[var(--color-muted)] mt-1">Press Enter or comma to add a tag</p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-semibold py-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Saving…
          </>
        ) : 'Save listing'}
      </button>
    </form>
  );
}
