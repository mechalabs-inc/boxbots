// API client for backend communication
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export interface Workflow {
  id: string;
  name: string;
  description: string;
  author: string;
  storage_link: string;
  created_at: Date;
}

export interface CreateWorkflowDTO {
  name: string;
  description: string;
  author: string;
  storage_link: string;
}

export const workflowApi = {
  // List all workflows
  async list(): Promise<Workflow[]> {
    const response = await fetch(`${API_URL}/api/workflows`);
    if (!response.ok) {
      throw new Error("Failed to fetch workflows");
    }
    return response.json();
  },

  // Get a specific workflow
  async get(id: string): Promise<Workflow> {
    const response = await fetch(`${API_URL}/api/workflows/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch workflow");
    }
    return response.json();
  },

  // Upload a workflow file
  async upload(
    file: File,
    metadata: { name: string; description: string; author: string }
  ): Promise<Workflow> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", metadata.name);
    formData.append("description", metadata.description);
    formData.append("author", metadata.author);

    const response = await fetch(`${API_URL}/api/workflows/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload workflow");
    }

    return response.json();
  },

  // Upload a complete workflow folder as a zip file
  async uploadFolder(
    zipFile: File,
    metadata: { 
      name: string; 
      description: string; 
      author: string;
      folderName: string;
    }
  ): Promise<Workflow & { uploaded_files?: { [filename: string]: string } }> {
    const formData = new FormData();
    formData.append("file", zipFile);
    formData.append("name", metadata.name);
    formData.append("description", metadata.description);
    formData.append("author", metadata.author);
    formData.append("folderName", metadata.folderName);

    const response = await fetch(`${API_URL}/api/workflows/upload-folder`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload workflow folder");
    }

    return response.json();
  },

  // Create a workflow with existing storage link
  async create(data: CreateWorkflowDTO): Promise<Workflow> {
    const response = await fetch(`${API_URL}/api/workflows`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create workflow");
    }

    return response.json();
  },

  // Update a workflow
  async update(id: string, data: Partial<CreateWorkflowDTO>): Promise<Workflow> {
    const response = await fetch(`${API_URL}/api/workflows/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to update workflow");
    }

    return response.json();
  },

  // Delete a workflow
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/workflows/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete workflow");
    }
  },

  // Fetch workflow file content from storage link
  // Note: storage_link now points to folder, so we use the content endpoint
  async fetchWorkflowContent(storageLink: string, workflowId?: string): Promise<any> {
    // If workflowId is provided, use the content endpoint
    if (workflowId) {
      const response = await fetch(`${API_URL}/api/workflows/${workflowId}/content`);
      if (!response.ok) {
        throw new Error("Failed to fetch workflow content");
      }
      return response.json();
    }
    
    // Fallback: try to fetch directly from storage link (for backwards compatibility)
    const response = await fetch(storageLink);
    if (!response.ok) {
      throw new Error("Failed to fetch workflow content");
    }
    return response.json();
  },

  // Download workflow folder as zip from GCP
  async downloadFolder(id: string): Promise<Blob> {
    const response = await fetch(`${API_URL}/api/workflows/${id}/download`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to download workflow folder");
    }
    return response.blob();
  },
};


