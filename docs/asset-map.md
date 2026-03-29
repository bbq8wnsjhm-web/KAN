# Карта ассетов

Этот файл фиксирует, какие медиа сейчас реально используются сайтом, а какие лежат рядом как рабочие материалы.

## Подключено в страницах

| Страница | Файл | Подключённые медиа |
| --- | --- | --- |
| Главная | `index.html` | `media/main-bg.mp4`, `media/main-bg-poster.jpg` |
| Кто мы | `kto-my.html` | `media/kto-bg.mp4`, `media/kto-bg-poster.jpg` |
| Что мы делаем | `chto-my-delaem.html` | `media/what-bg.mp4`, `media/what-bg-poster.jpg` |
| Как найти | `kak-naiti.html` | `media/find-bg.mp4`, `media/find-bg-poster.jpg` |

## Live-шрифты

В боевом сайте используются локальные web-копии PT Root UI:

- `media/fonts/pt-root-ui/pt-root-ui-light.woff2`
- `media/fonts/pt-root-ui/pt-root-ui-regular.woff2`
- `media/fonts/pt-root-ui/pt-root-ui-medium.woff2`
- `media/fonts/pt-root-ui/pt-root-ui-bold.woff2`
- `media/fonts/pt-root-ui/OFL.txt`

## Что лежит в `media/`, но не является основным live-ассетом

На текущий момент неиспользуемые или заменённые master-материалы из `media/` вынесены в мастерскую `моушнсайт/archive/legacy-live`.

## Что лежит в мастерской `моушнсайт`

- `анимация/` — экспортированные ролики по сценам.
- `текст/` — отдельные текстовые заготовки для страниц.
- `fonts/pt-root-ui/master/` — мастер-файлы PT Root UI для проекта.
- `archive/legacy-live/` — старые или снятые с live master-ролики и заменённые версии ассетов.
- `archive/fonts/golos-ui/` — архив старого шрифта Golos, убранного из live-сайта.
- `Backup/`, `Log/` — служебные данные.

## Правило обновления

Когда мы подключаем новый ролик к странице:

1. Готовим финальный web-файл в `mp4`.
2. Кладём его в `media/`.
3. Обновляем ссылку в HTML.
4. Обновляем запись в этом файле.
5. Если мастер-источник остаётся важным, держим его в `моушнсайт/`, а не в live-папке.
