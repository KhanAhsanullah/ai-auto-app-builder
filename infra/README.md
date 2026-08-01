# Infrastructure

Infrastructure as Code (IaC) and deployment configurations.

## Structure

| Path                        | Responsibility                                  |
| --------------------------- | ----------------------------------------------- |
| [terraform/](./terraform)   | Cloud resource provisioning (VPC, RDS, S3, CDN) |
| [kubernetes/](./kubernetes) | K8s manifests, Helm charts, service definitions |
| [docker/](./docker)         | Dockerfiles and compose files for local dev     |

## Environments

Infrastructure supports multi-environment deployment:

- **Development** — local Docker Compose stack
- **Staging** — pre-production validation
- **Production** — multi-region, auto-scaling

## Status

Foundation scaffold — IaC definitions in future sprints.
