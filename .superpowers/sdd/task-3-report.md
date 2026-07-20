# Task 3 Report: Canvas Textures and Two Exhibited Service Kits

## Статус

Task 3 реализована в isolated worktree `phase4/floema-home`. Scope ограничен asset pipeline, двумя service-kit still life, тремя утверждёнными hotel sources, canvas derivatives, typed homepage descriptors, verification contract и provenance. Новые routes, UI sections и архитектурные изменения не добавлялись.

Планируемый commit message после финальной проверки: `feat: add original canvas textures and service-kit art`.

## TDD: RED → GREEN

1. До production changes в `scripts/verify-home.mjs` добавлена проверка наличия:
   - `public/images/home-kits/arrival-kit.webp`;
   - `public/images/home-kits/bosphorus-kit.webp`.
2. RED подтверждён командой `npm run verify:home`:
   - exit `1`;
   - ожидаемая причина: `ENOENT` для `public/images/home-kits/arrival-kit.webp`.
3. После подготовки assets проверка наличия стала GREEN: `verify:home` проходит оба `access()` и доходит до браузерного контракта.
4. В соответствии с brief полный browser contract остаётся RED только на отложенной реализации hero canvas:
   - команда: `env BASE_URL=http://localhost:3102 npm run verify:home`;
   - exit `1`;
   - единственная assertion: `The enhanced hero must expose its canvas`, `0 !== 1`;
   - full-motion readiness до этой assertion успешно достигается.

## Built-in image generation

Использован только built-in `image_gen`, по одному отдельному вызову на каждый distinct asset. CLI, API runner и `gpt-image-1.5` fallback не использовались.

Built-in outputs:

- arrival: `/Users/anastasiavolkova/.codex/generated_images/019f7e5c-561d-7a51-9aa0-1244c66e47f8/exec-cf6b49e8-4527-4761-8704-ce73ac2aa66e.png`;
- Bosphorus: `/Users/anastasiavolkova/.codex/generated_images/019f7e5c-561d-7a51-9aa0-1244c66e47f8/exec-01b672cc-59cf-498c-bec4-6320b78bb255.png`.

Оба built-in результата были визуально осмотрены до локального удаления chroma-key. Оба соответствовали композиции, материалам и ограничениям; targeted regeneration не потребовалась.

### Exact arrival prompt

```text
Use case: product-mockup
Asset type: transparent homepage service-kit still life
Primary request: Transparent-background premium editorial still life for a Turkish travel service: a matte charcoal modern car key fob, a restrained terracotta airport transfer card with abstract route lines and no airline branding, and a minimal cream eSIM sleeve. Orthographic three-quarter view, museum product photography, natural soft shadow isolated on transparency, no luggage, no airplane, no palm trees, no readable brand names, no people, no gradient background.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for local background removal.
Subject: exactly three grouped objects — matte charcoal modern car key fob, restrained terracotta airport transfer card with abstract route lines, minimal cream eSIM sleeve.
Style/medium: premium museum product photography, original project-specific still life.
Composition/framing: orthographic three-quarter view, balanced compact grouping, crisp fully separated outer silhouette, generous padding on all sides.
Lighting/mood: restrained soft studio lighting; keep the natural soft shadow confined tightly to the object grouping while the surrounding background stays perfectly uniform.
Materials/textures: matte charcoal polymer and metal, uncoated terracotta card stock, minimal cream paper sleeve.
Constraints: the entire background and all four corners must be exactly one uniform #00ff00 color with no gradient, texture, reflection, floor plane, horizon, or lighting variation; do not use #00ff00 anywhere in the subject; no cast shadow extending into the outer background; no luggage; no airplane or airline iconography; no palm trees; no people; no readable brand names; no logos; no watermark; no extra objects.
```

### Exact Bosphorus prompt

