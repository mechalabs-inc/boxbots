// import { useCallback, useEffect, useState } from "react";
// import ReactFlow, {
//   Background,
//   Controls,
//   MiniMap,
//   addEdge,
//   useNodesState,
//   useEdgesState,
//   type Connection,
//   type Edge as ReactFlowEdge,
//   type Node as ReactFlowNode,
//   type EdgeChange,
//   type NodeChange,
// } from "reactflow";
// import "reactflow/dist/style.css";
// import { WorkflowNodeCard } from "./nodes/WorkflowNodeCard";
// import { WorkflowEdge } from "./edges/WorkflowEdge";
// import { EdgeConfigDialog } from "./EdgeConfigDialog";
// import { Button } from "@/components/ui/button";
// import { Plus, Download, Upload, Save } from "lucide-react";
// import { toast } from "sonner";
// import type {
//   Workflow,
//   Node as WorkflowNode,
//   Edge as WorkflowEdge,
//   StateSchemaProperty,
// } from "@/types/workflow";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";

// const nodeTypes = {
//   workflowNode: (props: any) => <WorkflowNodeCard {...props} />,
// };

// const edgeTypes = {
//   workflow: (props: any) => <WorkflowEdge {...props} />,
// };

// interface WorkflowNodeData {
//   nodeId: string;
//   intent: string;
//   preferred_actions: string[];
//   onUpdate?: (
//     nodeId: string,
//     intent: string,
//     preferred_actions: string[]
//   ) => void;
//   onDelete?: () => void;
//   isFocused?: boolean;
//   isActive?: boolean;
// }

// interface WorkflowNodeGraphProps {
//   initialWorkflow?: Workflow;
// }

// export const WorkflowNodeGraph = ({
//   initialWorkflow,
// }: WorkflowNodeGraphProps = {}) => {
//   const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNodeData>([]);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
//   const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
//   const [saveDialogOpen, setSaveDialogOpen] = useState(false);
//   const [edgeConfigDialogOpen, setEdgeConfigDialogOpen] = useState(false);
//   const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

//   // Workflow metadata
//   const [workflowId, setWorkflowId] = useState(initialWorkflow?.id || "");
//   const [workflowName, setWorkflowName] = useState(initialWorkflow?.name || "");
//   const [workflowDescription, setWorkflowDescription] = useState(
//     initialWorkflow?.description || ""
//   );
//   const [workflowAuthor, setWorkflowAuthor] = useState(
//     initialWorkflow?.author || ""
//   );

//   // Node state storage (separate from ReactFlow nodes)
//   const [nodeStates, setNodeStates] = useState<Map<string, WorkflowNode>>(
//     new Map()
//   );

//   // Load initial workflow if provided
//   useEffect(() => {
//     if (initialWorkflow) {
//       loadWorkflowFromJson(initialWorkflow);
//     }
//   }, [initialWorkflow]);

//   // Auto-generate state schema from edges
//   const generateStateSchema = useCallback((): Record<
//     string,
//     StateSchemaProperty
//   > => {
//     const schema: Record<string, StateSchemaProperty> = {};

//     edges.forEach((edge) => {
//       const edgeData = edge.data as any;
//       if (
//         edgeData?.type === "condition" &&
//         edgeData?.state_key &&
//         edgeData?.conditions
//       ) {
//         const stateKey = edgeData.state_key;
//         const values = edgeData.conditions.map((c: any) => c.value);

//         // Check if values look like booleans
//         const allBooleanish = values.every(
//           (v: string) => v === "true" || v === "false"
//         );

//         // Check if values look like numbers
//         const allNumeric = values.every(
//           (v: string) => !isNaN(Number(v)) && v !== ""
//         );

//         if (allBooleanish) {
//           schema[stateKey] = {
//             type: "boolean",
//             default: false,
//           };
//         } else if (allNumeric) {
//           schema[stateKey] = {
//             type: "integer",
//             default: Number(values[0]) || 0,
//           };
//         } else {
//           // Default to string type
//           schema[stateKey] = {
//             type: "string",
//             default: values[0] || "",
//           };
//         }
//       }
//     });

//     return schema;
//   }, [edges]);

//   const handleDeleteNode = useCallback(
//     (nodeId: string) => {
//       setNodes((nds) => nds.filter((node) => node.id !== nodeId));
//       setEdges((eds) =>
//         eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
//       );
//       setNodeStates((prev) => {
//         const newMap = new Map(prev);
//         newMap.delete(nodeId);
//         return newMap;
//       });
//       if (focusedNodeId === nodeId) {
//         setFocusedNodeId(null);
//       }
//     },
//     [setNodes, setEdges, focusedNodeId]
//   );

