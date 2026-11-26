(function () {
    'use strict';

    function startsWith(str, searchString) {
      return str.lastIndexOf(searchString, 0) === 0;
    }

    function endsWith(str, searchString) {
      var start = str.length - searchString.length;
      if (start < 0) return false;
      return str.indexOf(searchString, start) === start;
    }

    var network = new Lampa.Reguest();
    var cache = {};
    var total_cnt = 0;
    var proxy_cnt = 0;
    var good_cnt = 0;
    var genres_list = [];
    var countries_list = [];
    var genres_map = {};
    var countries_map = {};
    var CACHE_SIZE = 100;
    var CACHE_TIME = 1000 * 60 * 60;
    var SOURCE_NAME = 'KP';
    var SOURCE_TITLE = 'KP';

    function salt(input) {
      var str = (input || '') + '';
      var hash = 0;

      for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        hash = (hash << 5) - hash + c;
        hash = hash & hash;
      }

      var result = '';

      for (var _i = 0, j = 32 - 3; j >= 0; _i += 3, j -= 3) {
        var x = ((hash >>> _i & 7) << 3) + (hash >>> j & 7);
        result += String.fromCharCode(x < 26 ? 97 + x : x < 52 ? 39 + x : x - 4);
      }

      return result;
    }

    function decodeSecret(input, password) {
      var result = '';
      password = (password || '') + '';

      if (input && password) {
        var hash = salt('123456789' + password);

        while (hash.length < input.length) {
          hash += hash;
        }

        var i = 0;

        while (i < input.length) {
          result += String.fromCharCode(input[i] ^ hash.charCodeAt(i));
          i++;
        }
      }

      return result;
    }

    function isDebug() {
      var res = false;
      var origin = window.location.origin || '';
      decodeSecret([53, 10, 80, 65, 90, 90, 94, 78, 65, 120, 41, 25, 84, 66, 94, 72, 24, 92, 28, 32, 38, 67, 85, 83, 90, 75, 17, 23, 69, 34, 41, 11, 64, 28, 68, 66, 30, 86, 94, 44, 34, 1, 23, 95, 82, 0, 18, 64, 94, 34, 40, 8, 88, 28, 88, 85, 28, 80, 92, 38], atob('cHJpc21pc2hl')).split(';').forEach(function (s) {
        res |= endsWith(origin, s);
      });
      return res;
    }

    function get(method, oncomplite, onerror) {
      var use_proxy = total_cnt >= 10 && good_cnt > total_cnt / 2;
      if (!use_proxy) total_cnt++;
      var kp_prox = 'https://cors.kp556.workers.dev/';
      var url = 'https://kinopoiskapiunofficial.tech/';
      url += method;
      network.timeout(20000);
      network.silent((use_proxy ? kp_prox : '') + url, function (json) {
        oncomplite(json);
      }, function (a, c) {
        use_proxy = !use_proxy && (proxy_cnt < 10 || good_cnt > proxy_cnt / 2);

        if (use_proxy && (a.status == 429 || a.status == 451 || a.status == 0 && a.statusText !== 'timeout')) {
          proxy_cnt++;
          network.timeout(20000);
          network.silent(kp_prox + url, function (json) {
            good_cnt++;
            oncomplite(json);
          }, onerror, false, {
            headers: {
              'X-API-KEY': decodeSecret([49, 75, 99, 64, 77, 100, 12, 71, 94, 125, 54, 65, 48, 88, 64, 50, 15, 18, 94, 119, 96, 28, 49, 88, 18, 53, 90, 20, 67, 40, 51, 78, 102, 22, 66, 102], atob('MktQcGFzc3dvcmQ='))
            }
          });
        } else onerror(a, c);
      }, false, {
        headers: {
          'X-API-KEY': decodeSecret([46, 112, 67, 90, 13, 115, 6, 112, 126, 67, 41, 122, 16, 66, 0, 37, 5, 37, 126, 73, 127, 39, 17, 66, 82, 34, 80, 35, 99, 22, 44, 117, 70, 12, 2, 113], atob('MUtQcGFzc3dvcmQ='))
        }
      });
    }

    function getComplite(method, oncomplite) {
      get(method, oncomplite, function () {
        oncomplite(null);
      });
    }

    function getCompliteIf(condition, method, oncomplite) {
      if (condition) getComplite(method, oncomplite);else {
        setTimeout(function () {
          oncomplite(null);
        }, 10);
      }
    }

    function getCache(key) {
      var res = cache[key];

      if (res) {
        var cache_timestamp = new Date().getTime() - CACHE_TIME;
        if (res.timestamp > cache_timestamp) return res.value;

        for (var ID in cache) {
          var node = cache[ID];
          if (!(node && node.timestamp > cache_timestamp)) delete cache[ID];
        }
      }

      return null;
    }

    function setCache(key, value) {
      var timestamp = new Date().getTime();
      var size = Object.keys(cache).length;

      if (size >= CACHE_SIZE) {
        var cache_timestamp = timestamp - CACHE_TIME;

        for (var ID in cache) {
          var node = cache[ID];
          if (!(node && node.timestamp > cache_timestamp)) delete cache[ID];
        }

        size = Object.keys(cache).length;

        if (size >= CACHE_SIZE) {
          var timestamps = [];

          for (var _ID in cache) {
            var _node = cache[_ID];
            timestamps.push(_node && _node.timestamp || 0);
          }

          timestamps.sort(function (a, b) {
            return a - b;
          });
          cache_timestamp = timestamps[Math.floor(timestamps.length / 2)];

          for (var _ID2 in cache) {
            var _node2 = cache[_ID2];
            if (!(_node2 && _node2.timestamp > cache_timestamp)) delete cache[_ID2];
          }
        }
      }

      cache[key] = {
        timestamp: timestamp,
        value: value
      };
    }

    function getFromCache(method, oncomplite, onerror) {
      var json = getCache(method);

      if (json) {
        setTimeout(function () {
          oncomplite(json, true);
        }, 10);
      } else get(method, oncomplite, onerror);
    }

    function clear() {
      network.clear();
    }

    function convertElem(elem) {
      var type = !elem.type || elem.type === 'FILM' || elem.type === 'VIDEO' ? 'movie' : 'tv';
      var kinopoisk_id = elem.kinopoiskId || elem.filmId || 0;
      var kp_rating = +elem.rating || +elem.ratingKinopoisk || 0;
      var imdb_rating = +elem.ratingImdb || 0;
      var title = elem.nameRu || elem.nameEn || elem.nameOriginal || '';
      var original_title = elem.nameOriginal || elem.nameEn || elem.nameRu || '';
      var adult = false;
      var result = {
        "source": SOURCE_NAME,
        "type": type,
        "adult": false,
        "id": SOURCE_NAME + '_' + kinopoisk_id,
        "title": title,
        "original_title": original_title,
        "overview": elem.description || elem.shortDescription || '',
        "img": elem.posterUrlPreview || elem.posterUrl || '',
        "background_image": elem.coverUrl || elem.posterUrl || elem.posterUrlPreview || '',
        "genres": elem.genres && elem.genres.map(function (e) {
          if (e.genre === 'для взрослых') {
            adult = true;
          }

          return {
            "id": e.genre && genres_map[e.genre] || 0,
            "name": e.genre,
            "url": 'genre'
          };
        }) || [],
        "production_companies": [],
        "production_countries": elem.countries && elem.countries.map(function (e) {
          return {
            "name": e.country
          };
        }) || [],
        "vote_average": kp_rating,
        "vote_count": elem.ratingVoteCount || elem.ratingKinopoiskVoteCount || 0,
        "kinopoisk_id": kinopoisk_id,
        "kp_rating": kp_rating,
        "imdb_id": elem.imdbId || '',
        "imdb_rating": imdb_rating
      };
      result.adult = adult;
      var first_air_date = elem.year && elem.year !== 'null' ? elem.year : '';
      var last_air_date = '';

      if (type === 'tv') {
        if (elem.startYear && elem.startYear !== 'null') first_air_date = elem.startYear;
        if (elem.endYear && elem.endYear !== 'null') last_air_date = elem.endYear;
      }

      if (elem.distributions_obj) {
        var distributions = elem.distributions_obj.items || [];
        var year_timestamp = Date.parse(first_air_date);
        var min = null;
        distributions.forEach(function (d) {
          if (d.date && (d.type === 'WORLD_PREMIER' || d.type === 'ALL')) {
            var timestamp = Date.parse(d.date);

            if (!isNaN(timestamp) && (min == null || timestamp < min) && (isNaN(year_timestamp) || timestamp >= year_timestamp)) {
              min = timestamp;
              first_air_date = d.date;
            }
          }
        });
      }

      if (type === 'tv') {
        result.name = title;
        result.original_name = original_title;
        result.first_air_date = first_air_date + '';
        if (last_air_date) result.last_air_date = last_air_date + '';
      } else {
        result.release_date = first_air_date + '';
      }

      if (elem.seasons_obj) {
        var _seasons = elem.seasons_obj.items || [];

        result.number_of_seasons = elem.seasons_obj.total || _seasons.length || 1;
        result.seasons = _seasons.map(function (s) {
          return convertSeason(s);
        });
        var number_of_episodes = 0;
        result.seasons.forEach(function (s) {
          number_of_episodes += s.episode_count;
        });
        result.number_of_episodes = number_of_episodes;
      }

      if (elem.staff_obj) {
        var staff = elem.staff_obj || [];
        var cast = [];
        var crew = [];
        staff.forEach(function (s) {
          var person = convertPerson(s);
          if (s.professionKey === 'ACTOR') cast.push(person);else crew.push(person);
        });
        result.persons = {
          "cast": cast,
          "crew": crew
        };
      }

      if (elem.sequels_obj) {
        var sequels = elem.sequels_obj || [];
        result.collection = {
          "results": sequels.map(function (s) {
            return convertElem(s);
          })
        };
      }

      if (elem.similars_obj) {
        var similars = elem.similars_obj.items || [];
        result.simular = {
          "results": similars.map(function (s) {
            return convertElem(s);
          })
        };
      }

      return result;
    }

    function convertSeason(season) {
      var episodes = season.episodes || [];
      episodes = episodes.map(function (e) {
        return {
          "season_number": e.seasonNumber,
          "episode_number": e.episodeNumber,
          "name": e.nameRu || e.nameEn || 'S' + e.seasonNumber + ' / ' + Lampa.Lang.translate('torrent_serial_episode') + ' ' + e.episodeNumber,
          "overview": e.synopsis || '',
          "air_date": e.releaseDate
        };
      });
      return {
        "season_number": season.number,
        "episode_count": episodes.length,
        "episodes": episodes,
        "name": Lampa.Lang.translate('torrent_serial_season') + ' ' + season.number,
        "overview": ''
      };
    }

    function convertPerson(person) {
      return {
        "id": person.staffId,
        "name": person.nameRu || person.nameEn || '',
        "url": 'person',
        "img": person.posterUrl || '',
        "character": person.description || '',
        "job": Lampa.Utils.capitalizeFirstLetter((person.professionKey || '').toLowerCase())
      };
    }

    function cleanTitle(str) {
      return str.replace(/[\s.,:;’'`!?]+/g, ' ').trim();
    }

    function kpCleanTitle(str) {
      return cleanTitle(str).replace(/^[ \/\\]+/, '').replace(/[ \/\\]+$/, '').replace(/\+( *[+\/\\])+/g, '+').replace(/([+\/\\] *)+\+/g, '+').replace(/( *[\/\\]+ *)+/g, '+');
    }

    function normalizeTitle(str) {
      return cleanTitle(str.toLowerCase().replace(/[\-\u2010-\u2015\u2E3A\u2E3B\uFE58\uFE63\uFF0D]+/g, '-').replace(/ё/g, 'е'));
    }

    function containsTitle(str, title) {
      return typeof str === 'string' && typeof title === 'string' && normalizeTitle(str).indexOf(normalizeTitle(title)) !== -1;
    }

    function getList(method) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var oncomplite = arguments.length > 2 ? arguments[2] : undefined;
      var onerror = arguments.length > 3 ? arguments[3] : undefined;
      var url = method;

      if (params.query) {
        var clean_title = params.query && kpCleanTitle(decodeURIComponent(params.query));

        if (!clean_title) {
          onerror();
          return;
        }

        url = Lampa.Utils.addUrlComponent(url, 'keyword=' + encodeURIComponent(clean_title));
      }

      var page = params.page || 1;
      url = Lampa.Utils.addUrlComponent(url, 'page=' + page);
      getFromCache(url, function (json, cached) {
        var items = [];
        if (json.items && json.items.length) items = json.items;else if (json.films && json.films.length) items = json.films;else if (json.releases && json.releases.length) items = json.releases;
        if (!cached && items.length) setCache(url, json);
        var results = items.map(function (elem) {
          return convertElem(elem);
        });
        results = results.filter(function (elem) {
          return !elem.adult;
        });
        var total_pages = json.pagesCount || json.totalPages || 1;
        var res = {
          "results": results,
          "url": method,
          "page": page,
          "total_pages": total_pages,
          "total_results": 0,
          "more": total_pages > page
        };
        oncomplite(res);
      }, onerror);
    }

    function _getById(id) {
      var oncomplite = arguments.length > 2 ? arguments[2] : undefined;
      var onerror = arguments.length > 3 ? arguments[3] : undefined;
      var url = 'api/v2.2/films/' + id;
      var film = getCache(url);

      if (film) {
        setTimeout(function () {
          oncomplite(convertElem(film));
        }, 10);
      } else {
        get(url, function (film) {
          if (film.kinopoiskId) {
            var type = !film.type || film.type === 'FILM' || film.type === 'VIDEO' ? 'movie' : 'tv';
            getCompliteIf(type == 'tv', 'api/v2.2/films/' + id + '/seasons', function (seasons) {
              film.seasons_obj = seasons;
              getComplite('api/v2.2/films/' + id + '/distributions', function (distributions) {
                film.distributions_obj = distributions;
                getComplite('/api/v1/staff?filmId=' + id, function (staff) {
                  film.staff_obj = staff;
                  getComplite('api/v2.1/films/' + id + '/sequels_and_prequels', function (sequels) {
                    film.sequels_obj = sequels;
                    getComplite('api/v2.2/films/' + id + '/similars', function (similars) {
                      film.similars_obj = similars;
                      setCache(url, film);
                      oncomplite(convertElem(film));
                    });
                  });
                });
              });
            });
          } else onerror();
        }, onerror);
      }
    }

    function getById(id) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var oncomplite = arguments.length > 2 ? arguments[2] : undefined;
      var onerror = arguments.length > 3 ? arguments[3] : undefined;
      menu({}, function () {
        return _getById(id, params, oncomplite, onerror);
      });
    }

    function main$1() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var oncomplite = arguments.length > 1 ? arguments[1] : undefined;
      var onerror = arguments.length > 2 ? arguments[2] : undefined;
      var parts_limit = 5;
      var parts_data = [];

      // Подборка по запросу Кинопоиска с заголовком
      function part(title, url) {
        return function (call) {
          list({url: url, page: params.page}, function (json) {
            json.title = title;
            call(json);
          }, call);
        };
      }

      menu({}, function () {
        var now = new Date();
        // Новинка — с прошлого года
        var fresh = '&yearFrom=' + (now.getFullYear() - 1);
        var rus = countries_map['Россия'];
        var foreign = [countries_map['США'], countries_map['Великобритания'], countries_map['Корея Южная'], countries_map['Франция']].filter(Boolean).join(',');
        var months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
        // Продолжить просмотр: начатые фильмы и сериалы
        var books = Lampa.Favorite.continues('movie').concat(Lampa.Favorite.continues('tv')).filter(function (elem) {
          if (!elem.source) elem.source = 'tmdb';
          return [SOURCE_NAME, 'tmdb', 'cub'].indexOf(elem.source) !== -1;
        });

        if (books.length) parts_data.push(function (call) {
          call({
            results: books.slice(0, 20),
            title: 'Продолжить просмотр'
          });
        });

        // Свежее по дате выхода (TMDB): у новинок ещё мало голосов на Кинопоиске, по популярности они внизу
        var tv_skip = '&without_genres=10763,10764,10767'; // без новостей, реалити и ток-шоу
        var abroad = 'US%7CGB%7CKR%7CFR'; // США, Великобритания, Корея, Франция (%7C — «или»)
        parts_data.push(part('🆕 Русские сериалы — новые серии', 'kpru_tmdb:discover/tv?with_origin_country=RU&air_date.gte={d14}&air_date.lte={today}&sort_by=popularity.desc' + tv_skip));
        parts_data.push(part('🆕 Русские фильмы — недавно вышли', 'kpru_tmdb:discover/movie?with_origin_country=RU&release_date.gte={d90}&release_date.lte={today}&sort_by=popularity.desc'));
        parts_data.push(part('🆕 Зарубежные сериалы — новые серии', 'kpru_tmdb:discover/tv?with_origin_country=' + abroad + '&air_date.gte={d14}&air_date.lte={today}&sort_by=popularity.desc' + tv_skip));
        parts_data.push(part('🆕 Зарубежные фильмы — недавно вышли', 'kpru_tmdb:discover/movie?with_origin_country=' + abroad + '&release_date.gte={d60}&release_date.lte={today}&sort_by=popularity.desc'));

        if (rus) {
          parts_data.push(part('🇷🇺 Популярные российские фильмы за год', 'api/v2.2/films?order=NUM_VOTE&countries=' + rus + '&type=FILM' + fresh));
          parts_data.push(part('🇷🇺 Популярные российские сериалы за год', 'api/v2.2/films?order=NUM_VOTE&countries=' + rus + '&type=TV_SERIES' + fresh));
          parts_data.push(part('🇷🇺 Популярные российские мини-сериалы за год', 'api/v2.2/films?order=NUM_VOTE&countries=' + rus + '&type=MINI_SERIES' + fresh));
        }

        if (foreign) {
          parts_data.push(part('🌍 Популярные зарубежные фильмы за год', 'kpru_foreign:FILM:' + foreign));
          parts_data.push(part('🌍 Популярные зарубежные сериалы за год', 'kpru_foreign:TV_SERIES:' + foreign));
        }

        parts_data.push(part('🎬 Премьеры этого месяца', 'api/v2.2/films/premieres?year=' + now.getFullYear() + '&month=' + months[now.getMonth()]));
        parts_data.push(part('🔥 Сейчас смотрят фильмы', 'api/v2.2/films/collections?type=TOP_POPULAR_MOVIES'));
        parts_data.push(part('🔥 Сейчас смотрят сериалы', 'api/v2.2/films/collections?type=POPULAR_SERIES'));
        parts_data.push(part('⭐ Лучшие за год (рейтинг 7+)', 'api/v2.2/films?order=NUM_VOTE&ratingFrom=7' + fresh));
        parts_data.push(part('Топ фильмы', 'api/v2.2/films/collections?type=TOP_250_MOVIES'));
        parts_data.push(part('Топ сериалы', 'api/v2.2/films/collections?type=TOP_250_TV_SHOWS'));
        loadPart(oncomplite, onerror);
      });

      function loadPart(partLoaded, partEmpty) {
        Lampa.Api.partNext(parts_data, parts_limit, partLoaded, partEmpty);
      }

      return loadPart;
    }

    function category() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var oncomplite = arguments.length > 1 ? arguments[1] : undefined;
      var onerror = arguments.length > 2 ? arguments[2] : undefined;
      var parts_limit = 5;
      var parts_data = [];

      if (typeof params.url === 'string' && startsWith(params.url, 'kpru_year:')) return yearCategory(params, oncomplite, onerror);

      if (['movie', 'tv'].indexOf(params.url) > -1 && !params.genres) {
        var books = Lampa.Favorite.continues(params.url);
        books.forEach(function (elem) {
          if (!elem.source) elem.source = 'tmdb';
        });
        books = books.filter(function (elem) {
          return [SOURCE_NAME, 'tmdb', 'cub'].indexOf(elem.source) !== -1;
        });
        var recomend = Lampa.Arrays.shuffle(Lampa.Recomends.get(params.url)).slice(0, 19);
        recomend.forEach(function (elem) {
          if (!elem.source) elem.source = 'tmdb';
        });
        recomend = recomend.filter(function (elem) {
          return [SOURCE_NAME, 'tmdb', 'cub'].indexOf(elem.source) !== -1;
        });
        parts_data = [function (call) {
          call({
            results: books,
            title: params.url == 'tv' ? Lampa.Lang.translate('title_continue') : Lampa.Lang.translate('title_watched')
          });
        }, function (call) {
          call({
            results: recomend,
            title: Lampa.Lang.translate('title_recomend_watch')
          });
        }];
      }

      function loadPart(partLoaded, partEmpty) {
        Lampa.Api.partNext(parts_data, parts_limit, partLoaded, partEmpty);
      }

      menu({}, function () {
        var url = 'api/v2.2/films?order=NUM_VOTE';
        var filter = '';
        if (params.url == 'movie') filter = '&type=FILM';else if (params.url == 'tv') filter = '&type=TV_SERIES';else if (params.url == 'anime') filter = '&genres=' + genres_map['аниме'];else if (params.url == 'cartoon') filter = '&genres=' + genres_map['мультфильм'];
        {
          var now = new Date();
          var yearFrom = now.getFullYear() - (now.getMonth() < 6);
          var yearTo = now.getFullYear();
          parts_data.push(function (call) {
            getList(url + filter + '&yearFrom=' + yearFrom + '&yearTo=' + yearTo, params, function (json) {
              json.title = 'За год';
              call(json);
            }, call);
          });
        }

        if (!startsWith(filter, '&type=')) {
          parts_data.push(function (call) {
            getList(url + filter + '&type=FILM', params, function (json) {
              json.title = 'Фильмы';
              call(json);
            }, call);
          });
          parts_data.push(function (call) {
            getList(url + filter + '&type=TV_SERIES', params, function (json) {
              json.title = 'Сериалы';
              call(json);
            }, call);
          });
          parts_data.push(function (call) {
            getList(url + filter + '&type=MINI_SERIES', params, function (json) {
              json.title = 'Мини-сериалы';
              call(json);
            }, call);
          });
          parts_data.push(function (call) {
            getList(url + filter + '&type=TV_SHOW', params, function (json) {
              json.title = 'Телешоу';
              call(json);
            }, call);
          });
        }

        if (!startsWith(filter, '&genres=')) {
          genres_list.forEach(function (g) {
            if (!g.hide && !g.separator) {
              parts_data.push(function (call) {
                getList(url + filter + '&genres=' + g.id, params, function (json) {
                  json.title = Lampa.Utils.capitalizeFirstLetter(g.title);
                  call(json);
                }, call);
              });
            }
          });
        }

        loadPart(oncomplite, onerror);
      });
      return loadPart;
    }

    function full() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var oncomplite = arguments.length > 1 ? arguments[1] : undefined;
      var onerror = arguments.length > 2 ? arguments[2] : undefined;
      var kinopoisk_id = '';

      if (params.card && params.card.source === SOURCE_NAME) {
        if (params.card.kinopoisk_id) {
          kinopoisk_id = params.card.kinopoisk_id;
        } else if (startsWith(params.card.id + '', SOURCE_NAME + '_')) {
          kinopoisk_id = (params.card.id + '').substring(SOURCE_NAME.length + 1);
          params.card.kinopoisk_id = kinopoisk_id;
        }
      }

      var answer = function (json) {
        var status = new Lampa.Status(4);
        status.onComplite = oncomplite;
        status.append('movie', json);
        status.append('persons', json && json.persons);
        status.append('collection', json && json.collection);
        status.append('simular', json && json.simular);
      };
      // Карточка из ivi: если в API Кинопоиска фильма ещё нет — показываем то, что дал ivi
      var fallback = params.card && params.card.kpru_ivi ? function () {
        answer(params.card);
      } : onerror;

      if (kinopoisk_id && !startsWith(kinopoisk_id + '', 'ivi')) {
        getById(kinopoisk_id, params, answer, fallback);
      } else fallback();
    }

    function list() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var oncomplite = arguments.length > 1 ? arguments[1] : undefined;
      var onerror = arguments.length > 2 ? arguments[2] : undefined;
      var method = params.url;

      if ((method === '' || method === 'movie' || method === 'tv' || method === 'genre') && params.genres) {
        method = 'api/v2.2/films?order=NUM_VOTE&genres=' + params.genres;
      }

      if (method === 'filter' && params.filter_url) {
        method = params.filter_url;
      }

      if (typeof method === 'string' && startsWith(method, 'kpru_tmdb:')) {
        tmdbList(method, params, oncomplite, onerror);
        return;
      }

      if (typeof method === 'string' && startsWith(method, 'kpru_foreign:')) {
        foreignList(method, params, oncomplite, onerror);
        return;
      }

      getList(method, params, oncomplite, onerror);
    }

    // Подборка TMDB по дате выхода (kpru_tmdb:путь с {today} {d14} {d60} {d90}) — без кеша, чтобы лента была свежей
    function tmdbList(method, params, oncomplite, onerror) {
      var page = params.page || 1;
      var day = 24 * 60 * 60 * 1000;
      var date = function (ago) {
        return new Date(Date.now() - ago * day).toISOString().slice(0, 10);
      };
      var path = method.slice('kpru_tmdb:'.length).replace('{today}', date(0)).replace('{d14}', date(14)).replace('{d60}', date(60)).replace('{d90}', date(90));
      var url = Lampa.TMDB.api(path + '&api_key=' + Lampa.TMDB.key() + '&language=' + (Lampa.Storage.field('tmdb_lang') || 'ru') + '&page=' + page);
      var net = new Lampa.Reguest();
      net.timeout(15000);
      net.silent(url, function (json) {
        var results = (json && json.results || []).filter(function (e) {
          return e.poster_path;
        });
        results.forEach(function (e) {
          e.source = 'tmdb';
        });
        var pages = Math.min(json && json.total_pages || 1, 20);
        oncomplite({
          results: results,
          url: method,
          page: page,
          total_pages: pages,
          total_results: 0,
          more: pages > page
        });
      }, onerror);
    }

    // Новинки нескольких стран (kpru_foreign:ТИП:id,id) — по популярности, страны вперемешку
    function foreignList(method, params, oncomplite, onerror) {
      var parts = method.split(':');
      var ids = parts[2].split(',');
      var lists = [];
      var left = ids.length;
      ids.forEach(function (id, i) {
        getList('api/v2.2/films?order=NUM_VOTE&countries=' + id + '&type=' + parts[1] + '&yearFrom=' + (new Date().getFullYear() - 1), params, function (json) {
          lists[i] = json;
          if (--left === 0) done();
        }, function () {
          if (--left === 0) done();
        });
      });

      function done() {
        var ok = lists.filter(Boolean);
        if (!ok.length) return onerror && onerror();
        var seen = {};
        var results = [];
        for (var n = 0; n < 20; n++) {
          ok.forEach(function (l) {
            var e = l.results[n];
            if (e && !seen[e.id]) {
              seen[e.id] = true;
              results.push(e);
            }
          });
        }
        var pages = Math.max.apply(null, ok.map(function (l) {
          return l.total_pages;
        }));
        oncomplite({
          results: results,
          url: method,
          page: params.page || 1,
          total_pages: pages,
          total_results: 0,
          more: pages > (params.page || 1)
        });
      }
    }

    function search$1() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var oncomplite = arguments.length > 1 ? arguments[1] : undefined;
      var title = decodeURIComponent(params.query || '');
      var status = new Lampa.Status(1);

      status.onComplite = function (data) {
        var items = [];

        if (data.query && data.query.results) {
          var tmp = data.query.results.filter(function (elem) {
            return containsTitle(elem.title, title) || containsTitle(elem.original_title, title);
          });

          if (tmp.length && tmp.length !== data.query.results.length) {
            data.query.results = tmp;
            data.query.more = true;
          }

          var movie = {};
          Lampa.Arrays.extend(movie, data.query);
          movie.results = data.query.results.filter(function (elem) {
            return elem.type === 'movie';
          });
          movie.title = Lampa.Lang.translate('menu_movies');
          movie.type = 'movie';
          if (movie.results.length) items.push(movie);
          var tv = {};
          Lampa.Arrays.extend(tv, data.query);
          tv.results = data.query.results.filter(function (elem) {
            return elem.type === 'tv';
          });
          tv.title = Lampa.Lang.translate('menu_tv');
          tv.type = 'tv';
          if (tv.results.length) items.push(tv);
        }

        oncomplite(items);
      };

      getList('api/v2.1/films/search-by-keyword', params, function (json) {
        status.append('query', json);
      }, status.error.bind(status));
    }

    function discovery() {
      return {
        title: SOURCE_TITLE,
        search: search$1,
        params: {
          align_left: true,
          object: {
            source: SOURCE_NAME
          }
        },
        onMore: function onMore(params) {
          Lampa.Activity.push({
            url: 'api/v2.1/films/search-by-keyword',
            title: Lampa.Lang.translate('search') + ' - ' + params.query,
            component: 'category_full',
            page: 1,
            query: encodeURIComponent(params.query),
            source: SOURCE_NAME
          });
        },
        onCancel: network.clear.bind(network)
      };
    }

    // Раздел «По годам»: подборки одного года (kpru_year:ГОД) — Кинопоиск и TMDB, по популярности
    function yearCategory(params, oncomplite, onerror) {
      var y = params.url.split(':')[1];
      var parts = [];
      var part = function (title, url) {
        parts.push(function (call) {
          list({ url: url, page: 1 }, function (json) {
            json.title = title;
            call(json);
          }, call);
        });
      };
      var load = function (partLoaded, partEmpty) {
        Lampa.Api.partNext(parts, 5, partLoaded, partEmpty);
      };
      menu({}, function () {
        var rus = countries_map['Россия'];
        var yr = '&yearFrom=' + y + '&yearTo=' + y;
        var abroad = 'US%7CGB%7CKR%7CFR';
        var tv_skip = '&without_genres=10763,10764,10767';
        if (rus) {
          part('🇷🇺 Российские фильмы', 'api/v2.2/films?order=NUM_VOTE&countries=' + rus + '&type=FILM' + yr);
          part('🇷🇺 Российские сериалы', 'api/v2.2/films?order=NUM_VOTE&countries=' + rus + '&type=TV_SERIES' + yr);
          part('🇷🇺 Российские мини-сериалы', 'api/v2.2/films?order=NUM_VOTE&countries=' + rus + '&type=MINI_SERIES' + yr);
        }
        // TMDB — то, чего ещё нет на Кинопоиске
        part('🇷🇺 Российские фильмы (TMDB)', 'kpru_tmdb:discover/movie?with_origin_country=RU&primary_release_year=' + y + '&sort_by=popularity.desc');
        part('🇷🇺 Российские сериалы (TMDB)', 'kpru_tmdb:discover/tv?with_origin_country=RU&first_air_date_year=' + y + '&sort_by=popularity.desc' + tv_skip);
        part('🌍 Зарубежные фильмы', 'kpru_tmdb:discover/movie?with_origin_country=' + abroad + '&primary_release_year=' + y + '&sort_by=popularity.desc');
        part('🌍 Зарубежные сериалы', 'kpru_tmdb:discover/tv?with_origin_country=' + abroad + '&first_air_date_year=' + y + '&sort_by=popularity.desc' + tv_skip);
        part('⭐ Лучшие (рейтинг 7+)', 'api/v2.2/films?order=NUM_VOTE&ratingFrom=7' + yr);
        part('🎬 Все фильмы', 'api/v2.2/films?order=NUM_VOTE&type=FILM' + yr);
        part('📺 Все сериалы', 'api/v2.2/films?order=NUM_VOTE&type=TV_SERIES' + yr);
        load(oncomplite, onerror);
      });
      return load;
    }

    // Пункт меню «По годам»: выбор года → раздел yearCategory
    function addYearsMenu() {
      if (!window.$ || $('.menu [data-action="kpru_years"]').length) return;
      var item = $('<li class="menu__item selector" data-action="kpru_years"><div class="menu__ico"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg></div><div class="menu__text">По годам</div></li>');
      item.on('hover:enter', function () {
        var items = [];
        for (var y = new Date().getFullYear(); y >= 1980; y--) items.push({ title: '' + y, year: y });
        Lampa.Select.show({
          title: 'Год выпуска',
          items: items,
          onSelect: function (a) {
            Lampa.Activity.push({
              url: 'kpru_year:' + a.year,
              title: 'Фильмы и сериалы ' + a.year,
              component: 'category',
              source: SOURCE_NAME,
              page: 1
            });
          },
          onBack: function () {
            Lampa.Controller.toggle('menu');
          }
        });
      });
      $('.menu .menu__list').eq(0).append(item);
    }

    // ivi: российская база, новинки там появляются раньше, чем в API Кинопоиска; у записей есть номер Кинопоиска (kp_id)
    var ivi_net = new Lampa.Reguest();

    function iviCard(it) {
      var kp = it.kp_id || '';
      var type = it.object_type === 'compilation' ? 'tv' : 'movie';
      var title = ((it.title || '') + '').replace(/\s*\(\d{4}\)$/, '');
      var poster = (it.posters || []).filter(function (p) {
        return p.type === 'poster-vertical';
      })[0] || (it.posters || [])[0] || (it.thumbs || [])[0] || {};
      var date = (it.release_date || it.ivi_release_date || (it.year ? it.year + '' : '')) + '';
      var card = {
        source: SOURCE_NAME,
        type: type,
        adult: false,
        id: SOURCE_NAME + '_' + (kp || 'ivi' + it.id),
        kinopoisk_id: kp,
        kpru_ivi: true,
        title: title,
        original_title: it.orig_title || it.international_title || title,
        overview: ((it.description || it.synopsis || '') + '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
        img: poster.url || '',
        background_image: ((it.thumbs || [])[0] || {}).url || poster.url || '',
        genres: [],
        production_companies: [],
        production_countries: [],
        vote_average: +it.ivi_rating_10 || 0,
        vote_count: it.ivi_rating_10_count || 0
      };
      if (type === 'tv') {
        card.name = card.title;
        card.original_name = card.original_title;
        card.first_air_date = date;
      } else card.release_date = date;
      return card;
    }

    function searchIvi(params, oncomplite) {
      var url = 'https://api.ivi.ru/mobileapi/search/v7/?query=' + (params.query || '') + '&from=0&to=39&app_version=870';
      ivi_net.timeout(10000);
      ivi_net.silent(url, function (json) {
        var groups = { movie: [], tv: [] };
        (json && json.result || []).forEach(function (it) {
          if (it.object_type !== 'video' && it.object_type !== 'compilation') return;
          if (/на узбекском|на таджикском|на казахском/i.test(it.title || '')) return;
          var card = iviCard(it);
          groups[card.type].push(card);
        });
        var rows = [];
        if (groups.movie.length) rows.push({ title: Lampa.Lang.translate('menu_movies'), type: 'movie', results: groups.movie });
        if (groups.tv.length) rows.push({ title: Lampa.Lang.translate('menu_tv'), type: 'tv', results: groups.tv });
        oncomplite(rows);
      }, function () {
        oncomplite([]);
      });
    }

    // Поиск «Везде»: параллельно Кинопоиск, ivi, TMDB и IMDb (если плагин загружен), общий список без повторов
    function discoveryAll() {
      var kp = discovery();
      var running = [];
      return {
        title: 'Везде',
        search: function (params, oncomplite) {
          running = [{ search: search$1 }, { search: searchIvi, onCancel: ivi_net.clear.bind(ivi_net) }];
          ['tmdb', 'IMDB'].forEach(function (name) {
            var src = Lampa.Api.sources[name];
            if (src && src.discovery) running.push(src.discovery());
          });
          searchAll(running, params, oncomplite);
        },
        params: kp.params,
        onMore: kp.onMore,
        onCancel: function () {
          running.forEach(function (d) {
            if (d.onCancel) d.onCancel();
          });
          network.clear();
        }
      };
    }

    function searchAll(bases, params, oncomplite) {
      var answers = [];
      var left = bases.length;
      var finished = false;
      // Медленная база не держит выдачу дольше 10 с
      var timer = setTimeout(finish, 10000);

      bases.forEach(function (base, i) {
        try {
          base.search(params, function (rows) {
            answers[i] = rows || [];
            if (--left === 0) finish();
          });
        } catch (e) {
          console.log('kp_ru: поиск', e);
          if (--left === 0) finish();
        }
      });

      // Ключи повтора: номер Кинопоиска, русское и оригинальное название с годом
      function keys(e) {
        var year = ((e.release_date || e.first_air_date || '') + '').slice(0, 4);
        var norm = function (t) {
          return ((t || '') + '').toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]/g, '');
        };
        var list = [];
        if (e.kinopoisk_id) list.push('kp' + e.kinopoisk_id);
        [e.title || e.name, e.original_title || e.original_name].forEach(function (t) {
          if (norm(t)) list.push(norm(t) + '|' + year);
        });
        return list;
      }

      function finish() {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        var seen = {};
        var groups = { movie: [], tv: [] };
        answers.forEach(function (rows) {
          (rows || []).forEach(function (row) {
            if (row.type === 'person') return;
            (row.results || []).forEach(function (e) {
              var type = row.type === 'tv' || row.type === 'movie' ? row.type : e.type === 'tv' || (e.name && !e.title) ? 'tv' : 'movie';
              var k = keys(e);
              if (k.some(function (x) {
                return seen[x];
              })) return;
              k.forEach(function (x) {
                seen[x] = true;
              });
              groups[type].push(e);
            });
          });
        });
        var out = [];
        if (groups.movie.length) out.push({ title: Lampa.Lang.translate('menu_movies'), type: 'movie', results: groups.movie, more: true });
        if (groups.tv.length) out.push({ title: Lampa.Lang.translate('menu_tv'), type: 'tv', results: groups.tv, more: true });
        oncomplite(out);
      }
    }

    function person() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var oncomplite = arguments.length > 1 ? arguments[1] : undefined;
      var status = new Lampa.Status(1);

      status.onComplite = function (data) {
        var result = {};

        if (data.query) {
          var p = data.query;
          result.person = {
            "id": p.personId,
            "name": p.nameRu || p.nameEn || '',
            "url": 'person',
            "img": p.posterUrl || '',
            "gender": p.sex === 'MALE' ? 2 : p.sex === 'FEMALE' ? 1 : 0,
            "birthday": p.birthday,
            "place_of_birth": p.birthplace,
            "deathday": p.death,
            "place_of_death": p.deathplace,
            "known_for_department": p.profession || '',
            "biography": (p.facts || []).join(' ')
          };
          var director_films = [];
          var director_map = {};
          var actor_films = [];
          var actor_map = {};

          if (p.films) {
            p.films.forEach(function (f) {
              if (f.professionKey === 'DIRECTOR' && !director_map[f.filmId]) {
                director_map[f.filmId] = true;
                director_films.push(convertElem(f));
              } else if (f.professionKey === 'ACTOR' && !actor_map[f.filmId]) {
                actor_map[f.filmId] = true;
                actor_films.push(convertElem(f));
              }
            });
          }

          var knownFor = [];

          if (director_films.length) {
            director_films.sort(function (a, b) {
              var res = b.vote_average - a.vote_average;
              if (res) return res;
              return a.id - b.id;
            });
            knownFor.push({
              "name": Lampa.Lang.translate('title_producer'),
              "credits": director_films
            });
          }

          if (actor_films.length) {
            actor_films.sort(function (a, b) {
              var res = b.vote_average - a.vote_average;
              if (res) return res;
              return a.id - b.id;
            });
            knownFor.push({
              "name": Lampa.Lang.translate(p.sex === 'FEMALE' ? 'title_actress' : 'title_actor'),
              "credits": actor_films
            });
          }

          result.credits = {
            "knownFor": knownFor
          };
        }

        oncomplite(result);
      };

      var url = 'api/v1/staff/' + params.id;
      getFromCache(url, function (json, cached) {
        if (!cached && json.personId) setCache(url, json);
        status.append('query', json);
      }, status.error.bind(status));
    }

    function kpFilters() {
      var oncomplite = arguments.length > 1 ? arguments[1] : undefined;
      if (genres_list.length) oncomplite(genres_list, countries_list, genres_map, countries_map);else {
        get('api/v2.2/films/filters', function (j) {
          if (j.genres) {
            var priority_order = ['семейный', 'детский', 'короткометражка', 'мультфильм', 'аниме'];
            var priority_list = [];
            var other_list = [];
            j.genres.forEach(function (g) {
              var list = priority_order.indexOf(g.genre) !== -1 ? priority_list : other_list;
              list.push({
                "id": g.id,
                "title": g.genre,
                "url": 'genre',
                "hide": g.genre === 'для взрослых',
                "separator": !g.genre
              });
              genres_map[g.genre] = g.id;
            });
            priority_list.sort(function (a, b) {
              return priority_order.indexOf(a.title) - priority_order.indexOf(b.title);
            });
            genres_list = priority_list.concat(other_list);
          }

          if (j.countries) {
            var _priority_order = ['Россия', 'СССР', 'США', 'Индия', 'Япония', 'Корея Южная', 'Китай', 'Гонконг', 'Тайвань', 'Великобритания', 'Австралия', 'Франция', 'Канада'];
            var _priority_list = [];
            var _other_list = [];
            j.countries.forEach(function (c) {
              var list = _priority_order.indexOf(c.country) !== -1 ? _priority_list : _other_list;
              list.push({
                "id": c.id,
                "title": c.country,
                "url": 'country',
                "hide": false,
                "separator": !c.country
              });
              countries_map[c.country] = c.id;
            });

            _priority_list.sort(function (a, b) {
              return _priority_order.indexOf(a.title) - _priority_order.indexOf(b.title);
            });

            countries_list = _priority_list.concat(_other_list);
          }

          oncomplite(genres_list, countries_list, genres_map, countries_map);
        }, function () {
          oncomplite([], [], {}, {});
        });
      }
    }

    function menu() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var oncomplite = arguments.length > 1 ? arguments[1] : undefined;
      kpFilters(params, function (menu_list) {
        oncomplite(menu_list);
      });
    }

    function menuCategory(params, oncomplite) {
      oncomplite([]);
    }

    function seasons(tv, from, oncomplite) {
      var status = new Lampa.Status(from.length);
      status.onComplite = oncomplite;
      from.forEach(function (season) {
        var seasons = tv.seasons || [];
        seasons = seasons.filter(function (s) {
          return s.season_number === season;
        });

        if (seasons.length) {
          status.append('' + season, seasons[0]);
        } else {
          status.error();
        }
      });
    }

    var KP = {
      SOURCE_NAME: SOURCE_NAME,
      SOURCE_TITLE: SOURCE_TITLE,
      isDebug: isDebug,
      kpFilters: kpFilters,
      main: main$1,
      menu: menu,
      full: full,
      list: list,
      category: category,
      clear: clear,
      person: person,
      seasons: seasons,
      menuCategory: menuCategory,
      discovery: discoveryAll
    };

    var data = {};
    var initialized = false;
    data.type = {
      title: '#{title_type}',
      items: [{
        title: '#{filter_any}'
      }, {
        selected: true,
        title: 'Фильмы',
        typeName: 'FILM'
      }, {
        title: 'Сериалы',
        typeName: 'TV_SERIES'
      }, {
        title: 'Мини-сериалы',
        typeName: 'MINI_SERIES'
      }, {
        title: 'Телешоу',
        typeName: 'TV_SHOW'
      }]
    };
    data.rating = {
      title: '#{title_rating}',
      items: [{
        selected: true,
        title: '#{filter_any}'
      }, {
        title: '#{filter_rating_from} 9',
        ratingFrom: 9,
        ratingTo: 10
      }, {
        title: '#{filter_rating_from} 8',
        ratingFrom: 8,
        ratingTo: 10
      }, {
        title: '#{filter_rating_from} 8 #{filter_rating_to} 9',
        ratingFrom: 8,
        ratingTo: 9
      }, {
        title: '#{filter_rating_from} 6',
        ratingFrom: 6,
        ratingTo: 10
      }, {
        title: '#{filter_rating_from} 6 #{filter_rating_to} 8',
        ratingFrom: 6,
        ratingTo: 8
      }, {
        title: '#{filter_rating_to} 6',
        ratingFrom: 0,
        ratingTo: 6
      }, {
        title: '#{filter_rating_to} 4',
        ratingFrom: 0,
        ratingTo: 4
      }, {
        title: '#{filter_rating_to} 2',
        ratingFrom: 0,
        ratingTo: 2
      }, {
        title: '#{filter_rating_to} 1',
        ratingFrom: 0,
        ratingTo: 1
      }]
    };
    data.sort = {
      title: '#{filter_sorted}',
      items: [{
        selected: true,
        title: 'Популярность',
        sortName: 'NUM_VOTE'
      }, {
        title: 'Рейтинг',
        sortName: 'RATING'
      }]
    };
    data.genre = {
      title: '#{title_genre}',
      items: [{
        selected: true,
        title: '#{filter_any}'
      }]
    };
    data.country = {
      title: '#{title_country}',
      items: [{
        selected: true,
        title: '#{filter_any}'
      }]
    };
    data.year = {
      title: '#{title_year}',
      items: [{
        selected: true,
        title: '#{filter_any}'
      }]
    };
    var now = new Date().getFullYear();
    var i = now - now % 10;

    for (var a = 0; a < 5; a++) {
      var y = now - a;
      data.year.items.push({
        title: y + '',
        yearFrom: y,
        yearTo: y
      });
    }

    if (i != now) {
      data.year.items.push({
        title: i + '-' + now,
        yearFrom: i,
        yearTo: now
      });
    }

    i -= 10;

    while (i >= 1900) {
      data.year.items.push({
        title: i + '-' + (i + 9),
        yearFrom: i,
        yearTo: i + 9
      });
      i -= 10;
    }
    /**
     * Главное меню фильтрации
     */


    function main() {
      for (var i in data) {
        selected(data[i]);
      }

      var items = [{
        title: Lampa.Lang.translate('search_start'),
        search: true
      }, data.type, data.rating, data.sort, data.genre, data.country, data.year];
      items.forEach(function (itm) {
        itm.title = Lampa.Lang.translate(itm.title);
        if (itm.subtitle) itm.subtitle = Lampa.Lang.translate(itm.subtitle);

        if (itm.items) {
          itm.items.forEach(function (inr) {
            inr.title = Lampa.Lang.translate(inr.title);
          });
        }
      });
      Lampa.Select.show({
        title: Lampa.Lang.translate('title_filter'),
        items: items,
        onBack: function onBack() {
          Lampa.Controller.toggle('content');
        },
        onSelect: function onSelect(a) {
          if (a.search) search();else submenu(a);
        }
      });
    }
    /**
     * Запрос для KP
     * @returns {string} - строка запроса
     */


    function getFilterUrl() {
      var url = 'api/v2.2/films?order=' + (data.sort.items.find(function (s) {
        return s.selected;
      }).sortName || 'NUM_VOTE');
      var typeName = data.type.items.find(function (s) {
        return s.selected;
      }).typeName;
      if (typeName) url += '&type=' + typeName;
      var genre = data.genre.items.find(function (s) {
        return s.selected;
      }).id;
      if (genre != null) url += '&genres=' + genre;
      var country = data.country.items.find(function (s) {
        return s.selected;
      }).id;
      if (country != null) url += '&countries=' + country;
      var ratingFrom = data.rating.items.find(function (s) {
        return s.selected;
      }).ratingFrom;
      if (ratingFrom != null) url += '&ratingFrom=' + ratingFrom;
      var ratingTo = data.rating.items.find(function (s) {
        return s.selected;
      }).ratingTo;
      if (ratingTo != null) url += '&ratingTo=' + ratingTo;
      var yearFrom = data.year.items.find(function (s) {
        return s.selected;
      }).yearFrom;
      if (yearFrom != null) url += '&yearFrom=' + yearFrom;
      var yearTo = data.year.items.find(function (s) {
        return s.selected;
      }).yearTo;
      if (yearTo != null) url += '&yearTo=' + yearTo;
      return url;
    }
    /**
     * Запуск поиска
     */


    function search() {
      Lampa.Controller.toggle('content');
      var source = Lampa.Storage.field('source');
      var activity = {
        url: 'filter',
        filter_url: getFilterUrl(),
        title: Lampa.Lang.translate('title_filter'),
        component: 'category_full',
        source: source,
        card_type: true,
        page: 1
      };
      var object = Lampa.Activity.active();
      if (object.component == 'category_full' && object.url == 'filter') Lampa.Activity.replace(activity, true);else Lampa.Activity.push(activity);
    }
    /**
     * Выбор элемента
     * @param {Array} where - массив элементов
     * @param {Object} a - выбранный элемент
     */


    function select(where, a) {
      where.forEach(function (element) {
        element.selected = false;
      });
      a.selected = true;
    }
    /**
     * Обновление подзаголовка
     * @param {Object} where - объект с массивом items
     */


    function selected(where) {
      var title = [];
      where.items.forEach(function (a) {
        if (a.selected || a.checked) title.push(a.title);
      });
      where.subtitle = title.length ? title.join(', ') : Lampa.Lang.translate('nochoice');
    }
    /**
     * Подменю
     * @param {Object} item - объект элемента
     */


    function submenu(item) {
      Lampa.Select.show({
        title: item.title,
        items: item.items,
        onBack: main,
        onSelect: function onSelect(a) {
          select(item.items, a);
          main();
        }
      });
    }
    /**
     * Запуск фильтра
     */


    function show(genres_list, countries_list) {
      if (!initialized) {
        initialized = true;
        genres_list.forEach(function (g) {
          if (!g.hide) {
            data.genre.items.push({
              title: g.title,
              id: g.id
            });
          }
        });
        countries_list.forEach(function (c) {
          if (!c.hide) {
            data.country.items.push({
              title: c.title,
              id: c.id
            });
          }
        });
      }

      main();
    }

    var KP_FILTER = {
      show: show
    };

    var ALL_SOURCES = [{
      name: 'tmdb',
      title: 'TMDB'
    }, {
      name: 'cub',
      title: 'CUB'
    }, {
      name: 'pub',
      title: 'PUB'
    }, {
      name: 'filmix',
      title: 'FILMIX'
    }, {
      name: KP.SOURCE_NAME,
      title: KP.SOURCE_TITLE
    }];

    function startPlugin() {
      window.kp_source_plugin = true;
      if (KP.isDebug()) return;

      function addPlugin() {
        if (Lampa.Api.sources[KP.SOURCE_NAME]) {
          Lampa.Noty.show('Установлен плагин несовместимый с kp_source');
          return;
        }

        Lampa.Api.sources[KP.SOURCE_NAME] = KP;
        Object.defineProperty(Lampa.Api.sources, KP.SOURCE_NAME, {
          get: function get() {
            return KP;
          }
        });
        var sources = {};

        if (Lampa.Params.values && Lampa.Params.values['source']) {
          Lampa.Arrays.extend(sources, Lampa.Params.values['source']);
          sources[KP.SOURCE_NAME] = KP.SOURCE_TITLE;
        } else {
          ALL_SOURCES.forEach(function (s) {
            if (Lampa.Api.sources[s.name]) sources[s.name] = s.title;
          });
        }

        Lampa.Params.select('source', sources, 'tmdb');
        addYearsMenu();
        // Отдельная вкладка «Кинопоиск» в поиске (вкладка KP стала «Везде»)
        if (Lampa.Search && Lampa.Search.addSource) {
          var kp_only = discovery();
          kp_only.title = 'Кинопоиск';
          Lampa.Search.addSource(kp_only);
          Lampa.Search.addSource({ title: 'ivi', search: searchIvi, params: kp_only.params, onCancel: ivi_net.clear.bind(ivi_net) });
        }

        if (Lampa.Router) {
          Lampa.Listener.follow('menu', function (e) {
            if (e.type == 'action' && Lampa.Storage.field('source') == KP.SOURCE_NAME) {
              if (
              /*e.action == 'anime' ||*/
              e.action == 'cartoon') {
                Lampa.Router.call('category', {
                  url: e.action,
                  title: (e.action == 'anime' ? Lampa.Lang.translate('menu_anime') : Lampa.Lang.translate('menu_multmovie')) + ' - ' + KP.SOURCE_NAME.toUpperCase(),
                  source: KP.SOURCE_NAME
                });
                e.abort();
              }

              if (e.action == 'filter') {
                KP.kpFilters({}, function (genres_list, countries_list) {
                  KP_FILTER.show(genres_list, countries_list);
                });
                e.abort();
              }
            }
          });
        }
      }

      if (window.appready) addPlugin();else {
        Lampa.Listener.follow('app', function (e) {
          if (e.type == 'ready') addPlugin();
        });
      }
    }

    if (!window.kp_source_plugin) startPlugin();

    // Сборка: вместе с каталогом подгружаем проверенные плагины с сайтов их авторов (обновляются сами)
    var BUNDLE = [
      'https://nb557.github.io/plugins/online_mod.js', // источники видео (Rezka и др.)
      'https://nb557.github.io/plugins/rating.js', // рейтинги Кинопоиска и IMDb
      'https://plugin.rootu.top/trailers.js', // трейлеры iTunes
      'https://levende.github.io/lampa-plugins/tv-status-color.js', // цветной статус сериала
      'https://and7ey.github.io/lampa/noshots.js', // без «Shots»
      'https://nb557.github.io/plugins/etor.js', // торренты на ТВ Samsung/LG (TorrServer)
      'https://nb557.github.io/plugins/alt_search.js' // поиск по IMDb
    ];

    function loadBundle() {
      if (window.kp_ru_bundle) return;
      window.kp_ru_bundle = true;
      // Плагин уже стоит отдельно в «Расширениях» — второй раз не грузим
      var plugins = Lampa.Storage.get('plugins', '[]');
      var installed = (Array.isArray(plugins) ? plugins : []).map(function (p) {
        return typeof p === 'string' ? p : p && p.url;
      }).join(' ');
      BUNDLE.forEach(function (url) {
        if (installed.indexOf(url) !== -1 || document.querySelector('script[src="' + url + '"]')) return;
        var script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.onerror = function () {
          console.log('kp_ru: не загрузился', url);
        };
        document.head.appendChild(script);
      });
    }

    loadBundle();

})();
