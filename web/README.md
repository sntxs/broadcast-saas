# Broadcast SaaS

Projeto prático desenvolvido para o teste de **Desenvolvedor Full Stack**.

O sistema simula uma plataforma SaaS de broadcast, onde cada cliente possui sua própria área para gerenciar conexões, contatos e mensagens. A proposta é representar uma base simples de uma ferramenta de disparo/agendamento de mensagens, sem realizar envio real para terceiros.

---

## Link do projeto

A aplicação está disponível em:

```txt
https://broadcast-saas-605c3.web.app/login
```

---

## Tecnologias utilizadas

- React
- TypeScript
- Vite
- Firebase Authentication
- Firebase Firestore
- Firebase Hosting
- Material UI
- TailwindCSS
- Firebase Cloud Functions

---

## Funcionalidades implementadas

- Cadastro e login com Firebase Authentication
- Rotas protegidas
- Dashboard administrativo
- CRUD de conexões
- CRUD de contatos
- CRUD de mensagens
- Seleção de contatos para mensagem
- Envio fake de mensagem
- Agendamento de mensagem
- Filtro de mensagens por status:
  - Todas
  - Enviadas
  - Agendadas
- Atualização em tempo real com Firestore
- Separação de dados por cliente usando `clientId`
- Regras de segurança do Firestore
- Deploy no Firebase Hosting

---

## Como o sistema funciona

Cada usuário cadastrado representa um cliente dentro do sistema.

Após fazer login, o cliente pode:

1. Criar conexões.
2. Cadastrar contatos dentro de uma conexão.
3. Criar mensagens para contatos específicos.
4. Enviar uma mensagem fake imediatamente.
5. Agendar uma mensagem para um horário futuro.
6. Acompanhar mensagens enviadas e agendadas.

Os dados são separados por usuário através do campo `clientId`, utilizando o `uid` do Firebase Authentication.

---

## Estrutura do projeto

```txt
broadcast-saas/
  web/        # Frontend da aplicação
  functions/  # Cloud Functions
```

Estrutura principal do frontend:

```txt
web/src/
  components/
  contexts/
  firebase/
  layouts/
  pages/
  routes/
  services/
```

A comunicação com o Firestore foi separada em arquivos de serviço, como:

```txt
services/connectionsService.ts
services/contactsService.ts
services/messagesService.ts
```

---

## Modelagem do Firestore

O projeto não utiliza subcoleções, conforme solicitado no desafio.

As principais coleções são:

```txt
clients
connections
contacts
messages
```

Exemplo de relacionamento:

```txt
clients/{uid}

connections
  clientId

contacts
  clientId
  connectionId

messages
  clientId
  connectionId
  contactIds
  status
  scheduledAt
  sentAt
```

---

## Observação sobre mensagens agendadas

A lógica de processamento de mensagens agendadas foi implementada na pasta `functions`, utilizando uma Cloud Function chamada `processScheduledMessages`.

No entanto, durante o deploy foi identificado que o Firebase exige o plano **Blaze/pay-as-you-go** para publicar Cloud Functions. Como a intenção era manter o projeto no plano gratuito para o teste, optei por não ativar cobrança.

Para demonstrar o funcionamento do agendamento sem custos, implementei uma alternativa no frontend: enquanto o cliente está logado, o sistema verifica periodicamente as mensagens agendadas e altera o status para `sent` quando o horário é atingido.

Em um ambiente real de produção, a melhor abordagem seria utilizar a Cloud Function agendada no backend, pois ela executaria independentemente do usuário estar com o sistema aberto.

---

## Uso de IA

Utilizei ferramentas de IA de forma parcial durante o desenvolvimento, principalmente como apoio para:

- Organizar a arquitetura inicial do projeto
- Revisar ideias de estrutura
- Apoiar na identificação de erros
- Melhorar alguns textos e pontos de interface

A implementação, testes, integração com Firebase, ajustes de regras, correções de fluxo e validações foram feitos manualmente durante o desenvolvimento.

Optei por manter essa observação no README por transparência, já que ferramentas de apoio fazem parte do meu fluxo de estudo e produtividade, mas o projeto foi validado e ajustado por mim durante a construção.

---

## Como rodar localmente

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd broadcast-saas
```

### 2. Instalar dependências do frontend

```bash
cd web
npm install
```

### 3. Criar o arquivo de ambiente

Criar um arquivo `.env.local` dentro da pasta `web`:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### 4. Rodar o projeto

```bash
npm run dev
```

A aplicação ficará disponível em:

```txt
http://localhost:5173
```

---

## Build e deploy

### Build do frontend

```bash
cd web
npm run build
```

### Deploy no Firebase Hosting

Na raiz do projeto:

```bash
firebase deploy --only hosting
```

### Deploy das regras do Firestore

```bash
firebase deploy --only firestore:rules
```

---

## Observação final

Este projeto foi desenvolvido como um MVP para atender aos requisitos do teste prático. A prioridade foi entregar uma base funcional, com autenticação, CRUDs principais, estrutura SaaS, tempo real no Firestore e deploy funcionando.

Alguns pontos podem ser evoluídos em uma próxima versão, como melhorias de responsividade, paginação, validações mais avançadas e processamento definitivo das mensagens agendadas via Cloud Functions em ambiente com plano Blaze.