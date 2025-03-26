import { useQuery, useMutation } from "@tanstack/react-query";
import { Meditation } from "@shared/schema";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Trash2, LogOut } from "lucide-react";
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

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Button 
          variant="outline"
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>

      <div className="mb-8">
        <FileUpload />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meditations?.map((meditation) => (
            <TableRow key={meditation.id}>
              <TableCell>{meditation.title}</TableCell>
              <TableCell>{Math.floor(meditation.duration / 60)}:{(meditation.duration % 60).toString().padStart(2, '0')}</TableCell>
              <TableCell>{new Date(meditation.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deleteMutation.mutate(meditation.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}