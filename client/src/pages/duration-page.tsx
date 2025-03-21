import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Clock } from "lucide-react";

export default function DurationPage() {
  const [, setLocation] = useLocation();
  const { type } = useParams();

  const durations = [
    { label: "10 min", value: 10 },
    { label: "20 min", value: 20 },
    { label: "30 min", value: 30 },
    { label: "1 time", value: 60 }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => setLocation("/")}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Tilbage
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Vælg Varighed</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {durations.map(({ label, value }) => (
              <Button
                key={value}
                size="lg"
                className="w-full h-16 text-lg bg-white text-[#384c44] hover:bg-[#384c44] hover:text-white border-2 border-[#384c44] transition-colors"
                onClick={() => setLocation(`/sessions/${type}/${value}`)}
              >
                <Clock className="w-5 h-5 mr-2" />
                {label}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}