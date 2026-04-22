'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { EventFormData } from '@/types/event';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const eventSchema = z.object({
  title: z.string().min(1, 'Event title is required').max(100, 'Title is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  organizerName: z.string().min(1, 'Your name is required').max(50, 'Name is too long'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  intervalMinutes: z.number().min(15).max(120),
  timezone: z.string(),
});

type FormValues = z.infer<typeof eventSchema>;

interface EventFormProps {
  onSubmit: (data: EventFormData) => void;
  isSubmitting?: boolean;
}

export default function EventForm({ onSubmit, isSubmitting = false }: EventFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      intervalMinutes: 30,
      startTime: '09:00',
      endTime: '17:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  const startDateValue = watch('startDate');
  const endDateValue = watch('endDate');

  const onSubmitForm = (data: FormValues) => {
    const startDate = new Date(data.startDate + 'T00:00:00');
    const endDate = new Date(data.endDate + 'T00:00:00');

    console.log('Form submission:', {
      startDate,
      endDate,
      startTime: data.startTime,
      endTime: data.endTime,
      intervalMinutes: data.intervalMinutes,
    });

    // Validate date range
    if (startDate > endDate) {
      alert('End date must be after start date');
      return;
    }

    // Validate time range
    const startTimeMinutes = parseInt(data.startTime.split(':')[0]) * 60 + parseInt(data.startTime.split(':')[1]);
    const endTimeMinutes = data.endTime === '00:00' ? 24 * 60 : parseInt(data.endTime.split(':')[0]) * 60 + parseInt(data.endTime.split(':')[1]);

    if (endTimeMinutes <= startTimeMinutes && data.endTime !== '00:00') {
      alert('End time must be after start time');
      return;
    }

    const formData: EventFormData = {
      ...data,
      startDate,
      endDate,
      intervalMinutes: Number(data.intervalMinutes),
    };

    onSubmit(formData);
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {/* Event Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>

        <Input
          label="Event Title"
          placeholder="Team Standup, Project Meeting, etc."
          {...register('title')}
          error={errors.title?.message}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            placeholder="What is this meeting about? (optional)"
            {...register('description')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            rows={3}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <Input
          label="Your Name"
          placeholder="John Doe"
          {...register('organizerName')}
          error={errors.organizerName?.message}
          required
        />
      </div>

      {/* Date Range */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Date Range</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            type="date"
            label="Start Date"
            {...register('startDate')}
            error={errors.startDate?.message}
            min={today}
            required
          />

          <Input
            type="date"
            label="End Date"
            {...register('endDate')}
            error={errors.endDate?.message}
            min={startDateValue || today}
            required
          />
        </div>
      </div>

      {/* Time Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Time Configuration</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Input
            type="time"
            label="Start Time"
            {...register('startTime')}
            error={errors.startTime?.message}
            required
          />

          <Input
            type="time"
            label="End Time"
            {...register('endTime')}
            error={errors.endTime?.message}
            helperText="Use 00:00 for end of day (midnight)"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interval (minutes)
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              {...register('intervalMinutes')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
            </select>
            {errors.intervalMinutes && (
              <p className="mt-1 text-sm text-red-600">{errors.intervalMinutes.message}</p>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-500">
          This defines the time slots participants can choose from each day
        </p>
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-gray-200">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isSubmitting}
        >
          Create Event
        </Button>
      </div>
    </form>
  );
}