//   const handleNodeUpdate = useCallback(
//     (
//       reactFlowNodeId: string,
//       nodeId: string,
//       intent: string,
//       preferred_actions: string[]
//     ) => {
//       // Update the node state
//       setNodeStates((prev) => {
//         const newMap = new Map(prev);
//         newMap.set(reactFlowNodeId, {
//           id: nodeId,
//           intent,
//           preferred_actions,
//         });
//         return newMap;
//       });

//       // Update ReactFlow node data
//       setNodes((nds) =>
//         nds.map((node) => {
//           if (node.id === reactFlowNodeId) {
//             return {
//               ...node,
//               data: {
//                 ...node.data,
//                 nodeId,
//                 intent,
//                 preferred_actions,
//               },
//             };
//           }
//           return node;
//         })
//       );
//     },
//     [setNodes]
//   );

//   // Update all nodes with callbacks
//   useEffect(() => {
//     setNodes((nds) =>
//       nds.map((node) => ({
//         ...node,
//         data: {
//           ...node.data,
//           onUpdate: (
//             nodeId: string,
//             intent: string,
//             preferred_actions: string[]
//           ) => handleNodeUpdate(node.id, nodeId, intent, preferred_actions),
//           onDelete: () => handleDeleteNode(node.id),
//           isFocused: node.id === focusedNodeId,
//         },
//       }))
//     );
//   }, [handleNodeUpdate, handleDeleteNode, focusedNodeId, setNodes]);

//   const handleEdgeClick = useCallback((edgeId: string) => {
//     setSelectedEdgeId(edgeId);
//     setEdgeConfigDialogOpen(true);
//   }, []);

//   const handleEdgeConfigSave = useCallback(
//     (config: {
//       type: "normal" | "condition";
//       state_key?: string;
//       conditions?: Array<{ value: string; targetNodeId: string }>;
//     }) => {
//       if (!selectedEdgeId) return;

//       setEdges((eds) =>
//         eds.map((edge) => {
//           if (edge.id === selectedEdgeId) {
//             return {
//               ...edge,
//               type: "workflow",
//               data: {
//                 ...edge.data,
//                 type: config.type,
//                 state_key: config.state_key,
//                 conditions: config.conditions,
//                 onEdgeClick: handleEdgeClick,
//               },
//               style: {
//                 ...edge.style,
//                 strokeWidth: config.type === "condition" ? 2 : 1.5,
//                 strokeDasharray: config.type === "condition" ? "5,5" : "none",
//                 stroke:
//                   config.type === "condition"
//                     ? "hsl(var(--primary))"
//                     : "hsl(var(--border))",
//               },
//             };
//           }
//           return edge;
//         })
//       );
//       setSelectedEdgeId(null);
//     },
//     [selectedEdgeId, setEdges, handleEdgeClick]
//   );

//   // Update all edges with callbacks
//   useEffect(() => {
//     setEdges((eds) =>
//       eds.map((edge) => ({
//         ...edge,
//         data: {
//           ...edge.data,
//           onEdgeClick: handleEdgeClick,
//         },
//       }))
//     );
//   }, [handleEdgeClick, setEdges]);

//   const onConnect = useCallback(
//     (params: Connection) => {
//       // Add metadata to distinguish edge types
//       const newEdge = {
//         ...params,
//         type: "workflow",
//         animated: false,
//         style: { stroke: "hsl(var(--border))", strokeWidth: 1.5 },
//         data: {
//           type: "normal",
//           onEdgeClick: handleEdgeClick,
//         },
//       };
//       setEdges((eds) => addEdge(newEdge, eds));
//     },
//     [setEdges, handleEdgeClick]
//   );

//   const addNode = useCallback(() => {
//     const timestamp = Date.now();
//     const newReactFlowNode: ReactFlowNode<WorkflowNodeData> = {
//       id: `rf-node-${timestamp}`,
//       type: "workflowNode",
//       position: {
//         x: 300 + Math.random() * 200,
//         y: 200 + Math.random() * 150,
//       },
//       data: {
//         nodeId: `node_${timestamp}`,
//         intent: "",
//         preferred_actions: [],
//         onUpdate: (
//           nodeId: string,
//           intent: string,
//           preferred_actions: string[]
//         ) =>
//           handleNodeUpdate(
//             `rf-node-${timestamp}`,
//             nodeId,
//             intent,
//             preferred_actions
//           ),
//         onDelete: () => handleDeleteNode(`rf-node-${timestamp}`),
//       },
//     };

