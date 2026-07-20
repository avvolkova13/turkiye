# Task 2 — Central Motion Lifecycle and Pure Progress Helpers

## Реализация

- Добавлен единственный `MotionProvider` рядом с `Header` в `src/app/page.tsx`; семантическая SSR-разметка главной страницы не изменена.
- Provider определяет `prefers-reduced-motion` и `navigator.connection.saveData`, записывает `html[data-motion="full|reduced"]` и `html[data-save-data="true|false"]`.
- Для full motion provider запускает Lenis, синхронизирует его с GSAP ticker и ScrollTrigger, обновляет после готовности шрифтов и корректно освобождает ticker, Lenis, ScrollTrigger и document data attributes.
- Добавлен единый browser-only модуль регистрации GSAP/ScrollTrigger. Последующие canvas-компоненты должны импортировать их только из `@/components/home/motion/gsap`.
- Добавлены pure helpers `clamp01`, `sceneIndexAt`, `sceneBlendAt` и `useMediaQuery` с SSR fallback `null`.
- Browser contract расширен: проверяются reduced и normal motion document states, а также ровно один motion provider. Ожидание data attribute исключает гонку между hydration и assertion.

## TDD: RED → GREEN

1. Browser contract был расширен до production-кода. Команда `BASE_URL=http://127.0.0.1:3101 npm run verify:home` упала ожидаемо: normal-motion assertion получил `null` вместо `full`.
2. `scripts/homeMotion.test.mjs` был написан до `src/lib/homeMotion.ts`. Запуск `node --test src/lib/homeMotion.test.ts` упал ожидаемо с `ERR_MODULE_NOT_FOUND` для отсутствующего `homeMotion.ts`.
3. Для `useMediaQuery` helper был удалён, затем до его восстановления создан `scripts/useMediaQuery.test.mjs`. Запуск `node --no-warnings --test scripts/useMediaQuery.test.mjs` упал ожидаемо с `ERR_MODULE_NOT_FOUND` для отсутствующего `useMediaQuery.ts`.
4. После минимальной реализации green-проверка pure helpers прошла: 4 теста, 4 passed, 0 failed.
5. Browser verification после green проходит обе новые motion assertions и останавливается только на намеренно отсутствующем `canvas[data-hero-canvas]` (Task 4).

## Проверки

| Команда | Результат |
| --- | --- |
| `npm run lint` | passed |
| `npm run typecheck` | passed |
| `npm run build` | passed; `/` статически пререндерен |
| `node --no-warnings --test scripts/homeMotion.test.mjs scripts/useMediaQuery.test.mjs` | passed; 4/4 |
| `BASE_URL=http://127.0.0.1:3100 npm run verify:home` | ожидаемый RED: `The enhanced hero must expose its canvas`, actual 0, expected 1 |

Для browser verification использован согласованный изолированный адрес `http://127.0.0.1:3100` из контекста задачи. Прежде чем остановиться на hero canvas assertion, проверка успешно подтверждает `html[data-motion="full"]`, `html[data-motion="reduced"]` и один `[data-motion-provider]`.

## Self-review

- Единственный прямой импорт `gsap` и `gsap/ScrollTrigger` находится в `src/components/home/motion/gsap.ts`.
- `MotionProvider` — client component; `page.tsx` остаётся server component и сохраняет всю существующую контентную разметку.
- `useMediaQuery` возвращает `null` на SSR и до первого effect, поэтому последующие canvas-компоненты могут удерживать fallback без desktop-flash на mobile.
- Diff не содержит whitespace errors (`git diff --check`).

## Изменённые файлы

- `src/app/page.tsx`
- `src/components/home/motion/gsap.ts`
- `src/components/home/motion/MotionProvider.tsx`
- `src/hooks/useMediaQuery.ts`
- `src/lib/homeMotion.ts`
- `scripts/verify-home.mjs`
- `scripts/homeMotion.test.mjs`
- `scripts/useMediaQuery.test.mjs`

