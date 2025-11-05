import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { Link } from "react-router-dom";

const GITHUB_REPO_BASE =
  "https://raw.githubusercontent.com/humancomputerlab/boxbots-lelamp/main/";

interface MarkdownRendererProps {
  markdown: string;
  baseUrl?: string;
  markdownDir?: string;
  markdownToRoute?: Record<string, string>;
  loading?: boolean;
  error?: string | null;
}

export const MarkdownRenderer = ({
  markdown,
  baseUrl = GITHUB_REPO_BASE,
  markdownDir = "",
  markdownToRoute = {},
  loading = false,
  error = null,
}: MarkdownRendererProps) => {
  // Transform image sources to use GitHub raw URLs
  const transformImageSrc = (src: string): string => {
    // If it's already a full URL, return as is
    if (src.startsWith("http://") || src.startsWith("https://")) {
      return src;
    }
    // Handle relative paths starting with ./
    let resolvedSrc = src;
    if (src.startsWith("./")) {
      // Remove ./ and prepend the markdown file's directory
      resolvedSrc = markdownDir + src.slice(2);
    } else if (!src.startsWith("/") && markdownDir) {
      // If it's a relative path without ./, prepend the markdown file's directory
      resolvedSrc = markdownDir + src;
    } else if (src.startsWith("/")) {
      // Remove leading slash
      resolvedSrc = src.slice(1);
    }
    // Return GitHub raw URL
    return `${baseUrl}${resolvedSrc}`;
  };

  // Transform markdown file links to internal routes
  const transformLink = (
    href: string | null | undefined
  ): { to?: string; href?: string; isExternal: boolean } => {
    if (!href) {
      return { href: "#", isExternal: false };
    }

    // If it's already a full URL, return as is
    if (href.startsWith("http://") || href.startsWith("https://")) {
      return { href, isExternal: true };
    }

    // Handle anchors (e.g., #section or ./file.md#section)
    const [pathPart, anchor] = href.split("#");
    const anchorSuffix = anchor ? `#${anchor}` : "";

    // Handle relative markdown links (e.g., ./0.%20Prerequisites.md)
    let resolvedHref = pathPart;
    if (pathPart.startsWith("./")) {
      // Remove ./ and prepend the markdown file's directory
      resolvedHref = markdownDir + pathPart.slice(2);
    } else if (!pathPart.startsWith("/") && markdownDir) {
      // If it's a relative path without ./, prepend the markdown file's directory
      resolvedHref = markdownDir + pathPart;
    } else if (pathPart.startsWith("/")) {
      // Remove leading slash
      resolvedHref = pathPart.slice(1);
    }

    // Check if it's a markdown file link
    const markdownFilename = resolvedHref.split("/").pop() || resolvedHref;
    // Remove any query parameters from filename
    const cleanFilename = markdownFilename.split("?")[0];
    if (markdownToRoute[cleanFilename]) {
      return {
        to: markdownToRoute[cleanFilename] + anchorSuffix,
        isExternal: false,
      };
    }

    // If it's a GitHub link, convert to external
    if (resolvedHref.includes("github.com")) {
      return {
        href: `https://${resolvedHref}${anchorSuffix}`,
        isExternal: true,
      };
    }

    // Default: treat as external or relative path
    return {
      href: resolvedHref + anchorSuffix,
      isExternal: !resolvedHref.startsWith("/"),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-destructive text-xl mb-2">⚠️ Error</div>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h1:text-4xl prose-h1:mb-6 prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3 prose-p:leading-relaxed prose-p:text-foreground prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-a:font-medium prose-strong:font-semibold prose-strong:text-foreground prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-foreground prose-code:before:content-[''] prose-code:after:content-[''] prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:text-foreground dark:prose-pre:text-foreground prose-img:rounded-lg prose-img:shadow-lg prose-img:my-8 prose-img:mx-auto prose-ul:list-disc prose-ol:list-decimal prose-li:my-2 prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            components={{
              img: ({ src, alt }) => (
                <img
                  src={transformImageSrc(src || "")}
                  alt={alt}
                  className="rounded-lg shadow-lg my-8 mx-auto max-w-full h-auto"
                  loading="lazy"
                />
              ),
              a: ({ href, children }) => {
                const linkInfo = transformLink(href);

                if (linkInfo.to) {
                  // Internal route - use React Router Link
                  return (
                    <Link
                      to={linkInfo.to}
                      className="text-accent no-underline font-medium hover:underline transition-colors"
                    >
                      {children}
                    </Link>
                  );
                }

                // External link
                return (
                  <a
                    href={linkInfo.href}
                    target={linkInfo.isExternal ? "_blank" : undefined}
                    rel={
                      linkInfo.isExternal ? "noopener noreferrer" : undefined
                    }
                    className="text-accent no-underline font-medium hover:underline transition-colors"
                  >
                    {children}
                  </a>
                );
              },
              code: ({ className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || "");
                const isInline = !match;
                return isInline ? (
                  <code
                    className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground"
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <code className={`${className} text-foreground`} {...props}>
                    {children}
                  </code>
                );
              },
              pre: ({ children, ...props }) => (
                <pre
                  className="bg-muted border border-border rounded-lg text-foreground dark:text-foreground [&>code]:text-foreground [&>code]:dark:text-foreground"
                  {...props}
                >
                  {children}
                </pre>
              ),
            }}
          >
            {markdown}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
};