//     setNodes((nds) => [...nds, newReactFlowNode]);

//     // Initialize node state
//     setNodeStates((prev) => {
//       const newMap = new Map(prev);
//       newMap.set(`rf-node-${timestamp}`, {
//         id: `node_${timestamp}`,
//         intent: "",
//         preferred_actions: [],
//       });
//       return newMap;
//     });
//   }, [setNodes, handleNodeUpdate, handleDeleteNode]);

//   const exportToJson = useCallback(() => {
//     if (!workflowId || !workflowName) {
//       toast.error("Please provide workflow ID and name before exporting");
//       return;
//     }

//     if (nodes.length === 0) {
//       toast.error("Add at least one node before exporting");
//       return;
//     }

//     // Convert ReactFlow nodes to workflow nodes
//     const workflowNodes: WorkflowNode[] = [];
//     nodes.forEach((node) => {
//       const state = nodeStates.get(node.id);
//       if (state) {
//         workflowNodes.push(state);
//       }
//     });

//     // Convert ReactFlow edges to workflow edges
//     const workflowEdges: WorkflowEdge[] = edges.map((edge, index) => {
//       const edgeData = edge.data as any;
//       const sourceNode = nodeStates.get(edge.source);

//       // Handle conditional edges with multiple targets
//       let target: string | Record<string, string>;
//       if (edgeData?.type === "condition" && edgeData?.conditions) {
//         // Convert conditions array to object mapping
//         target = {};
//         edgeData.conditions.forEach((condition: any) => {
//           const targetReactFlowId = condition.targetNodeId;
//           const targetNode = nodeStates.get(targetReactFlowId);
//           target[condition.value] = targetNode?.id || targetReactFlowId;
//         });
//       } else {
//         // Normal edge with single target
//         const targetNode = nodeStates.get(edge.target as string);
//         target = targetNode?.id || (edge.target as string);
//       }

//       return {
//         id: `e${index + 1}`,
//         source: sourceNode?.id || edge.source,
//         target: target,
//         type: edgeData?.type || "normal",
//         state_key: edgeData?.state_key,
//       };
//     });

//     // Add START and END edges if needed
//     const startNode = nodes.find(
//       (node) => !edges.some((edge) => edge.target === node.id)
//     );

//     if (startNode) {
//       const state = nodeStates.get(startNode.id);
//       if (state) {
//         workflowEdges.unshift({
//           id: "start",
//           source: "START",
//           target: state.id,
//           type: "normal",
//         });
//       }
//     }

//     const endNode = nodes.find(
//       (node) => !edges.some((edge) => edge.source === node.id)
//     );

//     if (endNode && endNode.id !== startNode?.id) {
//       const state = nodeStates.get(endNode.id);
//       if (state) {
//         workflowEdges.push({
//           id: "end",
//           source: state.id,
//           target: "END",
//           type: "normal",
//         });
//       }
//     }

//     const workflow: Workflow = {
//       id: workflowId,
//       name: workflowName,
//       description: workflowDescription,
//       author: workflowAuthor,
//       createdAt: new Date().toISOString(),
//       state_schema: generateStateSchema(),
//       nodes: workflowNodes,
//       edges: workflowEdges,
//     };

//     // Download as JSON
//     const blob = new Blob([JSON.stringify(workflow, null, 2)], {
//       type: "application/json",
//     });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `${workflowId}.json`;
//     a.click();
//     URL.revokeObjectURL(url);

//     toast.success(`Workflow exported as ${workflowId}.json`);
//   }, [
//     nodes,
//     edges,
//     nodeStates,
//     workflowId,
//     workflowName,
//     workflowDescription,
//     workflowAuthor,
//     generateStateSchema,
//   ]);

//   const loadWorkflowFromJson = useCallback(
//     (workflow: Workflow) => {
//       // Clear existing state
//       setNodes([]);
//       setEdges([]);
//       setNodeStates(new Map());

//       // Set metadata
//       setWorkflowId(workflow.id);
//       setWorkflowName(workflow.name);
//       setWorkflowDescription(workflow.description);
//       setWorkflowAuthor(workflow.author);

