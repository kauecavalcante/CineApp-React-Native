#  CineApp 🎬

Bem-vindo ao **CineApp**, um aplicativo móvel completo para entusiastas de cinema! Desenvolvido com React Native e Expo, o CineApp permite que os utilizadores explorem um vasto catálogo de filmes, criem listas personalizadas e muito mais.

## ✨ Funcionalidades

- **Autenticação de Utilizadores:** Sistema completo de registo e login com e-mail e senha, utilizando o Supabase.
- **Onboarding para Novos Utilizadores:** Uma experiência de boas-vindas para apresentar o aplicativo.
- **Exploração de Filmes:** Navegue por filmes populares, em cartaz e descubra novos títulos.
- **Cine IA:** Uma funcionalidade de chat com inteligência artificial para recomendações de filmes e conversas sobre cinema.
- **Detalhes do Filme:** Veja informações completas sobre cada filme, incluindo sinopse, elenco, avaliações e trailers.
- **Listas Personalizadas:** Crie e gira as suas próprias listas:
    - **Favoritos:** Marque os seus filmes preferidos.
    - **Quero Assistir:** Crie uma lista de filmes para ver no futuro.
    - **Já Assisti:** Mantenha um registo dos filmes que já viu.
- **Pesquisa Avançada:** Encontre filmes rapidamente através da funcionalidade de pesquisa.
- **Configurações de Perfil:** Os utilizadores podem atualizar o seu nome e e-mail.

## 📱 Telas do Aplicativo

<p align="center">
  <img src="./assets/images/tela1.png" alt="Tela Principal do App" width="300"/>
  <img src="./assets/images/tela2.png" alt="Tela de Detalhes do Filme" width="300"/>
</p>

## 🚀 Tecnologias Utilizadas

Este projeto foi construído com as seguintes tecnologias:

- **[React Native](https://reactnative.dev/)**: Framework para desenvolvimento de aplicativos móveis.
- **[Expo](https://expo.dev/)**: Plataforma e conjunto de ferramentas para facilitar o desenvolvimento com React Native.
- **[TypeScript](https://www.typescriptlang.org/)**: Superset do JavaScript que adiciona tipagem estática.
- **[Supabase](https://supabase.io/)**: Backend como serviço (BaaS) para autenticação e base de dados PostgreSQL.
- **[TMDB API](https://www.themoviedb.org/documentation/api)**: API para obter todos os dados sobre os filmes.
- **[Expo Router](https://expo.github.io/router/)**: Sistema de rotas baseado em ficheiros para uma navegação declarativa.

## ⚙️ Como Executar o Projeto

Para executar este projeto localmente, siga os passos abaixo:

1.  **Clone o Repositório:**
    ```bash
    git clone [https://github.com/kauecavalcante/CineApp-React-Native]
    cd CineApp-React-Native
    ```

2.  **Instale as Dependências:**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    * Crie um ficheiro chamado `.env` na raiz do projeto.
    * Adicione as suas chaves de API a este ficheiro:
      ```
      EXPO_PUBLIC_SUPABASE_URL=SUA_URL_SUPABASE_AQUI
      EXPO_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_AQUI
      EXPO_PUBLIC_TMDB_API_KEY=SUA_CHAVE_TMDB_AQUI
      ```

4.  **Execute o Aplicativo:**
    * **Para iOS:**
      ```bash
      npx expo run:ios
      ```
    * **Para Android:**
      ```bash
      npx expo run:android
      ```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o ficheiro `LICENSE` para mais detalhes.

---

Feito por **[Kauê Cavalcante W.]**