## Skills

Найдены релевантные skills: `superpowers:using-superpowers`, `superpowers:test-driven-development`, `superpowers:verification-before-completion`, `nextjs-developer`, `full-output-enforcement`; `gpt-taskskill` не установлен.

Прочитаны: все перечисленные skills. Применены: `test-driven-development` для циклов RED/GREEN, `nextjs-developer` для корректной client boundary в App Router, `verification-before-completion` для свежих lint/typecheck/build/test evidence. `full-output-enforcement` использован для проверки полноты deliverables, а `using-superpowers` — для выбора workflow.

## Ограничения и TODO

- Единственная текущая browser failure — отсутствие `canvas[data-hero-canvas]`; это намеренно остаётся для Task 4.
- Предсуществующий вероятный favicon 404 не изменялся и остаётся вне Task 2.
- Нет canvas-компонентов в рамках Task 2; `useMediaQuery` подготовлен для их последующей desktop-only инициализации.

## Review fixes

### Исправлено

- `MotionProvider` теперь создаёт один стабильный `MediaQueryList` listener. При переключении `prefers-reduced-motion` он снимает Lenis, GSAP ticker, ScrollTrigger и readiness, а при возврате к normal motion создаёт их снова. `smoothWheel: true` сохранён.
- `data-motion-ready="true"` выставляется только после успешной инициализации Lenis/GSAP; при reduced mode и unmount атрибут снимается. `document.fonts.ready` проверяет актуальность lifecycle перед `ScrollTrigger.refresh()`.
- `sceneBlendAt(_, 0)` возвращает безопасный `{ index: 0, nextIndex: 0, blend: 0 }`.
- Normal-motion browser verifier собирает console/page errors, ждёт readiness, проверяет full → reduced → full lifecycle и продолжает только при отсутствии runtime-ошибок. Единственный известный console error от `favicon.ico` исключён по точному URL; остальные ошибки остаются fail-condition.

### TDD: RED → GREEN

1. До исправления выполнено:

   ```text
   $ node --no-warnings --test scripts/homeMotion.test.mjs scripts/useMediaQuery.test.mjs
   ✖ sceneBlendAt returns a safe first-scene state when no scenes exist
   actual: { index: -1, nextIndex: -1, blend: 0 }
   expected: { index: 0, nextIndex: 0, blend: 0 }
   ```

2. До lifecycle-исправления расширенный browser verifier не имел `data-motion-ready`. После добавления readiness он сначала подтвердил lifecycle и обнаружил только предсуществующий console 404 для favicon; он сохранён в сборе ошибок, но исключён по точному URL как ранее документированный внешний для Task 2 ресурс.

3. После минимальных исправлений выполнено:

   ```text
   $ node --no-warnings --test scripts/homeMotion.test.mjs scripts/useMediaQuery.test.mjs
   tests 5; pass 5; fail 0

   $ npm run lint
   exit 0

   $ npm run typecheck
   exit 0

   $ npm run build
   ✓ Compiled successfully
   ○ / (Static) prerendered as static content

   $ BASE_URL=http://127.0.0.1:3100 npm run verify:home
   AssertionError: The enhanced hero must expose its canvas
   actual: 0; expected: 1
   ```

   Browser verifier прошёл normal-motion readiness и live full → reduced → full transition без иных console/page errors, прежде чем достиг намеренно RED hero-canvas assertion Task 4.

### Изменённые файлы

- `src/components/home/motion/MotionProvider.tsx`
- `src/lib/homeMotion.ts`
- `scripts/homeMotion.test.mjs`
- `scripts/verify-home.mjs`
- `.superpowers/sdd/task-2-report.md`

### `useMediaQuery`

Существующий SSR test сохранён. В установленном наборе нет DOM renderer/test environment (`jsdom`, `happy-dom`, `react-test-renderer`), а hook пока не рендерится приложением; поэтому детерминированная проверка client update/change/remove listener потребовала бы добавления test framework или test-only архитектуры. По условию review это намеренно не добавлялось.

