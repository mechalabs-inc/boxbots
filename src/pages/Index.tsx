import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Viewer3D } from "@/components/Viewer3D";
import { ModeTabs } from "@/components/ModeTabs";
import { NodeGraph } from "@/components/NodeGraph";
import type { Node, Edge } from "reactflow";
import { toast } from "sonner";

interface MeshFiles {
  [key: string]: Blob;
}

const Index = () => {
  const [urdfFile, setUrdfFile] = useState<File | null>(null);
  const [meshFiles, setMeshFiles] = useState<MeshFiles>({});
  const [selectedJoint, setSelectedJoint] = useState<string | null>(null);
  const [jointValues, setJointValues] = useState<Record<string, number>>({});
  const [availableJoints, setAvailableJoints] = useState<string[]>([]);
  const [csvNodes, setCsvNodes] = useState<Node[]>([]);
  const [csvEdges, setCsvEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load robot files on mount
  useEffect(() => {
    const loadRobotFiles = async () => {
      try {
        setIsLoading(true);

        // Load URDF file using Vite's import
        const urdfModule = await import("@/robot/robot.urdf?raw");
        const urdfBlob = new Blob([urdfModule.default], {
          type: "application/xml",
        });
        const urdfFile = new File([urdfBlob], "robot.urdf", {
          type: "application/xml",
        });
        setUrdfFile(urdfFile);

        // Dynamically load all mesh files from robot/assets folder using Vite's glob import
        const meshModules = import.meta.glob("@/robot/assets/*.stl", {
          as: "url",
          eager: true,
        });

        const meshes: MeshFiles = {};
        let loadedCount = 0;

        // Fetch each mesh file and convert to Blob
        for (const [path, url] of Object.entries(meshModules)) {
          const filename = path.split("/").pop() || "";
          if (filename) {
            try {
              const response = await fetch(url as string);
              if (response.ok) {
                const blob = await response.blob();
                meshes[filename] = blob;
                // Also store with full path for compatibility
                meshes[`assets/${filename}`] = blob;
                // Also store with /assets/ prefix for URDF loader
                meshes[`/assets/${filename}`] = blob;
                loadedCount++;
              }
            } catch (err) {
              console.warn(`Failed to load mesh: ${filename}`, err);
            }
          }
        }

        console.log(`Loaded ${loadedCount} mesh files:`, Object.keys(meshes));
        setMeshFiles(meshes);
      } catch (error) {
        console.error("Error loading robot files:", error);
        toast.error("Failed to load robot files");
      } finally {
        setIsLoading(false);
      }
    };

    loadRobotFiles();
  }, []);

  const handleJointChange = (jointName: string, value: number) => {
    setJointValues((prev) => ({
      ...prev,
      [jointName]: value,
    }));
  };

  const handleCsvNodesGenerated = (nodes: Node[], edges: Edge[]) => {
    setCsvNodes(nodes);
    setCsvEdges(edges);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar isLoading={isLoading} />

      <main className="flex-1 flex flex-col p-6 overflow-hidden gap-3">
        {/* 3D Viewer - Equal height */}
        <div className="flex-1 min-h-0">
          <Viewer3D
            urdfFile={urdfFile}
            initialMeshFiles={meshFiles}
            selectedJoint={selectedJoint}
            jointValues={jointValues}
            onJointSelect={setSelectedJoint}
            onJointChange={handleJointChange}
            onRobotJointsLoaded={(joints, angles) => {
              setAvailableJoints(joints);
              setJointValues(angles);
              if (!selectedJoint && joints.length > 0)
                setSelectedJoint(joints[0]);
            }}
            onCsvNodesGenerated={handleCsvNodesGenerated}
          />
        </div>

        {/* Mode Tabs */}
        <div className="flex-shrink-0">
          <ModeTabs />
        </div>

        {/* Node Graph - Equal height */}
        <div className="flex-1 min-h-0 panel overflow-hidden">
          <NodeGraph
            selectedJoint={selectedJoint}
            onJointChange={handleJointChange}
            jointValues={jointValues}
            onSelectJoint={setSelectedJoint}
            availableJoints={availableJoints}
            initialCsvNodes={csvNodes}
            initialCsvEdges={csvEdges}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
