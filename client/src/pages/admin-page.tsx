import { useQuery, useMutation } from "@tanstack/react-query";
import { Meditation } from "@shared/schema";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Trash2, LogOut, Upload } from "lucide-react";
import { useLocation } from "wouter";
import { signOut } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { data: meditations } = useQuery<Meditation[]>({
    queryKey: ["/api/meditations"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/meditations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meditations"] });
      toast({
        title: "Success",
        description: "Meditation deleted successfully",
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

  const handleLogout = async () => {
    try {
      await signOut();
      setLocation('/auth');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container max-w-7xl mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#384c44]">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">
            Manage your meditation sessions
          </p>
        </div>
        <Button 
          variant="outline"
          onClick={handleLogout}
          className="flex items-center gap-2 border-2 border-[#384c44] text-[#384c44] hover:bg-[#384c44] hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>

      <div className="grid gap-6">
        <Card className="border-2 border-[#384c44]">
          <CardHeader>
            <CardTitle className="text-[#384c44]">Upload New Meditation</CardTitle>
            <CardDescription>
              Add a new meditation audio file to the library
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload />
          </CardContent>
        </Card>

        <Card className="border-2 border-[#384c44]">
          <CardHeader>
            <CardTitle className="text-[#384c44]">Meditation Library</CardTitle>
            <CardDescription>
              View and manage all meditation sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[#384c44]">Title</TableHead>
                  <TableHead className="text-[#384c44]">Duration</TableHead>
                  <TableHead className="text-[#384c44]">Added</TableHead>
                  <TableHead className="w-24 text-[#384c44]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meditations?.map((meditation) => (
                  <TableRow key={meditation.id}>
                    <TableCell className="font-medium">{meditation.title}</TableCell>
                    <TableCell>{formatDuration(meditation.duration)}</TableCell>
                    <TableCell>{new Date(meditation.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteMutation.mutate(meditation.id)}
                        disabled={deleteMutation.isPending}
                        className="bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!meditations?.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                      No meditations found. Upload some files to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}