'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';

interface DateRangePickerProps {
  value: { startDate: string; endDate: string };
  onChange: (range: { startDate: string; endDate: string }) => void;
  className?: string;
}

const PRESET_RANGES = [
  {
    label: 'Today',
    getValue: () => ({
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
    }),
  },
  {
    label: 'Yesterday',
    getValue: () => ({
      startDate: format(addDays(new Date(), -1), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), -1), 'yyyy-MM-dd'),
    }),
  },
  {
    label: 'Last 7 Days',
    getValue: () => ({
      startDate: format(addDays(new Date(), -7), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
    }),
  },
  {
    label: 'Last 30 Days',
    getValue: () => ({
      startDate: format(addDays(new Date(), -30), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
    }),
  },
  {
    label: 'This Month',
    getValue: () => ({
      startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    }),
  },
  {
    label: 'Last Month',
    getValue: () => {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      return {
        startDate: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(lastMonth), 'yyyy-MM-dd'),
      };
    },
  },
  {
    label: 'This Quarter',
    getValue: () => {
      const now = new Date();
      const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      const quarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);
      return {
        startDate: format(quarterStart, 'yyyy-MM-dd'),
        endDate: format(quarterEnd, 'yyyy-MM-dd'),
      };
    },
  },
  {
    label: 'This Year',
    getValue: () => ({
      startDate: format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'),
      endDate: format(new Date(new Date().getFullYear(), 11, 31), 'yyyy-MM-dd'),
    }),
  },
];

export default function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'preset' | 'custom'>('preset');

  const handlePresetClick = (preset: typeof PRESET_RANGES[0]) => {
    onChange(preset.getValue());
    setIsOpen(false);
  };

  const formatDateRange = () => {
    if (!value.startDate || !value.endDate) return 'Select date range';

    const start = new Date(value.startDate);
    const end = new Date(value.endDate);

    if (format(start, 'MMM dd, yyyy') === format(end, 'MMM dd, yyyy')) {
      return format(start, 'MMM dd, yyyy');
    }

    return `${format(start, 'MMM dd, yyyy')} - ${format(end, 'MMM dd, yyyy')}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={`justify-start text-left font-normal ${className}`}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange()}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="w-96">
          {/* Tab Navigation */}
          <div className="flex border-b">
            <button
              className={`flex-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                selectedTab === 'preset'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setSelectedTab('preset')}
            >
              Presets
            </button>
            <button
              className={`flex-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                selectedTab === 'custom'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setSelectedTab('custom')}
            >
              Custom Range
            </button>
          </div>

          {/* Tab Content */}
          {selectedTab === 'preset' && (
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {PRESET_RANGES.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    className="justify-start h-auto p-2 text-sm"
                    onClick={() => handlePresetClick(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'custom' && (
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={value.startDate}
                    onChange={(e) =>
                      onChange({ ...value, startDate: e.target.value })
                    }
                    max={value.endDate}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={value.endDate}
                    onChange={(e) =>
                      onChange({ ...value, endDate: e.target.value })
                    }
                    min={value.startDate}
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setIsOpen(false)}>
                    Apply Range
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}