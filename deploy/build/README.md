# Dark Souls II image build

The production release path uses GitHub Actions to submit a one-off Kaniko Job into the `webapp-build` namespace.

The canonical job definition lives in `.github/workflows/build-and-release.yml` so the exact commit SHA, image tag, and temporary source secret stay in one place.

Runtime path:

`GitHub Actions -> K8s build Job -> registry -> deploy/k8s/overlays/prod/kustomization.yaml newTag -> Argo CD auto-sync`
