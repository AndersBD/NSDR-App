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
import { Loader2, Upload, CheckCircle2, XCircle } from 'lucide-react';
import { uploadFile } from '@/lib/supabase';
import { Progress } from '@/components/ui/progress';

export function FileUpload() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFolder, setTargetFolder] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

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
        const error = await res.text();
        throw new Error(error || 'Failed to create meditation record');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meditations'] });
      form.reset();
      setSelectedFile(null);
      setTargetFolder(null);
      setUploadProgress(0);
      setUploadStatus('success');
      toast({
        title: 'Success',
        description: 'Meditation uploaded successfully',
      });
    },
    onError: (error: Error) => {
      setUploadStatus('error');
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Selected file:', file.name); // Debug log

    setSelectedFile(file);
    setUploadStatus('idle');
    setUploadProgress(0);

    // Extract duration from filename
    const durationMatch = file.name.match(/(\d+)\s*min/i);
    if (durationMatch) {
      const durationMinutes = parseInt(durationMatch[1]);
      const folder = `${durationMinutes} minutter`;
      console.log('Detected folder:', folder); // Debug log
      setTargetFolder(folder);
    } else {
      setTargetFolder(null);
      toast({
        title: 'Warning',
        description: 'Filename must include duration (e.g., "NSDR 20 min.wav")',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (formData: any) => {
    try {
      if (!selectedFile || !targetFolder) {
        throw new Error('Please select a valid file with duration in the filename');
      }

      setUploading(true);
      setUploadStatus('uploading');
      setUploadProgress(10);

      const durationMatch = selectedFile.name.match(/(\d+)\s*min/i);
      if (!durationMatch) {
        throw new Error('Filename must include duration (e.g., "NSDR 20 min.wav")');
      }

      const durationMinutes = parseInt(durationMatch[1]);

      setUploadProgress(30);

      console.log('Starting upload to folder:', targetFolder); // Debug log

      const uploadResult = await uploadFile(selectedFile, targetFolder);

      setUploadProgress(70);

      console.log('Upload successful:', uploadResult); // Debug log

      await createMutation.mutateAsync({
        title: formData.title || selectedFile.name.replace(/\.\w+$/, ''),
        duration: durationMinutes * 60,
        fileName: uploadResult.path,
        fileUrl: uploadResult.url,
      });

      setUploadProgress(100);
    } catch (error: any) {
      console.error('Upload error:', error); // Debug log
      setUploadStatus('error');
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
            onChange={handleFileChange}
            className="w-full cursor-pointer file:mr-4 file:py-2 file:px-4 
                     file:rounded-md file:border-0 file:text-sm file:font-medium 
                     file:bg-primary file:text-primary-foreground 
                     hover:file:bg-primary/90"
          />
          <p className="text-sm text-muted-foreground">
            Upload an MP3 or WAV file with duration in the filename (e.g., "NSDR 20 min.wav").
            The file will be automatically placed in the correct duration folder.
          </p>
          {selectedFile && targetFolder && (
            <p className="text-sm font-medium text-primary">
              File will be uploaded to folder: {targetFolder}
            </p>
          )}
        </div>

        {uploadStatus !== 'idle' && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="h-2" />
            <div className="flex items-center gap-2">
              {uploadStatus === 'uploading' && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
              {uploadStatus === 'success' && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
              {uploadStatus === 'error' && (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <p className="text-sm text-muted-foreground">
                {uploadStatus === 'uploading' && 'Uploading...'}
                {uploadStatus === 'success' && 'Upload complete'}
                {uploadStatus === 'error' && 'Upload failed'}
              </p>
            </div>
          </div>
        )}

        <Button 
          type="submit" 
          disabled={uploading || createMutation.isPending || !selectedFile || !targetFolder} 
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