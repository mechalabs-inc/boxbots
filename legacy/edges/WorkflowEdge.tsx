// import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from "reactflow";
// import type { EdgeProps } from "reactflow";
// import { Button } from "@/components/ui/button";
// import { Settings } from "lucide-react";

// export const WorkflowEdge = ({
//   id,
//   sourceX,
//   sourceY,
//   targetX,
//   targetY,
//   sourcePosition,
//   targetPosition,
//   style = {},
//   markerEnd,
//   data,
// }: EdgeProps) => {
//   const [edgePath, labelX, labelY] = getSmoothStepPath({
//     sourceX,
//     sourceY,
//     sourcePosition,
//     targetX,
//     targetY,
//     targetPosition,
//   });

//   const isConditional = data?.type === "condition";

//   return (
//     <>
//       <BaseEdge
//         path={edgePath}
//         markerEnd={markerEnd}
//         style={{
//           ...style,
//           strokeWidth: isConditional ? 2 : 1.5,
//           strokeDasharray: isConditional ? "5,5" : "none",
//           stroke: isConditional
//             ? "hsl(var(--primary))"
//             : "hsl(var(--border))",
//         }}
//       />
//       <EdgeLabelRenderer>
//         <div
//           style={{
//             position: "absolute",
//             transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
//             pointerEvents: "all",
//           }}
//           className="nodrag nopan"
//         >
//           <Button
//             variant="outline"
//             size="sm"
//             className="h-6 w-6 p-0 rounded-full bg-background shadow-md"
//             onClick={() => data?.onEdgeClick?.(id)}
//           >
//             <Settings className="h-3 w-3" />
//           </Button>
//           {isConditional && data?.state_key && (
//             <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap">
//               <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono">
//                 {data.state_key}
//               </span>
//             </div>
//           )}
//         </div>
//       </EdgeLabelRenderer>
//     </>
//   );
// };
