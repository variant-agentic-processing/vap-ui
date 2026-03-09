import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    const workflowUrl = process.env.WORKFLOW_SERVICE_URL ?? "http://localhost:8080";
    const agentUrl = process.env.AGENT_SERVICE_URL ?? "http://localhost:8081";
    return [
      {
        source: "/api/workflow/:path*",
        destination: `${workflowUrl}/:path*`,
      },
      {
        source: "/api/agent/:path*",
        destination: `${agentUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
