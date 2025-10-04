# Marvel Multiverse — Conditions HUD (Foundry VTT v13)

Substitui o painel padrão de **Atribuir Efeitos de Condição** do Foundry pelos **status oficiais do Marvel Multiverse RPG (D616)**, com foco em clareza visual e fluxo rápido de jogo.

Manifest: https://raw.githubusercontent.com/rodrigosinistro/marvel-multiverse-conditions-hud/main/module.json

## Principais recursos
- **Ícone único “M”** (preto e branco) para todas as condições (placeholder padrão).
- **Grade compacta** de ícones **26×26 px** com **1 px** de espaçamento, ordenação **alfabética** (esquerda→direita; cima→baixo).
- Aplicar condição no token também exibe **pílula no HUD lateral** com botão **X (apenas GM)** para remover.
- **Tooltip ampliado (14px)** ao passar o mouse na pílula, mostrando **nome + descrição completa** (PT/EN) lida do JSON/Journal do sistema.
- **Auto-aplicação por atributos** (v0.3.x):
  - **FOCUS ≤ 0** → aplica **Demoralized** (*Desmoralizado*).
  - **HEALTH ≤ 0** → aplica **Incapacitated** (*Incapaz/KO*).
  - Ao voltar a **> 0**, remove a condição correspondente.
  - Funciona **dentro e fora de combate**, **sem** criar `ActiveEffects`.
  - Usa a API v13-safe: `Actor#toggleStatusEffect(id, { active, token })`.

## Requisitos
- **Foundry VTT**: v13.x
- **Sistema**: *Marvel Multiverse RPG (D616)*

## Instalação
1. Baixe o último release em **Releases** (arquivo `.zip`).  
2. Extraia em `Data/modules/` (ficará `Data/modules/marvel-multiverse-conditions-hud/`).  
3. Habilite o módulo em *Configurações → Gerenciar Módulos*.

> **Obs.**: Você também pode instalar pelo *Manifest URL* do `module.json` hospedado no GitHub (aba *Raw*).

## Uso
- Clique no botão de **Atribuir Efeitos de Condições** do token.  
- Selecione as condições desejadas (ícones “M” em ordem alfabética).  
- Ao aplicar, aparecerão **pílulas no HUD**. Passe o mouse para ler a descrição; o **X** remove (apenas **GM**).  
- **Auto-aplicar**: altere **FOCUS**/**HEALTH** na ficha do ator (ou via macro) para ativar/desativar automaticamente **Demoralized**/**Incapacitated**.

## Comandos úteis (Console)
```js
// versão e arquivo principal
const m = game.modules.get("marvel-multiverse-conditions-hud");
console.log("Conditions HUD:", m?.version, [...(m?.esmodules ?? [])][0]);

// forçar revalidação de todos os atores (auto-aplicar)
for (const a of game.actors) await MMRPG_CHUD.applyFromStats(a);
ui.notifications.info("Revalidação rodada.");
```

## Solução de problemas
- **Ícones padrão do Foundry aparecem ao invés do “M”**  
  Recarregue (F5) e verifique o console: não pode haver erro de sintaxe no arquivo do módulo.
- **Condição não auto-aplica**  
  • Garanta que o token está em cena e vinculado ao ator correto.  
  • Confira se **FOCUS/HEALTH** chegou a 0 na ficha.  
  • Teste o comando de revalidação acima.  
  • Verifique conflitos com outros módulos que mexam em `CONFIG.statusEffects`.

## Desenvolvimento
- **Sem `ActiveEffects`**: o módulo trabalha apenas com **status de token/ator**.  
- Hooks usados: `init`, `ready`, `updateActor`.  
- Leituras: `foundry.utils.getProperty(actor, "system.health.value")` e `"system.focus.value"`.  
- Tokens do ator: `canvas.tokens.placeables.filter(t => t.actor?.id === actor.id)`.

## Versão estável atual
**v0.3.2** — ver *CHANGELOG.md*
