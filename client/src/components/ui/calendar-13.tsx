import * as React from "react";

import { Calendar } from "@/components/ui/calendar";

export default function Calendar13({
  selected,
  onSelect,
  disabled,
}: {
  selected: Date;
  onSelect: (...event: any[]) => void;
  disabled: (date: Date) => boolean;
}) {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2025, 5, 12)
  );

  return (
    <div className="flex flex-col gap-4">
      <Calendar
        mode="single"
        defaultMonth={date}
        selected={selected}
        onSelect={onSelect}
        captionLayout="dropdown"
        className="rounded-lg border shadow-sm"
        disabled={disabled}
      />
    </div>
  );
}
