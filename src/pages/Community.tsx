import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useWorkflowManager,
  type BehaviorWorkflow,
} from "@/hooks/useWorkflowManager";
import {
  Download,
  Upload,
  Search,
  FileJson,
  FolderUp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";

export default function Community() {
  const navigate = useNavigate();
  const { workflows, exportWorkflow, importWorkflow } = useWorkflowManager();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    setIsValidating(true);

    try {
      // Convert FileList to array
      const fileArray = Array.from(files);

      // Validate required files
      const workflowJsonFile = fileArray.find(
        (f) =>
          f.webkitRelativePath.endsWith("workflow.json") ||
          f.name === "workflow.json"
      );
      const toolsPyFile = fileArray.find(
        (f) =>
          f.webkitRelativePath.endsWith("tools.py") || f.name === "tools.py"
      );

      if (!workflowJsonFile) {
        toast.error("Missing workflow.json file");
        setIsValidating(false);
        setShowUploadDialog(false);
        event.target.value = "";
        return;
      }

      if (!toolsPyFile) {
        toast.error("Missing tools.py file");
        setIsValidating(false);
        setShowUploadDialog(false);
        event.target.value = "";
        return;
      }

      // Extract folder name from the first file's path
      const folderName = fileArray[0].webkitRelativePath.split("/")[0];

      toast.success(`Validation passed! Uploading ${folderName}...`);

      // Create a zip file containing all files
      const zip = new JSZip();
      const folder = zip.folder(folderName);

      for (const file of fileArray) {
        // Get the relative path within the folder
        const relativePath = file.webkitRelativePath
          .split("/")
          .slice(1)
          .join("/");
        const content = await file.arrayBuffer();
        folder?.file(relativePath, content);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipFile = new File([zipBlob], `${folderName}.zip`, {
        type: "application/zip",
      });

      // TODO: Upload to server - for now just import the workflow.json
      await importWorkflow(workflowJsonFile);

      setShowUploadDialog(false);
    } catch (error) {
      console.error("Failed to process folder:", error);
      toast.error("Failed to process workflow folder");
    } finally {
      setIsValidating(false);
      event.target.value = ""; // Reset input
    }
  };

  const handleLoadWorkflow = (workflow: BehaviorWorkflow) => {
    // Store selected workflow in sessionStorage to load in main page
    sessionStorage.setItem("loadWorkflow", JSON.stringify(workflow));
    navigate("/");
    toast.success(`Loading "${workflow.name}" behavior...`);
  };

  const handleExportAsFolder = async (workflow: BehaviorWorkflow) => {
    try {
      // Create a zip file with the workflow structure
      const zip = new JSZip();
      const folderName = workflow.name.replace(/\s+/g, "_");
      const folder = zip.folder(folderName);

      // Add workflow.json
      const workflowData = {
        name: workflow.name,
        description: workflow.description,
        author: workflow.author,
        nodes: workflow.nodes,
        edges: workflow.edges,
        tags: workflow.tags,
      };
      folder?.file("workflow.json", JSON.stringify(workflowData, null, 2));

      // Add placeholder tools.py
      const toolsPyContent = `# Tools for ${workflow.name}
# Add your custom tools here

def example_tool():
    """Example tool function"""
    pass
`;
      folder?.file("tools.py", toolsPyContent);

      // Generate zip and trigger download
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${folderName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Workflow folder downloaded!");
    } catch (error) {
      console.error("Failed to export workflow:", error);
      toast.error("Failed to export workflow");
    }
  };

  const allWorkflows = [...workflows];
  const filteredWorkflows = allWorkflows.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Behavior Community</h1>
            <p className="text-muted-foreground mt-2">
              Explore and upload workflows with the community
            </p>
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleImport}
              className="hidden"
              id="import-workflow"
              // @ts-expect-error - webkitdirectory is not in standard HTML input types
              webkitdirectory=""
              directory=""
              multiple
            />
            <Button variant="outline" onClick={() => setShowUploadDialog(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search workflows by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((workflow) => {
            return (
              <Card key={workflow.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {workflow.name}
                      </CardTitle>
                      <CardDescription>{workflow.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="text-muted-foreground">By:</span>{" "}
                      <span className="font-medium">{workflow.author}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Created:</span>{" "}
                      <span>
                        {new Date(workflow.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {workflow.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={() => handleLoadWorkflow(workflow)}
                  >
                    <FileJson className="w-4 h-4 mr-2" />
                    Load
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={async () => await handleExportAsFolder(workflow)}
                    title="Download workflow folder"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {filteredWorkflows.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No workflows found. Try adjusting your search or import a workflow
              to get started.
            </p>
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderUp className="w-5 h-5" />
              Upload Workflow Folder
            </DialogTitle>
            <DialogDescription>
              Upload a complete workflow folder with all required files
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your workflow folder must follow this structure:
              </AlertDescription>
            </Alert>

            <div className="bg-muted rounded-lg p-4 font-mono text-sm space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-blue-500">📁</span>
                <span className="font-semibold">workflow_name/</span>
              </div>
              <div className="flex items-center gap-2 ml-6">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="font-semibold text-green-600">
                  workflow.json
                </span>
                <span className="text-muted-foreground text-xs">
                  (required)
                </span>
              </div>
              <div className="flex items-center gap-2 ml-6">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="font-semibold text-green-600">tools.py</span>
                <span className="text-muted-foreground text-xs">
                  (required)
                </span>
              </div>
              <div className="flex items-center gap-2 ml-6 text-muted-foreground">
                <span>📄</span>
                <span>other files...</span>
                <span className="text-xs">(optional)</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Required Files:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">
                    workflow.json
                  </span>{" "}
                  - Contains the workflow configuration, nodes, and edges
                </li>
                <li>
                  <span className="font-medium text-foreground">tools.py</span>{" "}
                  - Python file with custom tools and functions for the workflow
                </li>
              </ul>
            </div>

            <Alert>
              <AlertDescription>
                The folder will be validated before upload. Make sure both
                required files are present.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setShowUploadDialog(false)}
              disabled={isValidating}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                fileInputRef.current?.click();
              }}
              disabled={isValidating}
            >
              {isValidating ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Validating...
                </>
              ) : (
                <>
                  <FolderUp className="w-4 h-4 mr-2" />
                  Select Folder
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
