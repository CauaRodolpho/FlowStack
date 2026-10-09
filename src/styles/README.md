# Design system do FlowTask

O visual usa tokens semânticos para evitar cores e medidas diferentes em cada tela.

- `tokens.css`: cores dos temas, tipografia, espaçamento, raios e sombras.
- `base.css`: estrutura, autenticação, tipografia e layout do produto.
- `responsive.css`: comportamento de desktop, tablet e celular.
- `components.css`: equipe, calendário e acabamento compartilhado.
- `mobile.css`: decisões finais específicas para telas pequenas.

## Regras

1. Superfícies usam `--background`, `--card`, `--muted` e `--border`.
2. Textos usam `--foreground` ou `--muted-foreground`.
3. Ações da marca usam `--primary`, `--brand-soft` e `--brand-text`.
4. Estados usam `--success-text`, `--warning-text` e `--destructive`.
5. Novos componentes devem funcionar nos dois temas sem cores fixas.
6. Texto de uso frequente não deve ficar abaixo de `--font-label`.
