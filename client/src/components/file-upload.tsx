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
      duration: 0,
      fileName: "",
      fileUrl: "",
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
        title: data.title,
        duration: data.duration,
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
    <Card>
      <CardHeader>
        <CardTitle>Upload Meditation</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Input placeholder="Title" {...form.register("title")} />
            <Input
              type="number"
              placeholder="Duration (in seconds)"
              {...form.register("duration", { valueAsNumber: true })}
            />
            <Input
              type="file"
              accept="audio/*"
              {...form.register("file")}
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
      </CardContent>
    </Card>
  );
}
