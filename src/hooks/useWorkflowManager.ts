import { useState, useEffect } from "react";
import type { Node, Edge } from "reactflow";
import { toast } from "sonner";
import { workflowApi } from "@/lib/api";

export interface BehaviorWorkflow {
  id: string;
  name: string;
  description: string;
  author: string;
  createdAt: string;
  nodes: Node[];
  edges: Edge[];
  tags: string[];
  storage_link?: string; // Link to the workflow file in storage
}

const STORAGE_KEY = "robot-behavior-workflows";
const USE_API = true; // Set to false to use local storage instead

export const useWorkflowManager = () => {
  const [workflows, setWorkflows] = useState<BehaviorWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    if (!USE_API) {
      // Fallback to local storage
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setWorkflows(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Failed to load workflows:", error);
        toast.error("Failed to load workflows");
      }
      return;
    }

    // Load from API
    try {
      setIsLoading(true);
      const workflowsFromAPI = await workflowApi.list();

      // Transform workflows to BehaviorWorkflow format
      const workflows = await Promise.all(
        workflowsFromAPI.map(async (workflow) => {
          try {
            // Fetch the workflow content from storage
            const content = await workflowApi.fetchWorkflowContent(
              workflow.storage_link
            );
            return {
              id: workflow.id,
              name: workflow.name,
              description: workflow.description,
              author: workflow.author,
              createdAt: new Date(workflow.created_at).toISOString(),
              nodes: content.nodes || [],
              edges: content.edges || [],
              tags: content.tags || [],
              storage_link: workflow.storage_link,
            };
          } catch (error) {
            console.error(
              `Failed to load workflow content for ${workflow.id}:`,
              error
            );
            // Return basic info even if content fetch fails
            return {
              id: workflow.id,
              name: workflow.name,
              description: workflow.description,
              author: workflow.author,
              createdAt: new Date(workflow.created_at).toISOString(),
              nodes: [],
              edges: [],
              tags: [],
              storage_link: workflow.storage_link,
            };
          }
        })
      );

      setWorkflows(workflows);
    } catch (error) {
      console.error("Failed to load workflows from API:", error);
      toast.error("Failed to load workflows from server");
    } finally {
      setIsLoading(false);
    }
  };

  const saveWorkflow = async (
    name: string,
    description: string,
    author: string,
    nodes: Node[],
    edges: Edge[],
    tags: string[] = []
  ) => {
    if (!USE_API) {
      // Fallback to local storage
      try {
        const newWorkflow: BehaviorWorkflow = {
          id: `workflow_${Date.now()}`,
          name,
          description,
          author,
          createdAt: new Date().toISOString(),
          nodes,
          edges,
          tags,
        };

        const updatedWorkflows = [...workflows, newWorkflow];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWorkflows));
        setWorkflows(updatedWorkflows);
        toast.success("Workflow saved successfully!");
        return newWorkflow;
      } catch (error) {
        console.error("Failed to save workflow:", error);
        toast.error("Failed to save workflow");
        return null;
      }
    }

    // Save via API
    try {
      setIsLoading(true);

      // Create a JSON file from the workflow data
      const workflowData = {
        name,
        description,
        author,
        nodes,
        edges,
        tags,
      };

      const blob = new Blob([JSON.stringify(workflowData, null, 2)], {
        type: "application/json",
      });
      const file = new File([blob], `${name.replace(/\s+/g, "_")}.json`, {
        type: "application/json",
      });

      // Upload to backend
      const workflow = await workflowApi.upload(file, {
        name,
        description,
        author,
      });

      const newWorkflow: BehaviorWorkflow = {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        author: workflow.author,
        createdAt: new Date(workflow.created_at).toISOString(),
        nodes,
        edges,
        tags,
        storage_link: workflow.storage_link,
      };

      setWorkflows([...workflows, newWorkflow]);
      toast.success("Workflow saved successfully!");
      return newWorkflow;
    } catch (error) {
      console.error("Failed to save workflow:", error);
      toast.error("Failed to save workflow to server");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWorkflow = async (id: string) => {
    if (!USE_API) {
      // Fallback to local storage
      try {
        const updatedWorkflows = workflows.filter((t) => t.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWorkflows));
        setWorkflows(updatedWorkflows);
        toast.success("Workflow deleted");
      } catch (error) {
        console.error("Failed to delete workflow:", error);
        toast.error("Failed to delete workflow");
      }
      return;
    }

    // Delete via API
    try {
      setIsLoading(true);
      await workflowApi.delete(id);
      const updatedWorkflows = workflows.filter((t) => t.id !== id);
      setWorkflows(updatedWorkflows);
      toast.success("Workflow deleted");
    } catch (error) {
      console.error("Failed to delete workflow:", error);
      toast.error("Failed to delete workflow from server");
    } finally {
      setIsLoading(false);
    }
  };

  const exportWorkflow = async (workflow: BehaviorWorkflow) => {
    try {
      let dataToExport = workflow;

      // If using API and workflow has a storage link, fetch fresh data from storage
      if (USE_API && workflow.storage_link) {
        try {
          const freshContent = await workflowApi.fetchWorkflowContent(
            workflow.storage_link
          );
          dataToExport = {
            ...workflow,
            nodes: freshContent.nodes || workflow.nodes,
            edges: freshContent.edges || workflow.edges,
            tags: freshContent.tags || workflow.tags,
          };
        } catch (error) {
          console.warn(
            "Failed to fetch from storage, using cached data:",
            error
          );
          // Fall back to in-memory data if fetch fails
        }
      }

      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
        dataStr
      )}`;
      const exportFileDefaultName = `${workflow.name.replace(
        /\s+/g,
        "_"
      )}_behavior.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
      toast.success("Workflow exported!");
    } catch (error) {
      console.error("Failed to export workflow:", error);
      toast.error("Failed to export workflow");
    }
  };

  const importWorkflow = async (
    file: File
  ): Promise<BehaviorWorkflow | null> => {
    if (!USE_API) {
      // Fallback to local storage
      return new Promise((resolve) => {
        try {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const workflow = JSON.parse(
                e.target?.result as string
              ) as BehaviorWorkflow;
              // Validate workflow structure
              if (!workflow.nodes || !workflow.edges || !workflow.name) {
                toast.error("Invalid workflow format");
                resolve(null);
                return;
              }
              // Add to workflows
              const updatedWorkflows = [
                ...workflows,
                { ...workflow, id: `workflow_${Date.now()}` },
              ];
              localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(updatedWorkflows)
              );
              setWorkflows(updatedWorkflows);
              toast.success("Workflow imported successfully!");
              resolve(workflow);
            } catch (error) {
              console.error("Failed to parse workflow:", error);
              toast.error("Invalid workflow file");
              resolve(null);
            }
          };
          reader.readAsText(file);
        } catch (error) {
          console.error("Failed to import workflow:", error);
          toast.error("Failed to import workflow");
          resolve(null);
        }
      });
    }

    // Import via API
    try {
      setIsLoading(true);

      // First, read the file to validate and extract metadata
      const fileContent = await file.text();
      const workflowData = JSON.parse(fileContent);

      // Validate workflow structure
      if (!workflowData.nodes || !workflowData.edges || !workflowData.name) {
        toast.error("Invalid workflow format");
        return null;
      }

      // Upload to backend
      const workflow = await workflowApi.upload(file, {
        name: workflowData.name,
        description: workflowData.description || "Imported workflow",
        author: workflowData.author || "Unknown",
      });

      const newWorkflow: BehaviorWorkflow = {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        author: workflow.author,
        createdAt: new Date(workflow.created_at).toISOString(),
        nodes: workflowData.nodes,
        edges: workflowData.edges,
        tags: workflowData.tags || [],
        storage_link: workflow.storage_link,
      };

      setWorkflows([...workflows, newWorkflow]);
      toast.success("Workflow imported successfully!");
      return newWorkflow;
    } catch (error) {
      console.error("Failed to import workflow:", error);
      toast.error("Failed to import workflow to server");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    workflows,
    saveWorkflow,
    deleteWorkflow,
    exportWorkflow,
    importWorkflow,
    loadWorkflows,
    isLoading,
  };
};