```text
Use case: product-mockup
Asset type: transparent homepage service-kit still life
Primary request: Transparent-background premium editorial still life for Istanbul travel: a folded off-white Bosphorus route sheet with thin black and terracotta lines, a compact ferry ticket, and a small dark metal transit token. Museum product photography, precise paper texture, soft isolated shadow, no airline iconography, no people, no tourist clichés, no readable third-party branding, transparent background.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for local background removal.
Subject: exactly three grouped objects — folded off-white Bosphorus route sheet with thin black and terracotta lines, compact ferry ticket, small dark metal transit token.
Style/medium: premium museum product photography, original project-specific still life.
Composition/framing: orthographic three-quarter view, balanced compact grouping, crisp fully separated outer silhouette, generous padding on all sides.
Lighting/mood: restrained soft studio lighting; keep the soft isolated shadow confined tightly to the object grouping while the surrounding background stays perfectly uniform.
Materials/textures: precise uncoated off-white paper texture, crisp printed route lines, dark aged metal token.
Constraints: the entire background and all four corners must be exactly one uniform #00ff00 color with no gradient, texture, reflection, floor plane, horizon, or lighting variation; do not use #00ff00 anywhere in the subject; no cast shadow extending into the outer background; no airline iconography; no people; no tourist clichés; no readable third-party branding; no logos; no watermark; no extra objects.
```

## Chroma-key removal и alpha validation

Для обоих assets использован установленный helper:

```text
/Users/anastasiavolkova/.codex/skills/.system/imagegen/scripts/remove_chroma_key.py
```

Параметры для каждого source: `--auto-key border --soft-matte --transparent-threshold 12 --opaque-threshold 220 --despill`.

Команда `python` отсутствует, а системный `python3` не содержит Pillow. Без установки зависимостей использован уже установленный bundled runtime:

```text
/Users/anastasiavolkova/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3
Pillow 12.2.0
```

Helper results:

- arrival key `#04f810`, transparent `1,111,941 / 1,572,864`, partially transparent `18,569`;
- Bosphorus key `#03f808`, transparent `1,154,835 / 1,572,864`, partially transparent `23,278`.

Sharp pixel validation для source PNG и final WebP:

| Asset | Alpha | Corner alpha | Subject coverage | Green fringe pixels |
|---|---|---|---:|---:|
| arrival source PNG | yes | `[0, 0, 0, 0]` | 29.30% | 0 |
| Bosphorus source PNG | yes | `[0, 0, 0, 0]` | 26.58% | 0 |
| arrival WebP | yes | `[0, 0, 0, 0]` | 29.30% | 0 |
| Bosphorus WebP | yes | `[0, 0, 0, 0]` | 26.58% | 0 |

Source PNG и optimized WebP повторно осмотрены визуально после удаления background. Силуэты, бумажные текстуры, мягкие локальные тени и прозрачность сохранены; видимый green fringe отсутствует.

## Pexels provenance

Импортированы только три явно утверждённых temp-файла; related/recommended images не загружались.

1. `48f9df87aa0d72d5.jpeg` (фактически AVIF) → `public/images/home-sources/bodrum-amanruya.avif`.
   - Çisel Bozar;
   - https://www.pexels.com/photo/amanruya-hotel-in-bodrum-in-turkey-20297239/
2. `f5930ebe84c6fd5d.jpeg` (фактически AVIF) → `public/images/home-sources/cappadocia-cave-hotel.avif`.
   - Ahmet;
   - https://www.pexels.com/photo/aerial-view-of-cappadocia-cave-hotel-in-turkey-29158010/
3. `5bd092fefbbd93ea.jpeg` (фактически AVIF) → `public/images/home-sources/istanbul-legacy-hotel.avif`.
   - Ömer Derinyar;
   - https://www.pexels.com/photo/legacy-ottoman-hotel-architecture-in-istanbul-29080197/

`file` подтвердил `ISO Media, AVIF Image` для всех трёх исходников до копирования и после него.

## Реализация

- Добавлен deterministic Sharp script `scripts/prepare-home-assets.mjs` и npm script `prepare:home-assets`.
- Созданы 13 canvas WebP derivatives: 10 существующих Turkish editorial photos и 3 approved hotel photos.
- Созданы 2 прозрачных source PNG и 2 optimized transparent WebP для service kits.
- В `src/data/home.ts` добавлены `HeroFragment`, `ServiceKit`, `DirectionContextPanel`, расширенный `DirectionScene`, `serviceKits`, 19 `heroFragments` и пять direction enhancements.
- В `public/images/CREDITS.md` сохранены Pexels provenance, exact generation prompts, дата создания и формулировка `project-specific generated source, no third-party brand assets`.
- В `scripts/verify-home.mjs` добавлен asset-presence contract.

Повторный запуск `npm run prepare:home-assets` дал идентичные SHA-256 всех 15 WebP (`identical=true`).

Размеры по обязательной команде `du -h`:

- kits: `88K`, `124K`;
- canvas textures: от `132K` до `688K`;
- ни одна full-frame texture не превышает лимит `700K` в выводе `du -h`.

