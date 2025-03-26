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
import { Loader2, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";

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
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title (Optional)</Label>
          <Input 
            id="title"
            placeholder="Will use filename if not provided" 
            {...form.register("title")} 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file">Audio File</Label>
          <div className="border-2 rounded-lg p-6 bg-muted/10 border-dashed">
            <Input
              id="file"
              type="file"
              accept="audio/mp3"
              {...form.register("file")}
              // @ts-ignore - directory attribute is valid but not in types
              directory="true"
              // @ts-ignore - webkitdirectory attribute is valid but not in types
              webkitdirectory="true"
              className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#384c44] file:text-white hover:file:bg-[#384c44]/90"
            />
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>
                Upload an MP3 file from a folder named according to its duration:
              </p>
              <ul className="list-disc list-inside pl-2">
                <li>For 10-minute sessions: "10 minutter"</li>
                <li>For 20-minute sessions: "20 minutter"</li>
                <li>For 30-minute sessions: "30 minutter"</li>
              </ul>
              <p className="text-xs mt-2">
                The folder name determines the meditation duration automatically.
              </p>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={uploading || createMutation.isPending}
          className="w-full bg-[#384c44] hover:bg-[#384c44]/90"
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