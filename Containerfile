# Pin the multi-arch INDEX digest (not a per-arch one): the old pin was the arm64 image, which crashed on amd64 OpenShift nodes with "Exec format error".
# Red Hat Hardened Image for nginx: minimal, no shell/package manager, runs as non-root (uid 65532) on 8080.
# No s2i here, so the built app is copied straight into nginx's web root.
FROM registry.access.redhat.com/hi/nginx:1.28@sha256:6174f18fe74728fca3b281993e71d804338daa2116425eb210bc143e087ccddc
COPY --chown=65532:0 dist/agwa/ /usr/share/nginx/html/
EXPOSE 8080
