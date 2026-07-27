# Gestão+

Aplicação PWA de arquivo de faturas e finanças pessoais para Angola. O frontend React e o backend REST são independentes e não dependem de serviços proprietários para autenticação, dados, OCR, armazenamento ou IA.

## Arquitetura

- `src/components` e `src/pages`: interface React.
- `src/types`: modelos e contratos TypeScript.
- `src/validation`: validações sem dependências de UI.
- `src/lib/business`: regras de negócio puras.
- `src/services`: HTTP, JWT, autenticação, ficheiros, OCR e IA.
- `src/repositories`: acesso tipado aos recursos REST.
- `src/server`: API REST Node independente, com JWT Bearer e persistência JSON para desenvolvimento.

O frontend comunica exclusivamente com `VITE_API_URL`. O ficheiro `src/api/base44Client.js` é apenas uma ponte temporária de compatibilidade para ecrãs existentes; não importa nem executa qualquer SDK proprietário.

## Requisitos

- Node.js 20 ou superior
- npm 10 ou superior

## Instalação

```bash
git clone <URL_DO_REPOSITORIO>
cd gestao-plus
npm install
```

Cria `.env.local` na raiz:

```env
VITE_API_URL=http://localhost:8787/api
VITE_GOOGLE_AUTH_URL=
VITE_REQUEST_TIMEOUT_MS=20000
```

Configura o backend no ambiente do sistema ou num ficheiro carregado pelo teu provedor:

```env
API_PORT=8787
PUBLIC_API_URL=http://localhost:8787
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=substituir-por-um-segredo-longo-e-aleatorio
DATA_FILE=.data/gestao.json
UPLOAD_DIR=.data/uploads
EXTERNAL_SERVICES_URL=https://servicos.exemplo.ao
EXTERNAL_SERVICES_KEY=chave-do-agregador
```

`EXTERNAL_SERVICES_URL` deve expor os endpoints `/ocr/invoices`, `/ai/complete`, `/email/password-reset` e `/actions/:name`. Assim, cada fornecedor pode ser trocado sem alterar componentes React.

## Desenvolvimento local

```bash
npm run dev
```

Este comando inicia a API em `http://localhost:8787` e o Vite em `http://localhost:5173`.

Comandos separados:

```bash
npm run dev:api
npm run dev:frontend
npm run build
npm run preview
```

A primeira conta criada recebe o papel `admin`; as seguintes recebem `user`. O token JWT é enviado em `Authorization: Bearer <token>`.

## Contrato REST

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET|PATCH /api/auth/me`
- `POST /api/auth/password/request`
- `POST /api/auth/password/reset`
- `GET|POST|DELETE /api/resources/:resource`
- `GET|PATCH|DELETE /api/resources/:resource/:id`
- `POST /api/files`
- `POST /api/ocr/invoices`
- `POST /api/ai/complete`
- `POST /api/actions/:name`
- `GET /api/health`

Filtros usam JSON no parâmetro `filter`; ordenação usa `sort=-created_date`; `limit` restringe resultados. Todos os dados de utilizadores comuns são isolados por `owner_id` no servidor.

## Deploy fora da plataforma

### Frontend

1. Define `VITE_API_URL` com o URL público da API.
2. Executa `npm run build`.
3. Publica a pasta `dist` em Netlify, Vercel, Cloudflare Pages, S3/CloudFront ou Nginx.
4. Configura fallback de SPA para `index.html`.

### Backend

1. Publica o repositório num serviço Node (Railway, Render, Fly.io, VPS ou contentor).
2. Usa `node src/server/server.mjs` como comando de arranque.
3. Define `JWT_SECRET`, `CORS_ORIGIN`, `PUBLIC_API_URL` e as variáveis dos serviços externos.
4. Monta armazenamento persistente para `.data` ou substitui o repositório por PostgreSQL mantendo `IRepository`.
5. Coloca a API atrás de HTTPS e de um proxy reverso.

Para produção com várias instâncias, substitui a persistência JSON por PostgreSQL e o armazenamento local por S3 compatível. A camada de repositórios permite essa troca sem alterar a UI.

## Segurança

- Nunca expor `JWT_SECRET` ou chaves de fornecedores em variáveis `VITE_*`.
- Usar HTTPS em produção.
- Restringir `CORS_ORIGIN` ao domínio do frontend.
- Rodar chaves e fazer cópias de segurança do armazenamento.
- O servidor valida o JWT e aplica isolamento por utilizador em todas as operações de dados.