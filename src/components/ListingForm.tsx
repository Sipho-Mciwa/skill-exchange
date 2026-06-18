import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ListingFormValues, LISTING_CATEGORIES, CATEGORY_LABELS } from '../types';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.enum(LISTING_CATEGORIES as [string, ...string[]]),
  type: z.enum(['offer', 'request'] as const),
  creditsPerHour: z.coerce
    .number()
    .int()
    .min(1, 'Min 1 credit')
    .max(10, 'Max 10 credits'),
  tags: z.string(),
  radiusKm: z.coerce.number().min(1).max(20),
}) satisfies z.ZodType<ListingFormValues>;

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
  } = useForm<ListingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'offer',
      radiusKm: 5,
      creditsPerHour: 2,
      ...defaultValues,
    },
  });

  const type = watch('type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Type toggle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Listing type</label>
        <div className="flex rounded-lg overflow-hidden border border-gray-300 w-fit">
          {(['offer', 'request'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setValue('type', t)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                type === t
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          {...register('title')}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g. Piano lessons for beginners"
        />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          {...register('description')}
          rows={4}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Describe what you're offering or looking for…"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select
          {...register('category')}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select a category</option>
          {LISTING_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>
        )}
      </div>

      {/* Credits per hour */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Credits per hour (1–10)
        </label>
        <input
          {...register('creditsPerHour')}
          type="number"
          min={1}
          max={10}
          className="mt-1 w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {errors.creditsPerHour && (
          <p className="mt-1 text-xs text-red-600">{errors.creditsPerHour.message}</p>
        )}
      </div>

      {/* Radius */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Radius: {watch('radiusKm')} km
        </label>
        <input
          {...register('radiusKm')}
          type="range"
          min={1}
          max={20}
          className="mt-1 w-full"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Tags <span className="text-gray-400">(comma separated)</span>
        </label>
        <input
          {...register('tags')}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="beginner, online, flexible hours"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {isSubmitting ? 'Saving…' : 'Save listing'}
      </button>
    </form>
  );
}
