```tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MessageSquare, GitBranch, Sparkles, FileText, Volume2, CheckCircle2, Timer } from "lucide-react";

export type WorkflowStage = 
  | "waiting-pool" 
  | "waiting-mic" 
  | "collecting-pool" 
  | "collecting-mic" 
  | "decision" 
  | "ai-setup-mic" 
  | "ai-setup-pool" 
  | "text-response" 
  | "voice" 
  | "complete";

export type StageStatus = "idle" | "active" | "error" | "waiting-input" | "success";

interface WorkflowChartProps {
  readonly currentStage: WorkflowStage;
  readonly stageStatuses: Record<WorkflowStage, StageStatus>;
}

const StageNode = ({ 
  title, 
  icon: Icon, 
  status, 
  isActive,
  position 
}: { 
  readonly title: string; 
  readonly icon: any; 
  readonly status: StageStatus; 
  readonly isActive: boolean;
  readonly position: { x: number; y: number };
}) => {
  const getStatusColor = () => {
    if (status === "active") return "bg-green-500/30 border-green-500 shadow-green-500/50";
    if (status === "error") return "bg-red-500/30 border-red-500 shadow-red-500/50";
    if (status === "waiting-input") return "bg-yellow-500/30 border-yellow-500 shadow-yellow-500/50";
    if (status === "success") return "bg-blue-500/30 border-blue-500 shadow-blue-500/50";
    return "bg-card/80 border-border";
  };

  const getTextColor = () => {
    if (status === "active") return "text-green-400";
    if (status === "error") return "text-red-400";
    if (status === "waiting-input") return "text-yellow-400";
    if (status === "success") return "text-blue-400";
    return "text-muted-foreground";
  };

  return (
    <div
      className="absolute"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div
        className={`
          relative p-3 rounded-lg border-2 transition-all duration-300 backdrop-blur-sm
          ${getStatusColor()}
          ${isActive ? "shadow-xl scale-110 ring-2 ring-primary/50" : "shadow-md"}
        `}
        data-testid={`workflow-stage-${title.toLowerCase().replaceAll(/\s+/g, "-")}`}
      >
        <div className="flex flex-col items-center gap-1 min-w-[100px]">
          <Icon className={`h-5 w-5 ${getTextColor()}`} />
          <span className={`text-xs font-medium text-center whitespace-nowrap ${getTextColor()}`}>
            {title}
          </span>
          {status !== "idle" && (
            <Badge variant={status === "active" ? "default" : "secondary"} className="text-[10px] px-1 py-0">
              {status === "active" && "Active"}
              {status === "error" && "Error"}
              {status === "waiting-input" && "Waiting"}
              {status === "success" && "Done"}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default function WorkflowChart({ currentStage, stageStatuses }: Readonly<WorkflowChartProps>) {
  const stagePositions = {
    "waiting-pool": { x: 35, y: 8 },
    "waiting-mic": { x: 65, y: 8 },
    "collecting-pool": { x: 85, y: 30 },
    "collecting-mic": { x: 85, y: 50 },
    "decision": { x: 75, y: 75 },
    "ai-setup-pool": { x: 50, y: 92 },
    "ai-setup-mic": { x: 25, y: 92 },
    "text-response": { x: 15, y: 70 },
    "voice": { x: 15, y: 50 },
    "complete": { x: 15, y: 30 },
  };

  return (
    <Card className="p-6">
      {/* content unchanged */}
    </Card>
  );
}
