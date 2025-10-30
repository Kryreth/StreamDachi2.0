import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MessageSquare, GitBranch, Sparkles, FileText, Volume2, CheckCircle2, AlertCircle, Timer } from "lucide-react";

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
  currentStage: WorkflowStage;
  stageStatuses: Record<WorkflowStage, StageStatus>;
}

const StageBox = ({ 
  title, 
  icon: Icon, 
  status, 
  isActive 
}: { 
  title: string; 
  icon: any; 
  status: StageStatus; 
  isActive: boolean;
}) => {
  const getStatusColor = () => {
    if (status === "active") return "bg-green-500/20 border-green-500";
    if (status === "error") return "bg-red-500/20 border-red-500";
    if (status === "waiting-input") return "bg-yellow-500/20 border-yellow-500";
    if (status === "success") return "bg-blue-500/20 border-blue-500";
    return "bg-muted border-border";
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
      className={`
        relative p-4 rounded-lg border-2 transition-all duration-300
        ${getStatusColor()}
        ${isActive ? "shadow-lg scale-105" : ""}
      `}
      data-testid={`workflow-stage-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex flex-col items-center gap-2">
        <Icon className={`h-6 w-6 ${getTextColor()}`} />
        <span className={`text-sm font-medium text-center ${getTextColor()}`}>
          {title}
        </span>
        {status !== "idle" && (
          <Badge variant={status === "active" ? "default" : "secondary"} className="text-xs">
            {status === "active" && "Active"}
            {status === "error" && "Error"}
            {status === "waiting-input" && "Waiting"}
            {status === "success" && "Done"}
          </Badge>
        )}
      </div>
    </div>
  );
};

const Arrow = ({ vertical = false }: { vertical?: boolean }) => (
  <div
    className={`
      flex items-center justify-center
      ${vertical ? "h-8 w-full" : "w-8 h-full"}
    `}
  >
    <div className={`
      ${vertical ? "h-full w-0.5 border-l-2" : "w-full h-0.5 border-t-2"}
      border-dashed border-muted-foreground/30
    `} />
  </div>
);

export default function WorkflowChart({ currentStage, stageStatuses }: WorkflowChartProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">DachiStream Workflow</h3>
          <p className="text-sm text-muted-foreground">
            Real-time visual representation of the message processing pipeline
          </p>
        </div>

        {/* Stage 1: Waiting (Two boxes side by side) */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Stage 1: Waiting</h4>
          <div className="grid grid-cols-2 gap-4">
            <StageBox
              title="Pool Responses"
              icon={Clock}
              status={stageStatuses["waiting-pool"]}
              isActive={currentStage === "waiting-pool"}
            />
            <StageBox
              title="Mic Responses"
              icon={Timer}
              status={stageStatuses["waiting-mic"]}
              isActive={currentStage === "waiting-mic"}
            />
          </div>
        </div>

        <Arrow vertical />

        {/* Stage 2: Collecting (Two boxes side by side) */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Stage 2: Collecting</h4>
          <div className="grid grid-cols-2 gap-4">
            <StageBox
              title="Pool Messages"
              icon={MessageSquare}
              status={stageStatuses["collecting-pool"]}
              isActive={currentStage === "collecting-pool"}
            />
            <StageBox
              title="Mic Input"
              icon={Volume2}
              status={stageStatuses["collecting-mic"]}
              isActive={currentStage === "collecting-mic"}
            />
          </div>
        </div>

        <Arrow vertical />

        {/* Stage 3: Decision Point */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Stage 3: Decision</h4>
          <div className="flex justify-center">
            <div className="w-1/2">
              <StageBox
                title="Mic or Pool?"
                icon={GitBranch}
                status={stageStatuses["decision"]}
                isActive={currentStage === "decision"}
              />
            </div>
          </div>
        </div>

        <Arrow vertical />

        {/* Stage 4: AI Setup (Two paths) */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Stage 4: AI Setup</h4>
          <div className="grid grid-cols-2 gap-4">
            <StageBox
              title="Cleanup/Rephrase (Mic)"
              icon={Sparkles}
              status={stageStatuses["ai-setup-mic"]}
              isActive={currentStage === "ai-setup-mic"}
            />
            <StageBox
              title="Context Analysis (Pool)"
              icon={Sparkles}
              status={stageStatuses["ai-setup-pool"]}
              isActive={currentStage === "ai-setup-pool"}
            />
          </div>
        </div>

        <Arrow vertical />

        {/* Stage 5: Text Response */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Stage 5: AI Text Response</h4>
          <div className="flex justify-center">
            <div className="w-1/2">
              <StageBox
                title="Text Generated"
                icon={FileText}
                status={stageStatuses["text-response"]}
                isActive={currentStage === "text-response"}
              />
            </div>
          </div>
        </div>

        <Arrow vertical />

        {/* Stage 6: Voice Output */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Stage 6: Voice AI</h4>
          <div className="flex justify-center">
            <div className="w-1/2">
              <StageBox
                title="Voice Output"
                icon={Volume2}
                status={stageStatuses["voice"]}
                isActive={currentStage === "voice"}
              />
            </div>
          </div>
        </div>

        <Arrow vertical />

        {/* Stage 7: Complete */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Stage 7: Complete</h4>
          <div className="flex justify-center">
            <div className="w-1/2">
              <StageBox
                title="Cycle Complete"
                icon={CheckCircle2}
                status={stageStatuses["complete"]}
                isActive={currentStage === "complete"}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
