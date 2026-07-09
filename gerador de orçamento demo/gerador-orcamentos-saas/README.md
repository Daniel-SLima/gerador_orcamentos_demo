# Gerador de Orcamentos - Demo

Versao demonstrativa do sistema de orcamentos, preparada para entrevista e portfolio.

Esta versao nao usa Supabase, Cloudinary ou qualquer banco real. Os dados ficam salvos no `localStorage` do navegador, com uma base ficticia criada automaticamente no primeiro acesso.

## Login demo

```txt
E-mail: admin@admin.com
Senha: admin123
```

## Como rodar

```bash
npm install
npm run dev
```

Depois acesse:

```txt
http://localhost:3000
```

## O que funciona na demo

- Login com usuario administrador ficticio.
- Dashboard com dados de exemplo.
- Cadastro, edicao e exclusao de clientes.
- Cadastro, edicao e exclusao de produtos.
- Criacao e historico de orcamentos.
- Geracao/visualizacao de PDFs.
- Fluxo basico de ordem de producao.
- Central de compras e notificacoes com dados locais.

## Observacoes importantes

- Os dados nao sao compartilhados entre computadores.
- Ao limpar os dados do navegador, a demo volta ao estado inicial.
- Imagens anexadas ficam armazenadas como dados locais do navegador.
- Nao coloque chaves reais, `.env` ou dados de clientes neste repositorio.
