'use client';

import { useState } from 'react';
import { Subject } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Clock, MapPin, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SubjectForm } from './SubjectForm';

interface SubjectListProps {
  subjects: Subject[];
  onUpdate: (id: string, data: Partial<Omit<Subject, 'id' | 'createdAt'>>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function SubjectList({ subjects, onUpdate, onDelete }: SubjectListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleUpdate = async (id: string, data: Partial<Omit<Subject, 'id' | 'createdAt'>>) => {
    await onUpdate(id, data);
    setEditingId(null);
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deletingId) {
      await onDelete(deletingId);
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  if (subjects.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-secondary/20 rounded-3xl border border-dashed">
        <p>No subjects added yet.</p>
        <p className="text-sm mt-1">Click &quot;Add Subject&quot; to create your schedule.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {subjects.map((subject) => (
        <Card key={subject.id} className="rounded-2xl shadow-sm overflow-hidden border-l-4" style={{ borderLeftColor: subject.color }}>
          <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{subject.name}</h3>
                <Badge variant="secondary" className="bg-secondary/50">
                  {WEEKDAYS[subject.weekday]}
                </Badge>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{subject.startTime} - {subject.endTime}</span>
                </div>
                {subject.room && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{subject.room}</span>
                  </div>
                )}
                {subject.teacher && (
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{subject.teacher}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Dialog open={editingId === subject.id} onOpenChange={(open) => !open && setEditingId(null)}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setEditingId(subject.id)}>
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Edit Subject</DialogTitle>
                  </DialogHeader>
                  <SubjectForm 
                    initialData={subject}
                    onSubmit={(data) => handleUpdate(subject.id, data)}
                    onCancel={() => setEditingId(null)}
                  />
                </DialogContent>
              </Dialog>

              <Button variant="ghost" size="icon" onClick={() => confirmDelete(subject.id)} className="hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Subject</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">Are you sure you want to delete this subject? This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