//       // Create ReactFlow nodes
//       const newNodes: ReactFlowNode<WorkflowNodeData>[] = [];
//       const nodeIdMap = new Map<string, string>(); // Map workflow node IDs to ReactFlow node IDs

//       workflow.nodes.forEach((node, index) => {
//         const reactFlowNodeId = `rf-node-${Date.now()}-${index}`;
//         nodeIdMap.set(node.id, reactFlowNodeId);

//         const newNode: ReactFlowNode<WorkflowNodeData> = {
//           id: reactFlowNodeId,
//           type: "workflowNode",
//           position: {
//             x: 100 + (index % 3) * 300,
//             y: 100 + Math.floor(index / 3) * 200,
//           },
//           data: {
//             nodeId: node.id,
//             intent: node.intent,
//             preferred_actions: node.preferred_actions,
//             onUpdate: (
//               nodeId: string,
//               intent: string,
//               preferred_actions: string[]
//             ) =>
//               handleNodeUpdate(
//                 reactFlowNodeId,
//                 nodeId,
//                 intent,
//                 preferred_actions
//               ),
//             onDelete: () => handleDeleteNode(reactFlowNodeId),
//           },
//         };

//         newNodes.push(newNode);

//         // Store node state
//         setNodeStates((prev) => {
//           const newMap = new Map(prev);
//           newMap.set(reactFlowNodeId, node);
//           return newMap;
//         });
//       });

//       setNodes(newNodes);

//       // Create ReactFlow edges
//       const newEdges: ReactFlowEdge[] = workflow.edges
//         .filter((edge) => edge.source !== "START" && edge.target !== "END")
//         .map((edge, index) => {
//           const sourceId = nodeIdMap.get(edge.source) || edge.source;

//           // Handle conditional edges
//           let conditions:
//             | Array<{ value: string; targetNodeId: string }>
//             | undefined;
//           let targetId: string;

//           if (typeof edge.target === "object" && edge.target !== null) {
//             // Conditional edge with multiple targets
//             conditions = Object.entries(edge.target).map(([value, nodeId]) => ({
//               value,
//               targetNodeId: nodeIdMap.get(nodeId) || nodeId,
//             }));
//             // For ReactFlow, use the first target as the visual target
//             targetId = conditions[0]?.targetNodeId || sourceId;
//           } else {
//             // Normal edge with single target
//             targetId = nodeIdMap.get(edge.target) || edge.target;
//           }

//           const isConditional = edge.type === "condition";

//           return {
//             id: `edge-${index}`,
//             source: sourceId,
//             target: targetId,
//             type: "workflow",
//             animated: false,
//             style: {
//               stroke: isConditional
//                 ? "hsl(var(--primary))"
//                 : "hsl(var(--border))",
//               strokeWidth: isConditional ? 2 : 1.5,
//               strokeDasharray: isConditional ? "5,5" : "none",
//             },
//             data: {
//               type: edge.type,
//               state_key: edge.state_key,
//               conditions: conditions,
//               onEdgeClick: handleEdgeClick,
//             },
//           };
//         });

//       setEdges(newEdges);
//       toast.success("Workflow loaded successfully");
//     },
//     [setNodes, setEdges, handleNodeUpdate, handleDeleteNode]
//   );

//   const handleImportJson = useCallback(() => {
//     const input = document.createElement("input");
//     input.type = "file";
//     input.accept = ".json";
//     input.onchange = (e: any) => {
//       const file = e.target.files?.[0];
//       if (!file) return;

//       const reader = new FileReader();
//       reader.onload = (event) => {
//         try {
//           const workflow = JSON.parse(
//             event.target?.result as string
//           ) as Workflow;
//           loadWorkflowFromJson(workflow);
//         } catch (error) {
//           console.error("Failed to parse workflow JSON:", error);
//           toast.error("Invalid workflow JSON file");
//         }
//       };
//       reader.readAsText(file);
//     };
//     input.click();
//   }, [loadWorkflowFromJson]);

//   return (
//     <div className="w-full h-full bg-background flex flex-col">
//       {/* Toolbar */}
//       <div className="bg-card border-b border-border p-3 flex flex-wrap gap-2">
//         <div className="flex gap-2 items-center">
//           <Button
//             size="sm"
//             variant="outline"
//             className="text-xs"
//             onClick={addNode}
//           >
//             <Plus className="w-3 h-3 mr-1" />
//             Add Node
//           </Button>
//         </div>
//         <div className="border-l border-border pl-2 ml-auto flex gap-2">
//           <Button
//             size="sm"
//             variant="outline"
//             className="text-xs"
//             onClick={handleImportJson}
//           >
//             <Upload className="w-3 h-3 mr-1" />
//             Import JSON
//           </Button>
//           <Button
//             size="sm"
//             variant="outline"
//             className="text-xs"
//             onClick={() => setSaveDialogOpen(true)}
//           >
//             <Save className="w-3 h-3 mr-1" />
//             Configure & Export
//           </Button>
//         </div>
//       </div>

