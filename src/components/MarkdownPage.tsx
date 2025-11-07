import { useEffect, useState } from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";

const GITHUB_REPO_BASE =
  "https://raw.githubusercontent.com/humancomputerlab/boxbots-lelamp/main/";

// Mapping from markdown filenames to routes
const markdownToRoute: Record<string, string> = {
  "0.%20Prerequisites.md": "/documentation/prerequisites",
  "1.%20Components%20Overview.md": "/documentation/3d-print",
  "1.%203D%20Print.md": "/documentation/3d-print",
  "2.%20Servos%20Setup.md": "/documentation/servos-setup",
  "3.%20LeLamp%20Assembly.md": "/documentation/lelamp-assembly",
  "4.%20LeLamp%20Setup.md": "/documentation/lelamp-setup",
  "5.%20LeLamp%20Control.md": "/documentation/lelamp-control",
  "6.%20Common%20Issues.md": "/documentation/common-issues",
  "Motion%20layer.md": "/motion-layer",
  "Workflows.md": "/workflow-info",
  "README.md": "/",
};

interface MarkdownPageProps {
  markdownPath: string;
}

export const MarkdownPage = ({ markdownPath }: MarkdownPageProps) => {
  const [markdown, setMarkdown] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        setLoading(true);
        const url = markdownPath.startsWith("http")
          ? markdownPath
          : `${GITHUB_REPO_BASE}${markdownPath}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const text = await response.text();
        setMarkdown(text);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load content");
        console.error("Error fetching markdown:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkdown();
  }, [markdownPath]);

  // Get the directory of the markdown file for resolving relative image paths
  const markdownDir = markdownPath.includes("/")
    ? markdownPath.substring(0, markdownPath.lastIndexOf("/") + 1)
    : "";

  return (
    <MarkdownRenderer
      markdown={markdown}
      baseUrl={GITHUB_REPO_BASE}
      markdownDir={markdownDir}
      markdownToRoute={markdownToRoute}
      loading={loading}
      error={error}
    />
  );
};
