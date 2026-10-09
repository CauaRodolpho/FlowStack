# FlowTask

O FlowTask é um dashboard de gestão de projetos e tarefas desenvolvido para o
meu portfólio de Front-end. A ideia foi criar uma aplicação que simulasse o dia
a dia de uma equipe de desenvolvimento, com diferentes níveis de acesso,
acompanhamento de produtividade e um fluxo de revisão de tarefas.

O projeto funciona inteiramente no navegador. Os dados são demonstrativos e
ficam salvos no `localStorage`, sem API ou banco de dados nesta versão.

## Demonstração

[Acessar o FlowTask](https://flowtask-caua.rodolfinhom5.chatgpt.site)

Na tela de login, é possível escolher uma conta demonstrativa e conhecer as
permissões de cada perfil.

## Principais funcionalidades

- Quadro Kanban com tarefas a fazer, em andamento, em revisão e concluídas.
- Criação e acompanhamento de projetos.
- Calendário mensal e linha do tempo das tarefas.
- Relatórios de produtividade e capacidade da equipe.
- Indicador de saúde do projeto calculado a partir das tarefas atuais.
- Notificações separadas de acordo com o perfil do usuário.
- Temas claro e escuro.
- Layout adaptado para desktop, tablet e celular.
- Exportação e importação de backup em JSON.
- Persistência dos dados no navegador.

## Perfis demonstrativos

| Perfil               | Permissões principais                                                    |
| -------------------- | ------------------------------------------------------------------------ |
| Desenvolvedor Júnior | Atualiza as próprias tarefas e envia entregas para revisão.              |
| Tech Lead            | Cria projetos e tarefas, revisa entregas e acompanha integrantes Júnior. |
| Administrador        | Possui acesso completo à equipe, aos projetos e às configurações.        |

O Desenvolvedor Júnior não pode concluir uma tarefa diretamente. Primeiro, ele
envia o trabalho para revisão. A conclusão ou a solicitação de ajustes fica sob
responsabilidade do Tech Lead ou do Administrador.

## Tecnologias utilizadas

- React
- TypeScript
- Tailwind CSS
- Next.js/Vinext
- Radix UI
- Zod
- GSAP
- Lucide React
- pnpm

## Organização do projeto

```text
app/                       entrada da aplicação e estilos globais
src/application/           composição principal do FlowTask
src/components/            componentes compartilhados
src/data/                  dados usados na demonstração
src/features/              telas organizadas por funcionalidade
src/hooks/                 hooks de estado, foco e animação
src/lib/                   regras, validações e persistência
src/styles/                tokens, temas e responsividade
src/types/                 tipos do domínio
components/ui/             componentes de interface reutilizados
```

As regras de negócio ficam separadas dos componentes visuais. Permissões,
mudanças de status, notificações e cálculos são centralizados para evitar que a
mesma regra seja implementada de formas diferentes em cada tela.

## Como executar localmente

É necessário ter o Node.js 22 ou superior e o pnpm instalados.

```bash
git clone <url-do-repositorio>
cd flowtask
pnpm install
pnpm dev
```

Para conferir a versão de produção:

```bash
pnpm build
pnpm start
```

Outros comandos disponíveis:

```bash
pnpm typecheck     # verifica os tipos do TypeScript
pnpm lint          # analisa o código com ESLint
pnpm format:check  # confere a formatação
```

## Decisões e desafios

### Permissões por perfil

O principal desafio foi representar três níveis de acesso sem um backend. Para
isso, criei regras no Front-end que controlam quais ações aparecem e quais
mudanças cada perfil pode realizar. Essas regras servem apenas para a
demonstração e não substituem uma autorização feita no servidor.

### Fluxo de revisão

Em vez de permitir que qualquer usuário marque uma tarefa como concluída, foi
criado um processo de revisão. Isso tornou a demonstração mais próxima de um
fluxo real de trabalho e deu uma responsabilidade diferente para cada perfil.

### Responsividade

As telas possuem bastante informação, principalmente o Kanban, os relatórios e
o calendário. Foi necessário reorganizar esses conteúdos para telas menores,
ajustando navegação, tamanho dos textos, rolagem e ordem das informações.

### Persistência local

Como o projeto ainda não possui backend, o estado é mantido no `localStorage`.
Os dados importados passam por validação com Zod antes de substituir o conteúdo
atual, reduzindo o risco de um arquivo inválido quebrar a aplicação.

## Como a inteligência artificial foi utilizada

Usei inteligência artificial como ferramenta de apoio durante o desenvolvimento,
principalmente para:

- revisar problemas de responsividade em celulares;
- localizar trechos com pouco contraste no tema claro;
- discutir melhorias nas regras de permissões e notificações;
- receber sugestões de organização de pastas e separação de responsabilidades;
- revisar o código durante as etapas de refatoração.

As sugestões foram avaliadas e adaptadas ao objetivo do projeto. Eu acompanhei
as alterações, defini o funcionamento das telas e revisei os fluxos para entender
as decisões implementadas. Essa experiência também fez parte do meu processo de
aprendizado com React e TypeScript.

## Limitações atuais

- O login é demonstrativo e não valida credenciais reais.
- Não existe API, banco de dados ou sincronização entre dispositivos.
- As permissões são uma simulação no Front-end.
- Os dados podem ser apagados ao limpar o armazenamento do navegador.
- A integração com Gemini foi deixada para uma etapa futura.

## Próximos passos

- Criar uma API para projetos, tarefas e usuários.
- Implementar autenticação e autorização no servidor.
- Substituir o `localStorage` por um banco de dados.
- Adicionar uma integração opcional com o Gemini para gerar insights.
- Criar testes automatizados para os fluxos mais importantes.

## Autor

Desenvolvido por **Cauã Rodolpho**.

- [GitHub](https://github.com/CauaRodolpho)
- [LinkedIn](https://www.linkedin.com/in/cauã-rodolpho/)
- [Portfólio](https://portifolio-caua-rodolpho-hazel.vercel.app/)
