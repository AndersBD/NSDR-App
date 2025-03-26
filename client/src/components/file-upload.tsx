import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertMeditationSchema } from '@shared/schema';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Loader2, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function FileUpload() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertMeditationSchema),
    defaultValues: {
      title: '',
      fileName: '',
      fileUrl: '',
      duration: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/meditations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to create meditation record');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meditations'] });
      form.reset();
      toast({
        title: 'Success',
        description: 'Meditation uploaded successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: any) => {
    try {
      setUploading(true);

      // Check if file is selected
      if (!data.file || !data.file.length) {
        throw new Error('Please select a file to upload');
      }

      const file = data.file[0];

      // Extract duration from filename (e.g., "20 min.wav" or "20min.mp3")
      const durationMatch = file.name.match(/(\d+)\s*min/i);
      if (!durationMatch) {
        throw new Error('Filename must include duration (e.g., "meditation-20min.wav" or "NSDR 20 min.mp3")');
      }

      const durationMinutes = parseInt(durationMatch[1]);
      const folderName = `${durationMinutes} minutter`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('lydfiler-til-nsdr')
        .upload(`${folderName}/${file.name}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('lydfiler-til-nsdr')
        .getPublicUrl(`${folderName}/${file.name}`);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL for uploaded file');
      }

      createMutation.mutate({
        title: data.title || file.name.replace(/\.\w+$/, ''),
        duration: durationMinutes * 60,
        fileName: `${folderName}/${file.name}`,
        fileUrl: urlData.publicUrl,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Input 
            type="text"
            placeholder="Title (optional - will use filename if not provided)" 
            {...form.register("title")} 
          />
          <p className="text-sm text-muted-foreground">
            Enter a descriptive title for the meditation or leave blank to use the filename
          </p>
        </div>

        <div className="space-y-2">
          <input
            type="file"
            accept="audio/mp3,audio/wav"
            {...form.register("file", {
              required: "Please select a file to upload"
            })}
            className="w-full cursor-pointer file:mr-4 file:py-2 file:px-4 
                     file:rounded-md file:border-0 file:text-sm file:font-medium 
                     file:bg-primary file:text-primary-foreground 
                     hover:file:bg-primary/90"
          />
          <p className="text-sm text-muted-foreground">
            Upload an MP3 or WAV file with duration in the filename (e.g., "NSDR 20 min.wav" or "meditation-10min.mp3").
            The file will be automatically placed in the correct duration folder.
          </p>
        </div>

        <Button 
          type="submit" 
          disabled={uploading || createMutation.isPending} 
          className="w-full"
        >
          {(uploading || createMutation.isPending) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          <Upload className="mr-2 h-4 w-4" />
          Upload Meditation
        </Button>
      </form>
    </Form>
  );
}