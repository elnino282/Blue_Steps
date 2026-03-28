'use client';

import { useState } from 'react';
import { useSubjects } from '@/hooks/use-subjects';
import { Button } from '@/components/ui/button';
import { Plus, Calendar as CalendarIcon, List, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubjectForm } from '@/components/schedule/SubjectForm';
import { SubjectList } from '@/components/schedule/SubjectList';
import { WeeklyCalendar } from '@/components/schedule/WeeklyCalendar';

export default function SchedulePage() {
  const { subjects, loading, createSubject, updateSubject, deleteSubject, seedDemo } = useSubjects();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleAddSubject = async (data: any) => {
    await createSubject(data);
    setIsAddOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground mt-1">Manage your classes and study sessions.</p>
        </div>
        <div className="flex items-center gap-3">
          {subjects.length === 0 && (
            <Button variant="outline" onClick={seedDemo} className="rounded-full gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Load Demo Data
            </Button>
          )}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full shadow-md gap-2">
                <Plus className="w-5 h-5" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Subject</DialogTitle>
              </DialogHeader>
              <SubjectForm onSubmit={handleAddSubject} onCancel={() => setIsAddOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6 rounded-full p-1 bg-secondary/50">
          <TabsTrigger value="list" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <List className="w-4 h-4 mr-2" />
            List View
          </TabsTrigger>
          <TabsTrigger value="calendar" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Calendar View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-0">
          <SubjectList 
            subjects={subjects} 
            onUpdate={updateSubject} 
            onDelete={deleteSubject} 
          />
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-0">
          {subjects.length > 0 ? (
            <WeeklyCalendar subjects={subjects} />
          ) : (
            <div className="text-center py-12 text-muted-foreground bg-secondary/20 rounded-3xl border border-dashed">
              <p>No subjects added yet.</p>
              <p className="text-sm mt-1">Add subjects to see your weekly calendar.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

