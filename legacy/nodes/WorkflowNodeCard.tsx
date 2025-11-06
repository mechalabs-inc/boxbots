// import { Handle, Position } from "reactflow";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { X } from "lucide-react";
// import { useState, useEffect } from "react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";

// interface WorkflowNodeCardProps {
//   id: string;
//   data: {
//     nodeId: string;
//     intent: string;
//     preferred_actions: string[];
//     onUpdate?: (nodeId: string, intent: string, preferred_actions: string[]) => void;
//     onDelete?: () => void;
//     isFocused?: boolean;
//     isActive?: boolean;
//   };
// }

// // Available actions that can be performed by the robot
// const AVAILABLE_ACTIONS = [
//   "set_rgb_solid",
//   "set_rgb_pulse",
//   "set_rgb_rainbow",
//   "play_recording",
//   "move_joint",
//   "speak",
//   "listen",
//   "wait",
//   "send_notification",
// ];

// export const WorkflowNodeCard = ({ id, data }: WorkflowNodeCardProps) => {
//   const [localNodeId, setLocalNodeId] = useState(data.nodeId);
//   const [localIntent, setLocalIntent] = useState(data.intent);
//   const [localActions, setLocalActions] = useState(data.preferred_actions);
//   const [selectedAction, setSelectedAction] = useState<string>("");

//   useEffect(() => {
//     setLocalNodeId(data.nodeId);
//     setLocalIntent(data.intent);
//     setLocalActions(data.preferred_actions);
//   }, [data.nodeId, data.intent, data.preferred_actions]);

//   const handleUpdate = () => {
//     if (data.onUpdate) {
//       data.onUpdate(localNodeId, localIntent, localActions);
//     }
//   };

//   const handleAddAction = () => {
//     if (selectedAction && !localActions.includes(selectedAction)) {
//       const newActions = [...localActions, selectedAction];
//       setLocalActions(newActions);
//       if (data.onUpdate) {
//         data.onUpdate(localNodeId, localIntent, newActions);
//       }
//       setSelectedAction("");
//     }
//   };

//   const handleRemoveAction = (action: string) => {
//     const newActions = localActions.filter((a) => a !== action);
//     setLocalActions(newActions);
//     if (data.onUpdate) {
//       data.onUpdate(localNodeId, localIntent, newActions);
//     }
//   };

//   // Convert spaces and special chars to underscores for slug
//   const slugify = (text: string) => {
//     return text
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, "_")
//       .replace(/^_+|_+$/g, "");
//   };

//   return (
//     <div
//       className={`node-card min-w-[320px] max-w-[400px] relative transition-all ${
//         data.isFocused ? "ring-2 ring-primary/50" : ""
//       } ${
//         data.isActive
//           ? "ring-4 ring-primary shadow-lg shadow-primary/50 scale-105"
//           : ""
//       }`}
//     >
//       <Handle
//         type="target"
//         position={Position.Left}
//         className="w-2 h-2 !bg-border"
//       />

//       {data.onDelete && (
//         <Button
//           variant="ghost"
//           size="sm"
//           className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground z-10"
//           onClick={(e) => {
//             e.stopPropagation();
//             data.onDelete?.();
//           }}
//         >
//           <X className="h-3 w-3" />
//         </Button>
//       )}

//       <div className="space-y-4">
//         <div className="text-xs text-muted-foreground/60 mb-2 uppercase tracking-wider">
//           Workflow Node
//         </div>

//         {/* Node ID (slug) */}
//         <div className="space-y-1.5">
//           <label className="text-xs text-muted-foreground">Node ID (slug)</label>
//           <Input
//             value={localNodeId}
//             onChange={(e) => {
//               const slugged = slugify(e.target.value);
//               setLocalNodeId(slugged);
//             }}
//             onBlur={handleUpdate}
//             placeholder="e.g., greet_user"
//             className="text-xs"
//           />
//         </div>

//         {/* Intent */}
//         <div className="space-y-1.5">
//           <label className="text-xs text-muted-foreground">Intent</label>
//           <Textarea
//             value={localIntent}
//             onChange={(e) => setLocalIntent(e.target.value)}
//             onBlur={handleUpdate}
//             placeholder="What should the robot do at this point?"
//             className="text-xs min-h-[80px] resize-none"
//           />
//         </div>

//         {/* Preferred Actions */}
//         <div className="space-y-1.5">
//           <label className="text-xs text-muted-foreground">
//             Preferred Actions
//           </label>

//           {/* Display selected actions */}
//           <div className="flex flex-wrap gap-1 min-h-[32px] p-2 border border-border rounded-md bg-background">
//             {localActions.length === 0 ? (
//               <span className="text-xs text-muted-foreground/60">
//                 No actions selected
//               </span>
//             ) : (
//               localActions.map((action) => (
//                 <Badge
//                   key={action}
//                   variant="secondary"
//                   className="text-xs flex items-center gap-1"
//                 >
//                   {action}
//                   <button
//                     onClick={() => handleRemoveAction(action)}
//                     className="ml-1 hover:text-destructive"
//                   >
//                     <X className="h-2.5 w-2.5" />
//                   </button>
//                 </Badge>
//               ))
//             )}
//           </div>

//           {/* Action selector */}
//           <div className="flex gap-2">
//             <Select value={selectedAction} onValueChange={setSelectedAction}>
//               <SelectTrigger className="text-xs h-8">
//                 <SelectValue placeholder="Select action..." />
//               </SelectTrigger>
//               <SelectContent>
//                 {AVAILABLE_ACTIONS.filter((a) => !localActions.includes(a)).map(
//                   (action) => (
//                     <SelectItem key={action} value={action} className="text-xs">
//                       {action}
//                     </SelectItem>
//                   )
//                 )}
//               </SelectContent>
//             </Select>
//             <Button
//               size="sm"
//               variant="outline"
//               onClick={handleAddAction}
//               disabled={!selectedAction}
//               className="text-xs h-8"
//             >
//               Add
//             </Button>
//           </div>
//         </div>
//       </div>

//       <Handle
//         type="source"
//         position={Position.Right}
//         className="w-2 h-2 !bg-border"
//       />
//     </div>
//   );
// };
