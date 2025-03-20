import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Clock } from "lucide-react";

export default function DurationPage() {
  const [, setLocation] = useLocation();
  const { type } = useParams();

  const durations = [
    { label: "10 min", value: 10, available: true },
    { label: "20 min", value: 20, available: true },
    { label: "30 min", value: 30, available: false },
    { label: "1 time", value: 60, available: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex flex-col items-center justify-center p-4">
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
            {durations.map(({ label, value, available }) => (
              <Button
                key={value}
                size="lg"
                className={`w-full h-16 text-lg ${!available ? 'opacity-50 blur-[1px] cursor-not-allowed' : ''}`}
                onClick={() => available && setLocation(`/sessions/${type}/${value}`)}
                disabled={!available}
              >
                <Clock className="w-5 h-5 mr-2" />
                {label}
                {!available && <span className="ml-2 text-sm">(Coming soon)</span>}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