//       {/* Canvas Area */}
//       <div className="flex-1 relative">
//         <ReactFlow
//           nodes={nodes}
//           edges={edges}
//           onNodesChange={onNodesChange}
//           onEdgesChange={onEdgesChange}
//           onConnect={onConnect}
//           onNodeClick={(_, node) => {
//             setFocusedNodeId(node.id);
//           }}
//           onPaneClick={() => {
//             setFocusedNodeId(null);
//           }}
//           nodeTypes={nodeTypes}
//           edgeTypes={edgeTypes}
//           fitView
//           className="bg-background w-full h-full"
//           style={{ width: "100%", height: "100%" }}
//           defaultEdgeOptions={{
//             type: "workflow",
//             animated: false,
//             style: { stroke: "hsl(var(--border))", strokeWidth: 1.5 },
//           }}
//         >
//           <Background color="hsl(var(--border))" gap={16} size={0.5} />
//           <Controls className="!bg-card !border-border !shadow-sm" />
//           <MiniMap
//             className="!bg-card !border-border !shadow-sm"
//             nodeColor="hsl(var(--foreground))"
//             maskColor="rgba(0, 0, 0, 0.05)"
//           />
//         </ReactFlow>
//       </div>

//       {/* Edge Configuration Dialog */}
//       <EdgeConfigDialog
//         open={edgeConfigDialogOpen}
//         onOpenChange={setEdgeConfigDialogOpen}
//         edgeData={
//           selectedEdgeId
//             ? {
//                 id: selectedEdgeId,
//                 source:
//                   edges.find((e) => e.id === selectedEdgeId)?.source || "",
//                 target:
//                   (edges.find((e) => e.id === selectedEdgeId)
//                     ?.target as string) || "",
//                 type:
//                   (edges.find((e) => e.id === selectedEdgeId)?.data as any)
//                     ?.type || "normal",
//                 state_key: (
//                   edges.find((e) => e.id === selectedEdgeId)?.data as any
//                 )?.state_key,
//                 conditions: (
//                   edges.find((e) => e.id === selectedEdgeId)?.data as any
//                 )?.conditions,
//               }
//             : null
//         }
//         availableNodes={Array.from(nodeStates.entries()).map(
//           ([rfId, node]) => ({
//             id: rfId,
//             label: node.id,
//           })
//         )}
//         onSave={handleEdgeConfigSave}
//       />

//       {/* Save/Export Dialog */}
//       <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>Configure Workflow</DialogTitle>
//             <DialogDescription>
//               Set workflow metadata before exporting to JSON
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div className="space-y-2">
//               <label className="text-sm font-medium">Workflow ID</label>
//               <Input
//                 value={workflowId}
//                 onChange={(e) => setWorkflowId(e.target.value)}
//                 placeholder="e.g., focus_session"
//               />
//             </div>
//             <div className="space-y-2">
//               <label className="text-sm font-medium">Name</label>
//               <Input
//                 value={workflowName}
//                 onChange={(e) => setWorkflowName(e.target.value)}
//                 placeholder="e.g., Focus Session Setup"
//               />
//             </div>
//             <div className="space-y-2">
//               <label className="text-sm font-medium">Description</label>
//               <Textarea
//                 value={workflowDescription}
//                 onChange={(e) => setWorkflowDescription(e.target.value)}
//                 placeholder="Brief description of the workflow"
//                 className="resize-none"
//               />
//             </div>
//             <div className="space-y-2">
//               <label className="text-sm font-medium">Author</label>
//               <Input
//                 value={workflowAuthor}
//                 onChange={(e) => setWorkflowAuthor(e.target.value)}
//                 placeholder="Your name or team"
//               />
//             </div>
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
//               Cancel
//             </Button>
//             <Button
//               onClick={() => {
//                 exportToJson();
//                 setSaveDialogOpen(false);
//               }}
//             >
//               <Download className="w-4 h-4 mr-2" />
//               Export JSON
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };
