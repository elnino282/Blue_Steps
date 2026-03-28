'use client';

import { useState } from 'react';
import { Subject } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SubjectFormProps {
  initialData?: Subject;
  onSubmit: (data: Omit<Subject, 'id' | 'createdAt' | 'totalSessions' | 'attendedSessions'>) => Promise<void>;
  onCancel: () => void;
}

const WEEKDAYS = [
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
  { value: '0', label: 'Sunday' },
];

const COLORS = [
  { value: 'oklch(0.6 0.15 250)', label: 'Soft Blue' },
  { value: 'oklch(0.7 0.15 150)', label: 'Soft Green' },
  { value: 'oklch(0.75 0.15 50)', label: 'Soft Orange' },
  { value: 'oklch(0.6 0.2 25)', label: 'Soft Red' },
  { value: 'oklch(0.65 0.15 300)', label: 'Soft Purple' },
];

export function SubjectForm({ initialData, onSubmit, onCancel }: SubjectFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [weekday, setWeekday] = useState(initialData?.weekday.toString() || '1');
  const [startTime, setStartTime] = useState(initialData?.startTime || '09:00');
  const [endTime, setEndTime] = useState(initialData?.endTime || '10:30');
  const [room, setRoom] = useState(initialData?.room || '');
  const [teacher, setTeacher] = useState(initialData?.teacher || '');
  const [color, setColor] = useState(initialData?.color || COLORS[0].value);
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWeekdayChange = (value: string | null) => {
    if (value !== null) {
      setWeekday(value);
    }
  };

  const handleColorChange = (value: string | null) => {
    if (value !== null) {
      setColor(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim()) {
      setError('Subject name is required');
      return;
    }
    if (!startTime || !endTime) {
      setError('Start and end times are required');
      return;
    }
    if (startTime >= endTime) {
      setError('Start time must be before end time');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        weekday: parseInt(weekday, 10),
        startTime,
        endTime,
        room: room.trim(),
        teacher: teacher.trim(),
        color,
      });
    } catch (error) {
      console.error('Failed to save subject:', error);
      setError('An error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}
      
      <div className="space-y-2">
        <Label htmlFor="name">Subject Name *</Label>
        <Input 
          id="name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="e.g. Advanced Mathematics" 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="weekday">Day of Week *</Label>
          <Select value={weekday} onValueChange={handleWeekdayChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              {WEEKDAYS.map(day => (
                <SelectItem key={day.value} value={day.value}>{day.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="color">Color Theme</Label>
          <Select value={color} onValueChange={handleColorChange}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <SelectValue placeholder="Select color" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {COLORS.map(c => (
                <SelectItem key={c.value} value={c.value}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.value }} />
                    {c.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time *</Label>
          <Input 
            id="startTime" 
            type="time" 
            value={startTime} 
            onChange={(e) => setStartTime(e.target.value)} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time *</Label>
          <Input 
            id="endTime" 
            type="time" 
            value={endTime} 
            onChange={(e) => setEndTime(e.target.value)} 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="room">Room</Label>
          <Input 
            id="room" 
            value={room} 
            onChange={(e) => setRoom(e.target.value)} 
            placeholder="e.g. Room 301" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="teacher">Teacher</Label>
          <Input 
            id="teacher" 
            value={teacher} 
            onChange={(e) => setTeacher(e.target.value)} 
            placeholder="e.g. Dr. Smith" 
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Subject' : 'Add Subject'}
        </Button>
      </div>
    </form>
  );
}
