# OrçaDemo — Gerador de Orçamentos

<div align="center">

**Demonstração pública de um sistema real de orçamentos e produção.**

[![Demo](https://img.shields.io/badge/Acessar-demo-111827?style=flat&logo=vercel&logoColor=white)](https://gerador-orcamentos-demo.vercel.app)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=000000)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)

</div>

## Sobre o projeto

O **OrçaDemo** é a versão pública e segura para portfólio de uma aplicação desenvolvida para apoiar o fluxo de **orçamentos, produção, compras e acompanhamento operacional**.

O projeto original é utilizado em ambiente real. Esta versão foi isolada especificamente para demonstração: não possui conexão com a infraestrutura de produção e utiliza somente dados fictícios.

### [Abrir demonstração online →](https://gerador-orcamentos-demo.vercel.app)

## Acesso

```txt
E-mail: admin@admin.com
Senha: admin123
```

## O que é possível testar

- Dashboard com indicadores simulados
- Cadastro e gerenciamento de clientes
- Cadastro e gerenciamento de produtos
- Criação, edição e clonagem de orçamentos
- Reordenação manual dos itens do orçamento
- Geração de PDF
- Histórico de orçamentos
- Ordem de Produção
- Fluxo de produção organizado por setores
- Compras e notificações locais
- Restauração da base demonstrativa pelo painel

## Stack

| Área | Tecnologia |
|---|---|
| Framework | Next.js 16 |
| Interface | React 19 |
| Linguagem | TypeScript 5 |
| Estilos | Tailwind CSS 4 |
| PDFs | React PDF Renderer |
| Persistência demo | localStorage |
| Deploy | Vercel |

## Arquitetura da versão demo

A aplicação mantém a experiência principal do produto, mas substitui integrações privadas por uma camada local de demonstração.

```text
Interface Next.js
      │
      ├── Orçamentos e clientes
      ├── Produtos e produção
      ├── Compras e notificações
      │
      ▼
Camada local da demo
      │
      ▼
localStorage do navegador
```

Isso permite apresentar fluxos reais do sistema sem depender de banco externo, credenciais ou serviços do cliente.

## Privacidade e segurança da demonstração

Esta versão foi preparada para ser pública:

- sem Supabase de produção;
- sem Cloudinary de produção;
- sem chaves ou credenciais reais;
- sem dados de clientes;
- sem identidade visual do cliente;
- sem armazenamento em servidor da aplicação;
- nomes, documentos, telefones, endereços e valores são fictícios.

> A finalidade deste repositório é demonstrar produto, interface e decisões técnicas sem expor dados ou infraestrutura privada.

## Executando localmente

Requer Node.js compatível com Next.js 16.

```bash
npm install
npm run dev
```

Depois, acesse:

```txt
http://localhost:3000
```

Para validar a build:

```bash
npm run lint
npm run build
```

## Contexto de desenvolvimento

Este projeto demonstra, em uma aplicação próxima de uso real:

- modelagem de fluxos de negócio;
- evolução de funcionalidades a partir de feedback;
- organização e reordenação de itens;
- geração de documentos;
- separação entre ambiente de produção e ambiente seguro de demonstração;
- manutenção contínua de um produto web.

---

Desenvolvido por [Daniel Lima](https://github.com/Daniel-SLima).
