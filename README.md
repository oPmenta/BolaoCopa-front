# ⚽ Bolão da Copa - Frontend

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

> Interface moderna para gerenciamento de bolões de apostas com tema da Copa do Mundo 🇧🇷

---

## 📋 Sobre o Projeto

O **Bolão da Copa** é uma aplicação web completa para criar e participar de bolões de apostas. Este repositório contém o **frontend** da aplicação, desenvolvido em React com TypeScript, utilizando as melhores práticas de desenvolvimento e uma UI rica e interativa.

Este backend foi desenvolvido para ser consumido pelo backend do projeto:

➡️ **[BolaoCopa-api](https://github.com/oPmenta/BolaoCopa-api)**

### ✨ Funcionalidades principais

- 🔐 **Autenticação** – Login e cadastro com validação e máscaras (CPF, telefone).
- 🏟️ **Campanhas** – Criação de bolões públicos ou privados com opções de aposta.
- 💰 **Apostas** – Usuários podem apostar em campanhas ativas com upload de comprovante.
- 🏆 **Resultados** – Criadores podem definir o vencedor e encerrar a campanha.
- 👑 **Administração** – Painel admin para gerenciar campanhas e meios de pagamento.

---

## 🛠️ Tecnologias utilizadas

### Core
- [React](https://reactjs.org/) – Biblioteca para interfaces de usuário.
- [TypeScript](https://www.typescriptlang.org/) – Tipagem estática para JavaScript.
- [Vite](https://vitejs.dev/) – Bundler e servidor de desenvolvimento rápido.

### Gerenciamento de Estado e Dados
- [TanStack Query](https://tanstack.com/query) – Gerenciamento de dados assíncronos (cache, refetch, mutations).
- [React Hook Form](https://react-hook-form.com/) – Formulários performáticos com validação.
- [Zod](https://zod.dev/) – Validação de schemas (frontend e backend).

### Roteamento
- [React Router DOM v6](https://reactrouter.com/) – Roteamento client-side com proteção de rotas.

### Estilização e UI
- [Tailwind CSS](https://tailwindcss.com/) – Framework CSS utility-first.
- [shadcn/ui](https://ui.shadcn.com/) – Componentes acessíveis e customizáveis.
- [Framer Motion](https://www.framer.com/motion/) – Animações suaves.

### Ícones e Notificações
- [Lucide React](https://lucide.dev/) – Ícones vetoriais.
- [Sonner](https://sonner.emilkowal.ski/) – Toasts elegantes e ricos.

### Comunicação
- [Axios](https://axios-http.com/) – Cliente HTTP com interceptores para JWT.

---

## Como rodar o projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/)

### Instalação

1. **Clone o repositório** (se ainda não tiver):
   ```bash
   git clone https://github.com/seu-usuario/bolaocopa-front.git
   cd bolaocopa-front


### Instale as dependências:

- npm install

### Configure as variáveis de ambiente:

1. Crie um arquivo .env na raiz do projeto.
2. Copie o conteúdo do .env.example e ajuste conforme necessário:
    
    VITE_API_URL=http://localhost:3000/

### Execute o servidor de desenvolvimento:

- npm run dev

    O servidor será iniciado em http://localhost:5173
