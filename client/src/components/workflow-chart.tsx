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
  currentStage: WorkflowStage;
  stageStatuses: Record<WorkflowStage, StageStatus>;
}

const StageNode = ({ 
  title, 
  icon: Icon, 
  status, 
  isActive,
  position 
}: { 
  title: string; 
  icon: any; 
  status: StageStatus; 
  isActive: boolean;
  position: { x: number; y: number };
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
        data-testid={`workflow-stage-${title.toLowerCase().replace(/\s+/g, "-")}`}
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

export default function WorkflowChart({ currentStage, stageStatuses }: WorkflowChartProps) {
  // Define circular positions for each stage (percentage-based)
  const stagePositions = {
    // Top center - Waiting stages
    "waiting-pool": { x: 35, y: 8 },
    "waiting-mic": { x: 65, y: 8 },
    
    // Right side - Collecting stages
    "collecting-pool": { x: 85, y: 30 },
    "collecting-mic": { x: 85, y: 50 },
    
    // Bottom right - Decision
    "decision": { x: 75, y: 75 },
    
    // Bottom center - AI Setup
    "ai-setup-pool": { x: 50, y: 92 },
    "ai-setup-mic": { x: 25, y: 92 },
    
    // Left side - Output stages
    "text-response": { x: 15, y: 70 },
    "voice": { x: 15, y: 50 },
    "complete": { x: 15, y: 30 },
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-1">DachiStream Workflow</h3>
          <p className="text-xs text-muted-foreground">
            Continuous circular pipeline • Real-time stage tracking
          </p>
        </div>

        {/* Circular Workflow Container */}
        <div className="relative w-full" style={{ paddingTop: '100%' }}>
          {/* Background circular path visualization */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 400 400"
          >
            {/* Outer circle guide */}
            <circle
              cx="200"
              cy="200"
              r="160"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="4 4"
              className="text-muted-foreground/20"
            />
            
            {/* Center circle */}
            <circle
              cx="200"
              cy="200"
              r="50"
              fill="currentColor"
              className="text-primary/10"
            />
            
            {/* Center icon */}
            <text
              x="200"
              y="200"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-primary font-semibold"
              fontSize="16"
            >
              AI
            </text>
            <text
              x="200"
              y="220"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-muted-foreground"
              fontSize="12"
            >
              Cycle
            </text>

            {/* Connection arrows (circular flow) */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
                className="text-primary"
              >
                <polygon points="0 0, 10 3, 0 6" fill="currentColor" className="text-primary/60" />
              </marker>
            </defs>

            {/* Flow arrows connecting the stages in a loop */}
            {/* Top: waiting -> collecting */}
            <path
              d="M 260 35 Q 300 50 320 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="text-primary/40"
              markerEnd="url(#arrowhead)"
            />
            
            {/* Right: collecting -> decision */}
            <path
              d="M 340 180 Q 340 220 320 270"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="text-primary/40"
              markerEnd="url(#arrowhead)"
            />
            
            {/* Bottom: decision -> ai setup */}
            <path
              d="M 280 310 Q 240 340 180 360"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="text-primary/40"
              markerEnd="url(#arrowhead)"
            />
            
            {/* Left: ai setup -> output */}
            <path
              d="M 100 350 Q 60 320 60 260"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="text-primary/40"
              markerEnd="url(#arrowhead)"
            />
            
            {/* Return: output -> waiting (completing the loop) */}
            <path
              d="M 70 100 Q 80 60 130 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="text-primary/40"
              markerEnd="url(#arrowhead)"
            />
          </svg>

          {/* Stage Nodes */}
          <StageNode
            title="Pool Wait"
            icon={Clock}
            status={stageStatuses["waiting-pool"]}
            isActive={currentStage === "waiting-pool"}
            position={stagePositions["waiting-pool"]}
          />
          <StageNode
            title="Mic Wait"
            icon={Timer}
            status={stageStatuses["waiting-mic"]}
            isActive={currentStage === "waiting-mic"}
            position={stagePositions["waiting-mic"]}
          />
          <StageNode
            title="Pool Collect"
            icon={MessageSquare}
            status={stageStatuses["collecting-pool"]}
            isActive={currentStage === "collecting-pool"}
            position={stagePositions["collecting-pool"]}
          />
          <StageNode
            title="Mic Input"
            icon={Volume2}
            status={stageStatuses["collecting-mic"]}
            isActive={currentStage === "collecting-mic"}
            position={stagePositions["collecting-mic"]}
          />
          <StageNode
            title="Decision"
            icon={GitBranch}
            status={stageStatuses["decision"]}
            isActive={currentStage === "decision"}
            position={stagePositions["decision"]}
          />
          <StageNode
            title="Pool Context"
            icon={Sparkles}
            status={stageStatuses["ai-setup-pool"]}
            isActive={currentStage === "ai-setup-pool"}
            position={stagePositions["ai-setup-pool"]}
          />
          <StageNode
            title="Mic Rephrase"
            icon={Sparkles}
            status={stageStatuses["ai-setup-mic"]}
            isActive={currentStage === "ai-setup-mic"}
            position={stagePositions["ai-setup-mic"]}
          />
          <StageNode
            title="Text AI"
            icon={FileText}
            status={stageStatuses["text-response"]}
            isActive={currentStage === "text-response"}
            position={stagePositions["text-response"]}
          />
          <StageNode
            title="Voice AI"
            icon={Volume2}
            status={stageStatuses["voice"]}
            isActive={currentStage === "voice"}
            position={stagePositions["voice"]}
          />
          <StageNode
            title="Complete"
            icon={CheckCircle2}
            status={stageStatuses["complete"]}
            isActive={currentStage === "complete"}
            position={stagePositions["complete"]}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-3 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500/30 border border-green-500"></div>
            <span className="text-xs text-muted-foreground">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500/30 border border-blue-500"></div>
            <span className="text-xs text-muted-foreground">Success</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500/30 border border-yellow-500"></div>
            <span className="text-xs text-muted-foreground">Waiting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500"></div>
            <span className="text-xs text-muted-foreground">Error</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
