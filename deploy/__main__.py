"""Pulumi deploy for vap-ui — Cloud Run service."""

import pulumi
import pulumi_gcp as gcp

config = pulumi.Config()
project_id = config.require("project_id")
region = config.get("region") or "us-central1"
image_tag = config.get("image_tag") or "latest"

infra = pulumi.StackReference("organization/infra/dev")
vpc_connector_id = infra.get_output("vpc_connector_id")
vap_ui_sa_email = infra.get_output("sa_vap_ui")

mcp_server_url = "https://mcp-variant-server-fno64g2krq-uc.a.run.app"
agent_service_url = "https://agent-service-fno64g2krq-uc.a.run.app"
workflow_service_url = "https://workflow-service-fno64g2krq-uc.a.run.app"

image = f"{region}-docker.pkg.dev/{project_id}/genomic-pipeline/vap-ui:{image_tag}"

service = gcp.cloudrunv2.Service(
    "vap-ui",
    name="vap-ui",
    project=project_id,
    location=region,
    ingress="INGRESS_TRAFFIC_INTERNAL_ONLY",
    template=gcp.cloudrunv2.ServiceTemplateArgs(
        service_account=vap_ui_sa_email,
        scaling=gcp.cloudrunv2.ServiceTemplateScalingArgs(
            min_instance_count=0,
            max_instance_count=3,
        ),
        vpc_access=gcp.cloudrunv2.ServiceTemplateVpcAccessArgs(
            connector=vpc_connector_id,
            egress="ALL_TRAFFIC",
        ),
        timeout="60s",
        containers=[
            gcp.cloudrunv2.ServiceTemplateContainerArgs(
                image=image,
                resources=gcp.cloudrunv2.ServiceTemplateContainerResourcesArgs(
                    limits={"cpu": "1000m", "memory": "512Mi"},
                ),
                envs=[
                    gcp.cloudrunv2.ServiceTemplateContainerEnvArgs(
                        name="MCP_SERVER_URL", value=mcp_server_url
                    ),
                    gcp.cloudrunv2.ServiceTemplateContainerEnvArgs(
                        name="AGENT_SERVICE_URL", value=agent_service_url
                    ),
                    gcp.cloudrunv2.ServiceTemplateContainerEnvArgs(
                        name="WORKFLOW_SERVICE_URL", value=workflow_service_url
                    ),
                ],
                liveness_probe=gcp.cloudrunv2.ServiceTemplateContainerLivenessProbeArgs(
                    http_get=gcp.cloudrunv2.ServiceTemplateContainerLivenessProbeHttpGetArgs(
                        path="/",
                    ),
                    initial_delay_seconds=15,
                    period_seconds=30,
                    timeout_seconds=5,
                    failure_threshold=3,
                ),
            )
        ],
    ),
)

# Allow unauthenticated invocation — VPN/internal ingress is the security boundary
gcp.cloudrun.IamMember(
    "vap-ui-public",
    project=project_id,
    location=region,
    service=service.name,
    role="roles/run.invoker",
    member="allUsers",
)

pulumi.export("vap_ui_name", service.name)
pulumi.export("vap_ui_uri", service.uri)
