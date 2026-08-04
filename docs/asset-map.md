# Карта ассетов

Этот файл фиксирует только медиа, которые реально используются сайтом.

## Подключено в страницах

| Страница | Файл | Медиа |
| --- | --- | --- |
| Главная | `index.html` | `media/main-bg.mp4`, `media/main-bg-poster.jpg` |
| Кто мы | `kto-my.html` | `media/kto-bg.mp4`, `media/kto-bg-poster.jpg` |
| Что мы делаем | `chto-my-delaem.html` | `media/what-bg.mp4`, `media/what-bg-poster.jpg` |
| Как найти | `kak-naiti.html` | `media/find-bg.mp4`, `media/find-bg-poster.jpg`, `media/find-qr.png` |

## Шрифты

В сайте используются локальные web-копии PT Root UI:

- `media/fonts/pt-root-ui/pt-root-ui-light.woff2`
- `media/fonts/pt-root-ui/pt-root-ui-regular.woff2`
- `media/fonts/pt-root-ui/pt-root-ui-medium.woff2`
- `media/fonts/pt-root-ui/pt-root-ui-bold.woff2`
- `media/fonts/pt-root-ui/OFL.txt`

## Неиспользуемые материалы

В рабочей папке сайта не должны лежать:

- музыка и другие аудиофайлы для автозапуска;
- `.mov`-исходники;
- временные профили браузера;
- проверочные скриншоты;
- архивы и мастерские с черновыми материалами.

## Правило обновления

Когда подключаем новый ролик к странице:

1. Готовим финальную web-версию в `mp4` без аудио.
2. Проверяем размер файла до добавления в `media/`.
3. Кладём в `media/` только финальный файл и, если нужен, `poster`.
4. Обновляем ссылку в HTML.
5. Обновляем таблицу в этом файле.
