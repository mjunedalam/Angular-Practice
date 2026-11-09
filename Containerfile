# Red Hat Hardened Image for nginx: minimal, no shell/package manager, runs as non-root (uid 65532) on 8080.
# No s2i here, so the built app is copied straight into nginx's web root.
FROM registry.access.redhat.com/hi/nginx:1.28@sha256:9b18b942be7f6a9b9b7a6e3302355149c4be90219f8ffbbcd79f56d91c54c456
COPY --chown=65532:0 dist/agwa/ /usr/share/nginx/html/
EXPOSE 8080
