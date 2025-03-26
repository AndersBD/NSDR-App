import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMeditationSchema } from "@shared/schema";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload } from "lucide-react";

export function FileUpload() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertMeditationSchema),
    defaultValues: {
      title: "",
      fileName: "",
      fileUrl: "",
      duration: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/meditations", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meditations"] });
      form.reset();
      toast({
        title: "Success",
        description: "Meditation uploaded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: any) => {
    try {
      setUploading(true);
      const file = data.file[0];

      // Extract duration from folder structure
      // File should be in a folder like "10 minutter", "20 minutter", etc.
      const folderMatch = file.webkitRelativePath.match(/^(\d+)\s*minutter/);
      if (!folderMatch) {
        throw new Error("File must be in a folder named like '10 minutter', '20 minutter', etc.");
      }
      const durationMinutes = parseInt(folderMatch[1]);

      // Get upload URL
      const res = await fetch(`/api/upload-url?fileName=${file.name}`);
      const { signedUrl, url } = await res.json();

      // Upload file
      await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      // Create meditation
      createMutation.mutate({
        title: data.title || file.name.replace('.mp3', ''),
        duration: durationMinutes * 60, // Convert to seconds
        fileName: file.name,
        fileUrl: url,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Input 
          placeholder="Title (optional - will use filename if not provided)" 
          {...form.register("title")} 
        />
        <Input
          type="file"
          accept="audio/mp3"
          directory=""
          webkitdirectory=""
          {...form.register("file")}
          className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
        />
        <Button
          type="submit"
          disabled={uploading || createMutation.isPending}
          className="w-full"
        >
          {(uploading || createMutation.isPending) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </form>
    </Form>
  );
}