// import { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import { X, Plus } from "lucide-react";

// interface ConditionMapping {
//   value: string;
//   targetNodeId: string;
// }

// interface EdgeConfigDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   edgeData: {
//     id: string;
//     source: string;
//     target: string;
//     type: "normal" | "condition";
//     state_key?: string;
//     conditions?: ConditionMapping[];
//   } | null;
//   availableNodes: Array<{ id: string; label: string }>;
//   onSave: (config: {
//     type: "normal" | "condition";
//     state_key?: string;
//     conditions?: ConditionMapping[];
//   }) => void;
// }

// export const EdgeConfigDialog = ({
//   open,
//   onOpenChange,
//   edgeData,
//   availableNodes,
//   onSave,
// }: EdgeConfigDialogProps) => {
//   const [edgeType, setEdgeType] = useState<"normal" | "condition">("normal");
//   const [stateKey, setStateKey] = useState("");
//   const [conditions, setConditions] = useState<ConditionMapping[]>([]);
//   const [newConditionValue, setNewConditionValue] = useState("");
//   const [newConditionTarget, setNewConditionTarget] = useState("");

//   useEffect(() => {
//     if (edgeData) {
//       setEdgeType(edgeData.type);
//       setStateKey(edgeData.state_key || "");
//       setConditions(edgeData.conditions || []);
//     }
//   }, [edgeData]);

//   const handleAddCondition = () => {
//     if (newConditionValue && newConditionTarget) {
//       setConditions([
//         ...conditions,
//         { value: newConditionValue, targetNodeId: newConditionTarget },
//       ]);
//       setNewConditionValue("");
//       setNewConditionTarget("");
//     }
//   };

//   const handleRemoveCondition = (index: number) => {
//     setConditions(conditions.filter((_, i) => i !== index));
//   };

//   const handleSave = () => {
//     if (edgeType === "condition") {
//       if (!stateKey) {
//         alert("State key is required for conditional edges");
//         return;
//       }
//       if (conditions.length === 0) {
//         alert("Add at least one condition mapping");
//         return;
//       }
//     }

//     onSave({
//       type: edgeType,
//       state_key: edgeType === "condition" ? stateKey : undefined,
//       conditions: edgeType === "condition" ? conditions : undefined,
//     });
//     onOpenChange(false);
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-md">
//         <DialogHeader>
//           <DialogTitle>Configure Edge</DialogTitle>
//           <DialogDescription>
//             Set edge type and conditional routing logic
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-4">
//           {/* Edge Type */}
//           <div className="space-y-2">
//             <Label>Edge Type</Label>
//             <Select
//               value={edgeType}
//               onValueChange={(value: "normal" | "condition") =>
//                 setEdgeType(value)
//               }
//             >
//               <SelectTrigger>
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="normal">Normal</SelectItem>
//                 <SelectItem value="condition">Conditional</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {edgeType === "condition" && (
//             <>
//               {/* State Key */}
//               <div className="space-y-2">
//                 <Label>State Key</Label>
//                 <Input
//                   value={stateKey}
//                   onChange={(e) => setStateKey(e.target.value)}
//                   placeholder="e.g., energy_level"
//                 />
//                 <p className="text-xs text-muted-foreground">
//                   The state variable name to check for routing decisions
//                 </p>
//               </div>

//               {/* Condition Mappings */}
//               <div className="space-y-2">
//                 <Label>Condition Mappings</Label>
//                 <div className="border border-border rounded-md p-3 space-y-2">
//                   {conditions.length === 0 ? (
//                     <p className="text-xs text-muted-foreground">
//                       No conditions added yet
//                     </p>
//                   ) : (
//                     conditions.map((condition, index) => {
//                       const targetNode = availableNodes.find(
//                         (n) => n.id === condition.targetNodeId
//                       );
//                       return (
//                         <div
//                           key={index}
//                           className="flex items-center justify-between bg-secondary/50 rounded px-2 py-1"
//                         >
//                           <div className="flex items-center gap-2 text-xs">
//                             <span className="font-mono font-medium">
//                               {condition.value}
//                             </span>
//                             <span className="text-muted-foreground">→</span>
//                             <span>{targetNode?.label || condition.targetNodeId}</span>
//                           </div>
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             className="h-6 w-6 p-0"
//                             onClick={() => handleRemoveCondition(index)}
//                           >
//                             <X className="h-3 w-3" />
//                           </Button>
//                         </div>
//                       );
//                     })
//                   )}

//                   {/* Add Condition Form */}
//                   <div className="pt-2 border-t border-border space-y-2">
//                     <Input
//                       placeholder="Condition value (e.g., 'high')"
//                       value={newConditionValue}
//                       onChange={(e) => setNewConditionValue(e.target.value)}
//                       className="text-xs"
//                     />
//                     <Select
//                       value={newConditionTarget}
//                       onValueChange={setNewConditionTarget}
//                     >
//                       <SelectTrigger className="text-xs">
//                         <SelectValue placeholder="Select target node..." />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {availableNodes.map((node) => (
//                           <SelectItem
//                             key={node.id}
//                             value={node.id}
//                             className="text-xs"
//                           >
//                             {node.label}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={handleAddCondition}
//                       disabled={!newConditionValue || !newConditionTarget}
//                       className="w-full text-xs"
//                     >
//                       <Plus className="w-3 h-3 mr-1" />
//                       Add Condition
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>

//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)}>
//             Cancel
//           </Button>
//           <Button onClick={handleSave}>Save</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// };
