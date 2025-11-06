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
  target: string;
  type: "normal" | "condition";
  state_key: string;
}
