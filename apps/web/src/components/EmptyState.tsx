import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-12">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
          </div>
          {action && (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
