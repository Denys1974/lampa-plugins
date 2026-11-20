# Плагины Lampa

`kp_ru.js` — копия `kp_source.js` (https://github.com/nb557/plugins), каталог Кинопоиска с витриной новинок на главной:
Продолжить просмотр → новые российские фильмы / сериалы / мини-сериалы → новые зарубежные фильмы / сериалы (США, Великобритания,
Южная Корея, Франция вперемешку) → премьеры месяца → сейчас смотрят → лучшие за год (7+) → топ.
Новинка — с прошлого года, внутри подборки — по популярности.

Адрес для Лампы: https://denys1974.github.io/lampa-plugins/kp_ru.js

Проверка: `node tests/check-main.js kp_ru.js` (заглушка Lampa, без сети).

## Сборка (подгружается вместе с каталогом, с сайтов авторов)
- Онлайн Мод — https://nb557.github.io/plugins/online_mod.js — источники видео (Rezka и др.)
- Rating — https://nb557.github.io/plugins/rating.js — рейтинги Кинопоиска и IMDb
- Trailers — https://plugin.rootu.top/trailers.js — трейлеры iTunes
- TV status color — https://levende.github.io/lampa-plugins/tv-status-color.js — цветной статус сериала
- No Shots — https://and7ey.github.io/lampa/noshots.js — убирает «Shots»

Отбор (2026-11-20, каталог lampaguide.com): только https (Лампа по https не грузит http), только читаемый код
(плагины bylampa запутаны — не взяты), без торрентов (нужен TorrServer). Если плагин уже стоит отдельно — повторно не грузится.
