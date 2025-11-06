// Create the workflow, node, and edge structs

export interface StateSchemaProperty {
  type: "boolean" | "string" | "integer" | "number";
  default: boolean | string | number;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  author: string;
  createdAt: string;
  state_schema: Record<string, StateSchemaProperty>;
  nodes: Node[];
  edges: Edge[];
}

export interface Node {
  id: string;
  intent: string;
  preferred_actions: string[];
}

export interface Edge {
  id: string;
  source: string;
  target: string | Record<string, string>; // For conditional edges, target is an object mapping values to node IDs
  type: "normal" | "condition";
  state_key?: string; // Only required for condition type
}
