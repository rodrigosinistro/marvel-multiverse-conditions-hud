# CHANGELOG

## [0.3.2] - 2025-10-04
### Fixed
- Corrigido erro de sintaxe causado por bloco duplicado (um `catch` solto quebrava o carregamento).
- Guard real para evitar **hooks** duplicados.

### Changed
- Auto-aplicação agora usa **`Actor#toggleStatusEffect(id, { active, token })`** (v13-safe), mantendo **fallback** para `Token#toggleEffect` somente se necessário.

## [0.3.1] - *não lançado publicamente*
- Tentativa inicial de migração para `Actor#toggleStatusEffect` (quebrou devido ao bloco duplicado).

## [0.3.0] - 2025-10-04
### Added
- **Auto-aplicar condições por atributos**:  
  - **FOCUS ≤ 0** → **Demoralized** (*Desmoralizado*).  
  - **HEALTH ≤ 0** → **Incapacitated** (*Incapaz/KO*).  
  - Remoção automática ao retornar a **> 0**.  
- Robusteza v13 (APIs seguras, checagens antes de `toggle`).
- Respeito ao builder de `CONFIG.statusEffects` existente; fallback com ícone “M” e ordenação alfabética.

## [0.2.9] - Base estável anterior
- Grade 26×26 (gap 1px) com ícone “M”, ordenação alfabética.
- Pílulas no HUD com X (GM-only) e tooltip ampliado 14px.
