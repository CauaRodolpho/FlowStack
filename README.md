# FlowTask

Dashboard Front-End para gestão de projetos, tarefas e equipes, desenvolvido para simular o fluxo de trabalho de uma equipe de tecnologia com diferentes níveis de acesso.

> Projeto idealizado e desenvolvido por **Cauã Rodolpho**, com foco em React, TypeScript, organização de regras de negócio, responsividade e experiência do usuário.

## Demonstração

- **Aplicação:** [Acessar o FlowTask](https://flowstack-ivory.vercel.app/)
- **Repositório:** [FlowStack no GitHub](https://github.com/CauaRodolpho/FlowStack)
- **Portfólio:** [Cauã Rodolpho — Front-End](https://portifolio-caua-rodolpho-hazel.vercel.app/)

Na tela de login, é possível selecionar uma conta demonstrativa e explorar as permissões de cada perfil.

## Sobre o projeto

O FlowTask foi criado para representar um cenário próximo ao cotidiano de uma equipe de desenvolvimento. Projetos, tarefas, revisões, notificações e indicadores compartilham a mesma fonte de dados, permitindo acompanhar o trabalho da equipe por diferentes perspectivas.

A aplicação funciona inteiramente no navegador. Nesta versão, os dados são demonstrativos e permanecem salvos no `localStorage`, sem exigir cadastro, API ou banco de dados.

## Principais funcionalidades

- Quadro Kanban com tarefas a fazer, em andamento, em revisão e concluídas.
- Criação e acompanhamento de projetos e tarefas.
- Calendário mensal e linha do tempo das atividades.
- Relatórios de produtividade e capacidade da equipe.
- Indicador de saúde do projeto calculado a partir das tarefas atuais.
- Notificações adaptadas ao perfil do usuário.
- Fluxo de envio, aprovação e solicitação de ajustes.
- Temas claro e escuro.
- Layout responsivo para computador, tablet e celular.
- Exportação e importação de backup em JSON.
- Persistência dos dados no navegador.

## Perfis demonstrativos

| Perfil | Permissões principais |
| --- | --- |
| Desenvolvedor Júnior | Atualiza as próprias tarefas e envia entregas para revisão. |
| Tech Lead | Cria projetos e tarefas, revisa entregas e acompanha integrantes Júnior. |
| Administrador | Possui acesso completo à equipe, aos projetos e às configurações. |

O Desenvolvedor Júnior não conclui uma tarefa diretamente. A entrega é encaminhada para revisão, e o Tech Lead ou o Administrador pode aprová-la ou solicitar ajustes. Essa regra torna a demonstração mais próxima de um fluxo real de trabalho.

## Tecnologias utilizadas

| Tecnologia | Aplicação no projeto |
| --- | --- |
| React | Construção das telas e dos componentes reutilizáveis |
| TypeScript | Tipagem dos dados, permissões e regras do domínio |
| Next.js e Vinext | Estrutura da aplicação e geração do build |
| Tailwind CSS | Estilos, temas e responsividade |
| Radix UI | Base acessível para componentes interativos |
| Zod | Validação dos dados importados |
| GSAP | Animações e transições da interface |
| Lucide React | Ícones da aplicação |
| LocalStorage | Persistência local sem necessidade de backend |

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

As regras de permissões, mudanças de status, notificações e cálculos ficam separadas dos componentes visuais. Essa organização reduz duplicações e mantém o mesmo comportamento em diferentes telas.

## Decisões técnicas e soluções

### Permissões por perfil

Para representar diferentes responsabilidades sem adicionar um backend ao escopo, centralizei as permissões no Front-End. A interface exibe somente as ações disponíveis para o perfil selecionado, enquanto as transições de estado também validam quais mudanças podem ser realizadas.

### Fluxo de revisão

As tarefas não passam diretamente de “em andamento” para “concluída” quando executadas pelo perfil Júnior. O estado intermediário de revisão cria uma etapa de validação e diferencia claramente as responsabilidades dos usuários demonstrativos.

### Persistência e importação

O estado da aplicação é mantido no `localStorage`, permitindo testar todo o fluxo sem configurar serviços externos. Antes de substituir os dados atuais, os arquivos JSON importados são validados com Zod para impedir que estruturas incompatíveis sejam aplicadas ao workspace.

### Responsividade

Kanban, relatórios e calendário concentram bastante informação. Para preservar a leitura em telas menores, a navegação, a ordem dos conteúdos, as áreas de rolagem e os tamanhos dos elementos são reorganizados conforme a largura disponível.

## Processo de desenvolvimento

O projeto começou pela definição dos perfis e das responsabilidades de cada pessoa dentro da equipe. Em seguida, estruturei o fluxo das tarefas, os estados de revisão e as regras que conectam Kanban, calendário, relatórios e notificações.

Durante o desenvolvimento, validei os fluxos diretamente na interface e adaptei a experiência para diferentes tamanhos de tela. As decisões de arquitetura, funcionalidades, design e comportamento foram tomadas de acordo com o objetivo do projeto e revisadas durante a implementação.

### Inteligência artificial como ferramenta de apoio

Utilizei ferramentas de inteligência artificial de maneira complementar para pesquisar alternativas, revisar trechos de código e apoiar a investigação de problemas. A concepção do projeto, a definição das funcionalidades, as decisões técnicas, a implementação e a validação final foram conduzidas por mim. As sugestões recebidas foram analisadas, testadas e adaptadas antes de serem incorporadas.

## Executando localmente

É necessário ter o Node.js 22 ou superior e o pnpm instalados.

```bash
git clone https://github.com/CauaRodolpho/FlowStack.git
cd FlowStack
pnpm install
pnpm dev
```

Comandos de qualidade disponíveis:

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
```

## Escopo atual

O FlowTask é uma demonstração Front-End. O login seleciona perfis fictícios, as permissões são simuladas no navegador e os dados não são sincronizados entre dispositivos. Essa escolha mantém o foco em interface, regras de interação, organização do código e experiência do usuário.

Em uma aplicação de produção, autenticação, autorização e persistência precisariam ser validadas por um servidor.

## Possíveis evoluções

- Criar uma API para projetos, tarefas e usuários.
- Implementar autenticação e autorização no servidor.
- Adicionar persistência em banco de dados.
- Criar testes automatizados para os fluxos principais.
- Adicionar insights opcionais com inteligência artificial.

## Autor

Desenvolvido por **Cauã Rodolpho**, estudante de Análise e Desenvolvimento de Sistemas com foco em desenvolvimento Front-End.

- [GitHub](https://github.com/CauaRodolpho)
- [LinkedIn](https://www.linkedin.com/in/cauã-rodolpho/)
- [Portfólio](https://portifolio-caua-rodolpho-hazel.vercel.app/)