### Skills в review pass

Найдены: `superpowers:using-superpowers`, `superpowers:systematic-debugging`, `superpowers:test-driven-development`, `superpowers:verification-before-completion`, `nextjs-developer`. Прочитаны и применены: первые четыре для root-cause investigation, RED→GREEN и свежей verification evidence; `nextjs-developer` — для проверки сохранённой client boundary и static App Router build. Результат: lifecycle остаётся узким client component, без изменения архитектуры страницы.

## Review fixes — ownership and source-of-truth

### Исправлено

- `MotionProvider` передаёт lifecycle в `createMotionLifecycle`. Live full → reduced → full снимает и пересоздаёт только Lenis, GSAP ticker и readiness, не уничтожая scene-owned или иные независимые `ScrollTrigger`.
- Глобальный `ScrollTrigger.getAll().forEach(...kill())` сохранён только в `destroy()` для окончательного unmount самого provider. `smoothWheel: true` сохранён; единый `MediaQueryList` listener добавляется один раз и снимается при unmount.
- Старые требования к двум CTA и компактному поиску заменены точно в hero-разделе `PROJECT.md` и hero-строках `DESIGN_DIRECTION.md`: July 20 reference-precise directive имеет приоритет, hero — чистое центральное editorial-высказывание без ссылок. Scope остаётся homepage-only.

### TDD и test evidence

1. RED до production-кода:

   ```text
   $ node --no-warnings --test scripts/homeMotion.test.mjs scripts/useMediaQuery.test.mjs
   ERR_MODULE_NOT_FOUND: Cannot find module 'src/lib/motionLifecycle.ts'
   ```

2. GREEN после минимальной реализации `createMotionLifecycle`:

   ```text
   $ node --no-warnings --test scripts/homeMotion.test.mjs scripts/useMediaQuery.test.mjs
   tests 6; pass 6; fail 0
   ```

   Focused Node test `live preference changes preserve independently owned ScrollTriggers` подтверждает, что независимый trigger остаётся живым при full → reduced → full, а окончательная глобальная очистка вызывается только при `destroy()` provider. Новый test framework не добавлялся.

### Проверки

| Команда | Результат |
| --- | --- |
| `node --no-warnings --test scripts/homeMotion.test.mjs scripts/useMediaQuery.test.mjs` | passed; 6/6 |
| `npm run lint` | passed; exit 0 |
| `npm run typecheck` | passed; exit 0 |
| `npm run build` | passed; `/` статически пререндерен |
| `BASE_URL=http://127.0.0.1:3100 npm run verify:home` | ожидаемый единственный deferred RED: `The enhanced hero must expose its canvas`, actual 0, expected 1 |
| `git diff --check` | passed; whitespace errors отсутствуют |

### Изменённые файлы

- `src/lib/motionLifecycle.ts`
- `src/components/home/motion/MotionProvider.tsx`
- `scripts/homeMotion.test.mjs`
- `PROJECT.md`
- `DESIGN_DIRECTION.md`
- `.superpowers/sdd/task-2-report.md`

### Сохранённые Minor

- DOM-test concern для `useMediaQuery` сохранён как Minor: без установки test framework.
- Точное suppression favicon error сохранено как документированный Minor: favicon не изменялся.

### Skills

Найдены: `superpowers:using-superpowers`, `superpowers:systematic-debugging`, `superpowers:test-driven-development`, `superpowers:verification-before-completion`, `nextjs-developer`. Прочитаны и применены: `test-driven-development` обеспечил RED→GREEN, `systematic-debugging` выделил нарушение ownership, `nextjs-developer` подтвердил сохранение client boundary и static App Router build, `verification-before-completion` потребовал свежие результаты перед commit. `using-superpowers` использован для выбора workflow.
