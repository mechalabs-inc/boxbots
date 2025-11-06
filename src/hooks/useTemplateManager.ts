import { useState, useEffect } from "react";
import type { Node, Edge } from "reactflow";
import { toast } from "sonner";
import { workflowApi } from "@/lib/api";

export interface BehaviorTemplate {
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

const STORAGE_KEY = "robot-behavior-templates";
const USE_API = true; // Set to false to use local storage instead

export const useTemplateManager = () => {
  const [templates, setTemplates] = useState<BehaviorTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    if (!USE_API) {
      // Fallback to local storage
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setTemplates(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Failed to load templates:", error);
        toast.error("Failed to load templates");
      }
      return;
    }

    // Load from API
    try {
      setIsLoading(true);
      const workflows = await workflowApi.list();

      // Transform workflows to BehaviorTemplate format
      const templatesFromAPI = await Promise.all(
        workflows.map(async (workflow) => {
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

      setTemplates(templatesFromAPI);
    } catch (error) {
      console.error("Failed to load templates from API:", error);
      toast.error("Failed to load workflows from server");
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplate = async (
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
        const newTemplate: BehaviorTemplate = {
          id: `template_${Date.now()}`,
          name,
          description,
          author,
          createdAt: new Date().toISOString(),
          nodes,
          edges,
          tags,
        };

        const updatedTemplates = [...templates, newTemplate];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
        setTemplates(updatedTemplates);
        toast.success("Template saved successfully!");
        return newTemplate;
      } catch (error) {
        console.error("Failed to save template:", error);
        toast.error("Failed to save template");
        return null;
      }
    }

    // Save via API
    try {
      setIsLoading(true);

      // Create a JSON file from the template data
      const templateData = {
        name,
        description,
        author,
        nodes,
        edges,
        tags,
      };

      const blob = new Blob([JSON.stringify(templateData, null, 2)], {
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

      const newTemplate: BehaviorTemplate = {
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

      setTemplates([...templates, newTemplate]);
      toast.success("Template saved successfully!");
      return newTemplate;
    } catch (error) {
      console.error("Failed to save template:", error);
      toast.error("Failed to save template to server");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!USE_API) {
      // Fallback to local storage
      try {
        const updatedTemplates = templates.filter((t) => t.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
        setTemplates(updatedTemplates);
        toast.success("Template deleted");
      } catch (error) {
        console.error("Failed to delete template:", error);
        toast.error("Failed to delete template");
      }
      return;
    }

    // Delete via API
    try {
      setIsLoading(true);
      await workflowApi.delete(id);
      const updatedTemplates = templates.filter((t) => t.id !== id);
      setTemplates(updatedTemplates);
      toast.success("Template deleted");
    } catch (error) {
      console.error("Failed to delete template:", error);
      toast.error("Failed to delete template from server");
    } finally {
      setIsLoading(false);
    }
  };

  const exportTemplate = async (template: BehaviorTemplate) => {
    try {
      let dataToExport = template;

      // If using API and template has a storage link, fetch fresh data from storage
      if (USE_API && template.storage_link) {
        try {
          const freshContent = await workflowApi.fetchWorkflowContent(
            template.storage_link
          );
          dataToExport = {
            ...template,
            nodes: freshContent.nodes || template.nodes,
            edges: freshContent.edges || template.edges,
            tags: freshContent.tags || template.tags,
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
      const exportFileDefaultName = `${template.name.replace(
        /\s+/g,
        "_"
      )}_behavior.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
      toast.success("Template exported!");
    } catch (error) {
      console.error("Failed to export template:", error);
      toast.error("Failed to export template");
    }
  };

  const importTemplate = async (
    file: File
  ): Promise<BehaviorTemplate | null> => {
    if (!USE_API) {
      // Fallback to local storage
      return new Promise((resolve) => {
        try {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const template = JSON.parse(
                e.target?.result as string
              ) as BehaviorTemplate;
              // Validate template structure
              if (!template.nodes || !template.edges || !template.name) {
                toast.error("Invalid template format");
                resolve(null);
                return;
              }
              // Add to templates
              const updatedTemplates = [
                ...templates,
                { ...template, id: `template_${Date.now()}` },
              ];
              localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(updatedTemplates)
              );
              setTemplates(updatedTemplates);
              toast.success("Template imported successfully!");
              resolve(template);
            } catch (error) {
              console.error("Failed to parse template:", error);
              toast.error("Invalid template file");
              resolve(null);
            }
          };
          reader.readAsText(file);
        } catch (error) {
          console.error("Failed to import template:", error);
          toast.error("Failed to import template");
          resolve(null);
        }
      });
    }

    // Import via API
    try {
      setIsLoading(true);

      // First, read the file to validate and extract metadata
      const fileContent = await file.text();
      const templateData = JSON.parse(fileContent);

      // Validate template structure
      if (!templateData.nodes || !templateData.edges || !templateData.name) {
        toast.error("Invalid template format");
        return null;
      }

      // Upload to backend
      const workflow = await workflowApi.upload(file, {
        name: templateData.name,
        description: templateData.description || "Imported workflow",
        author: templateData.author || "Unknown",
      });

      const newTemplate: BehaviorTemplate = {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        author: workflow.author,
        createdAt: new Date(workflow.created_at).toISOString(),
        nodes: templateData.nodes,
        edges: templateData.edges,
        tags: templateData.tags || [],
        storage_link: workflow.storage_link,
      };

      setTemplates([...templates, newTemplate]);
      toast.success("Template imported successfully!");
      return newTemplate;
    } catch (error) {
      console.error("Failed to import template:", error);
      toast.error("Failed to import template to server");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    templates,
    saveTemplate,
    deleteTemplate,
    exportTemplate,
    importTemplate,
    loadTemplates,
    isLoading,
  };
};
