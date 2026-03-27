# Verifactu API - Uso end to end

## Variables de entorno

En `apps/verifactu-api/.env` (puedes copiar de `apps/verifactu-api/env.example`):

```env
VERIFACTU_DATABASE_URL="postgresql://postgres:postgres@localhost:5437/verifactu_db?schema=public"
VERIFACTU_PORT=3100
VERIFACTU_MODE=mock
VERIFACTU_REQUIRE_API_KEY=true
VERIFACTU_API_KEY=vf_dev_josanz_key
VERIFACTU_API_URL=http://localhost:3100/api
VERIFACTU_AEAT_ENDPOINT=https://prewww2.aeat.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/VerifactuSOAP
VERIFACTU_AEAT_WSDL_URL=https://prewww2.aeat.es/static_files/common/internet/dep/aplicaciones/es/aeat/tikeV1.0/cont/ws/SistemaFacturacion.wsdl
```

## Arranque DB Verifactu (Docker dedicado)

```sh
npm run verifactu:db:up
npm run verifactu:db:push
npm run verifactu:db:seed
```

## Arranque apps

```sh
npx nx run verifactu-api:serve
npx nx run backend:serve
```

## Swagger

- Verifactu API docs: `http://localhost:3100/api/docs`

## cURL de prueba

### 1) Enviar factura a Verifactu API

```sh
curl -X POST "http://localhost:3100/api/verifactu/submit" ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: vf_dev_josanz_key" ^
  -d "{\"invoiceId\":\"<INVOICE_UUID>\",\"tenantId\":\"<TENANT_UUID>\"}"
```

### 2) Encolar factura y procesar cola

```sh
curl -X POST "http://localhost:3100/api/verifactu/queue/enqueue" ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: vf_dev_josanz_key" ^
  -d "{\"invoiceId\":\"<INVOICE_UUID>\",\"tenantId\":\"<TENANT_UUID>\"}"
```

```sh
curl -X POST "http://localhost:3100/api/verifactu/queue/process?limit=20" ^
  -H "x-api-key: vf_dev_josanz_key"
```

### 3) CRUD Webhooks

```sh
curl -X POST "http://localhost:3100/api/verifactu/webhooks" ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: vf_dev_josanz_key" ^
  -d "{\"tenantId\":\"<TENANT_UUID>\",\"eventType\":\"invoice.sent\",\"url\":\"https://webhook.site/xxxx\",\"secret\":\"supersecret\"}"
```

```sh
curl "http://localhost:3100/api/verifactu/webhooks/<TENANT_UUID>" ^
  -H "x-api-key: vf_dev_josanz_key"
```

### 4) Customers y Series

```sh
curl -X POST "http://localhost:3100/api/verifactu/customers" ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: vf_dev_josanz_key" ^
  -d "{\"tenantId\":\"<TENANT_UUID>\",\"taxId\":\"B12345678\",\"name\":\"Cliente Demo\",\"email\":\"cliente@demo.com\",\"countryCode\":\"ES\"}"
```

```sh
curl -X POST "http://localhost:3100/api/verifactu/series" ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: vf_dev_josanz_key" ^
  -d "{\"tenantId\":\"<TENANT_UUID>\",\"code\":\"A\",\"description\":\"Serie principal\"}"
```

### 5) Compliance y Record Query

```sh
curl "http://localhost:3100/api/verifactu/compliance/summary/<TENANT_UUID>" ^
  -H "x-api-key: vf_dev_josanz_key"
```

```sh
curl "http://localhost:3100/api/verifactu/records/<TENANT_UUID>?status=SENT" ^
  -H "x-api-key: vf_dev_josanz_key"
```

### 6) Llamada desde ERP hacia Verifactu (adapter HTTP)

```sh
curl -X PATCH "http://localhost:3000/api/billing/invoices/<INVOICE_UUID>/verifactu-submit" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer <JWT_BACKEND>" ^
  -d "{\"tenantId\":\"<TENANT_UUID>\"}"
```

