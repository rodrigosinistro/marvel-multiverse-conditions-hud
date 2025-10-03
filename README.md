
# Marvel Multiverse – Conditions HUD

- Substitui o botão **Atribuir Efeitos de Condição** do HUD por **Condições do Marvel Multiverse RPG**.
- Mostra um **painel** com as condições ativas do token selecionado (ancorado à **esquerda do Chat**, no topo-direito).
- Exibe **tooltip grande** com a descrição completa no hover.
- **GM** pode remover condição pelo **×** na pílula.
- **Opcional:** aplica dano automático no fim do turno para *Ablaze, Bleeding, Corroding*, respeitando **Health DR (Sturdy)**.

## Instalação
1. Extraia a pasta `marvel-multiverse-conditions-hud` em `Data/modules/` (deixe `module.json` na raiz dessa pasta).
2. Ative em **Configurar Módulos**.
3. Configure em **Configurações do Módulo**:
   - *Offset X/Y do painel* para ajuste fino.
   - *Aplicar dano... no fim do turno*.

## v0.2.4
- Painel ancorado por `right:` usando a largura da `#sidebar` (fica sempre à esquerda do ícone de Chat).
- Tooltip abre para a esquerda da pílula, centralizado verticalmente (sem "passear" pela tela).
- Correções para HUD do Foundry v13 (títulos amigáveis e mapeamento `name/label/img`).


## v0.2.5
- Ícones do HUD um pouco menores (28px) para alinhar melhor.
- Condições em ordem alfabética (esquerda→direita, cima→baixo).

## v0.2.6
- Corrige **tooltip duplicado** no HUD (usa apenas `data-tooltip`, removendo `title`).
- Reduz o **espaçamento** entre os ícones do HUD (gap: 3px) para acompanhar o novo tamanho.

## v0.2.7
- HUD ainda mais compacto: **1px** de espaçamento entre ícones (e sem margens).

## Instalação via Manifest (Foundry)
Cole este URL em *Install Module* → *Manifest URL*:

```
https://raw.githubusercontent.com/rodrigosinistro/marvel-multiverse-conditions-hud/main/module.json
```
