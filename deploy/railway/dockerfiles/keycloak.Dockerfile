# Railway service: Keycloak IdP (OIDC)
FROM quay.io/keycloak/keycloak:24.0.2 AS builder

WORKDIR /opt/keycloak

COPY docker/keycloak/realms /opt/keycloak/data/import
COPY docker/keycloak/themes /opt/keycloak/themes

ENV KC_DB=postgres
RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:24.0.2

COPY --from=builder /opt/keycloak/ /opt/keycloak/
COPY docker/keycloak/realms /opt/keycloak/data/import
COPY docker/keycloak/themes /opt/keycloak/themes

ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true

EXPOSE 8080

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--import-realm", "--optimized"]