## Проверки и результаты

- `npm run prepare:home-assets` — PASS, exit `0`.
- повторный `npm run prepare:home-assets` + SHA-256 comparison — PASS, outputs identical.
- `file public/images/home-kits/*.webp public/images/home-canvas/*.webp` — PASS, все derivatives являются WebP.
- `du -h public/images/home-kits/*.webp public/images/home-canvas/*.webp` — PASS, max `688K`.
- programmatic alpha/corners/coverage/fringing validation — PASS.
- визуальная инспекция двух built-in PNG, двух transparent source PNG и двух final WebP — PASS.
- `node --test scripts/homeMotion.test.mjs scripts/useMediaQuery.test.mjs` — PASS, 6/6.
- `npm run lint` — PASS.
- `npm run typecheck` — PASS.
- `npm run build` — PASS; `/` и `/_not-found` статически сгенерированы.
- `git diff --check` — PASS.
- browser contract — expected RED только на deferred hero canvas assertion.

## Browser environment note

Существующий процесс на `127.0.0.1:3100` отвечал HTTP 500 из-за повреждённого Turbopack cache: `00000092.meta` ссылался на отсутствующий `00000088.sst`. Процесс корректно остановлен перед production build. Никакие cache-файлы не удалялись и конфигурация Next.js не менялась.

Для чистой browser-проверки использован временный `next dev --webpack` на 3102. Обращение через `127.0.0.1` сначала выявило dev-origin блокировку HMR; переход на совпадающий origin `http://localhost:3102` восстановил hydration и дал ожидаемую deferred canvas assertion. Временный сервер после проверки остановлен.

## Skills и agents

Обнаружены релевантные skills: `using-superpowers`, `brainstorming`, `using-git-worktrees`, `executing-plans`, `test-driven-development`, `imagegen`, `systematic-debugging`, `verification-before-completion`, `finishing-a-development-branch`.

Полностью прочитаны все перечисленные instruction files, а также `imagegen/references/prompting.md` и релевантные transparent/product sections `imagegen/references/sample-prompts.md`.

Применены:

- `test-driven-development` — asset contract сначала подтверждён RED, затем доведён до GREEN;
- `imagegen` — built-in-first chroma-key workflow, separate call per asset, installed helper, alpha/fringe validation;
- `using-git-worktrees` — подтверждена работа в существующем isolated linked worktree;
- `executing-plans` — brief выполнен по шагам без расширения scope;
- `systematic-debugging` — локализованы Turbopack cache и origin issues без удаления cache/config changes;
- `verification-before-completion` — свежие checks перед commit;
- `finishing-a-development-branch` — ветка и worktree сохраняются, merge/push/cleanup не выполняются.

`brainstorming` учтён как уже завершённый gate: Task 3 имеет утверждённые design/implementation documents и exact art direction, поэтому новая концепция не создавалась.

Отдельные agent tools в текущем окружении недоступны. Основной Codex-оркестратор выполнил роли read-only review, implementation, visual inspection и QA; параллельное редактирование файлов отсутствовало.

## Self-review

- Scope соответствует homepage-only Task 3.
- Все image/data values совпадают с brief.
- Hotel fragments находятся в трёх разных depth bands и вне центральной title safe area.
- Canvas consumers получают только paths из `heroFragments` и `DirectionScene.canvasImage`.
- Generated assets оригинальны для проекта и не используют third-party brand assets.
- Три Pexels originals сохранены в исходном AVIF content без дополнительных downloads.
- `package-lock.json` не изменён: новая dependency не устанавливалась, изменён только npm script в `package.json`.
- Dead UI, routes, prices beyond exact approved mock descriptors и новые dependencies не добавлены.

## Concerns / ограничения

- Browser contract намеренно RED на hero canvas до следующей утверждённой задачи.
- Сломанный dev-процесс 3100 остановлен; автоматический перезапуск не выполнялся, чтобы не оставлять фоновый процесс и не менять cache/config.
- Unit-тесты сохраняют существующее до Task 3 предупреждение Node `MODULE_TYPELESS_PACKAGE_JSON` для двух импортируемых TypeScript-модулей. Исправление потребовало бы scope/config change и не выполнялось.
- В arrival still life присутствуют только generic functional labels `AIRPORT TRANSFER` и `eSIM`; это не third-party branding.

Оставшиеся TODO в рамках Task 3 отсутствуют.
