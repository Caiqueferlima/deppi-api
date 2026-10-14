# DEPPI API

### Contextualização

O sistema está sendo desenvolvido para a disciplina de Programação Web no curso de Sistemas de Informação no IFCE - Campus Cedro, em específico. O seguinte sistema está sendo desenvolvido pela equipe: Anderson, Eduardo, Gideão, Guilherme Oliveira, Ian Thiago.

## Tecnologias

![Node](https://skillicons.dev/icons?i=nodejs&theme=dark) ![TypeScript](https://skillicons.dev/icons?i=typescript&theme=dark) ![TypeScript](https://skillicons.dev/icons?i=prisma&theme=dark) ![TypeScript](https://skillicons.dev/icons?i=express&theme=dark) ![TypeScript](https://skillicons.dev/icons?i=docker&theme=dark)

## Front-end

O projeto agora inclui uma interface web em [frontend/](./frontend/) seguindo o layout-base do DEPPI.

### Como executar

1. Inicie a API na porta `3000`.
2. No diretório `frontend/`, execute:

```bash
npm run dev
```

Isso gera o build e sobe um servidor local em `http://localhost:4173`, com proxy de `/api` para a API local.

Para uma apresentação rápida, a tela de login também possui perfis de demonstração
(`ADMIN demo`, `ALUNO demo`, `PROFESSOR demo` e `DEPPI demo`). Esses perfis usam dados
locais e não substituem a autenticação real da API.