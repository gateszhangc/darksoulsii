# Dark Souls II deployment

This project deploys through the Argo/Kubernetes release path. It does not use Dokploy.

## Mapping

- GitHub repository: `gateszhangc/darksoulsii`
- Git branch: `main`
- Image repository: `registry.144.91.77.245.sslip.io/darksoulsii`
- K8s manifest path: `deploy/k8s/overlays/prod`
- Argo CD application: `darksoulsii`
- Argo platform repo: `n/a`
- Primary domain: `https://darksoulsii.lol/`
- Dokploy project: `n/a`

Route:

`gateszhangc/darksoulsii -> main -> registry.144.91.77.245.sslip.io/darksoulsii -> deploy/k8s/overlays/prod -> darksoulsii`

## Release Flow

1. GitHub Actions runs browser tests and renders the production Kustomize overlay.
2. GitHub Actions creates a Kubernetes build Job in `webapp-build`.
3. The build Job clones the exact commit, builds with Kaniko, and pushes `registry.144.91.77.245.sslip.io/darksoulsii:<git-sha>`.
4. GitHub Actions updates `deploy/k8s/overlays/prod/kustomization.yaml` `newTag` to the same Git SHA and pushes a `[skip ci]` commit.
5. Argo CD syncs `darksoulsii` automatically from `deploy/k8s/overlays/prod`.

## DNS And Search

- DNS is managed in Cloudflare for `darksoulsii.lol`.
- Apex `A` record points to `144.91.77.245`.
- `www` is a `CNAME` to `darksoulsii.lol`.
- The ingress redirects `www` to apex and forces HTTPS.
- Google Search Console uses the domain property `sc-domain:darksoulsii.lol`.
- Google account: `gateszhang92@gmail.com`
- `https://darksoulsii.lol/sitemap.xml` must be submitted to GSC.
- GA4 and Microsoft Clarity are intentionally disabled.
- Cloudflare DNS verification is the source of truth for the GSC domain property.

## Validation

Local:

```bash
npm ci
npm test
docker build -t darksoulsii:local .
kubectl kustomize deploy/k8s/overlays/prod >/tmp/darksoulsii-rendered.yaml
```

Production:

```bash
kubectl apply -f deploy/argocd/appproject.yaml
kubectl apply -f deploy/argocd/application.yaml
kubectl -n argocd get application darksoulsii
curl -I https://darksoulsii.lol/
curl -I https://www.darksoulsii.lol/
curl -I https://darksoulsii.lol/sitemap.xml
```

GSC:

```bash
export PRIMARY_URL=https://darksoulsii.lol
export GSC_PROPERTY_TYPE=domain
export SKIP_GA4=true
export SKIP_CLARITY=true
bash "$HOME/.codex/skills/webapp-launch-analytics/scripts/check-gsc-property.sh" "$PRIMARY_URL"
```

## Rollback

Set `deploy/k8s/overlays/prod/kustomization.yaml` `newTag` to a previous working Git SHA, commit with `[skip ci]`, and push to `main`. Argo CD will sync the previous image tag automatically.
