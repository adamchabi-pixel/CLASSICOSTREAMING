import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';
import { Analytics } from "@vercel/analytics/react";

// Silence specific benign console warnings and errors (such as WebSocket/HMR disconnects or subtitle resource 404s)
if (typeof window !== "undefined") {
  // Global fetch interceptor to automatically route /api requests to absolute backend when on production or Netlify
  const originalFetch = window.fetch;
  const customFetch = function (input: RequestInfo | URL, init?: RequestInit) {
    let url = "";
    if (typeof input === "string") {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else if (input && typeof input === "object" && "url" in input) {
      url = (input as any).url;
    }

    const isProduction = !!(import.meta as any).env?.PROD || (typeof process !== "undefined" && process?.env?.NODE_ENV === "production");
    const isNetlify = typeof window !== "undefined" && window.location && window.location.hostname && (!window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1") && !window.location.hostname.includes("run.app"));

    // The user explicitly requested to NOT use the ais-dev link in production.
    // However, on Netlify, there is no backend server. We must intercept the API calls
    // and make them directly to the true Jellyfin server!
    if (isNetlify && url.startsWith("/api/jellyfin/")) {
      const serverUrl = localStorage.getItem("classico_jellyfin_url") || "https://jellyfin-jacklumber00.siren.mygiga.cloud";
      const apiKey = localStorage.getItem("classico_jellyfin_apikey") || "a2aac09e434e4bcc897c1b181ca197eb";

      const formatItem = (item: any) => {
        const ticksToMinutes = (ticks: number) => {
          if (!ticks) return "0 min";
          const minutes = Math.round(ticks / 10000000 / 60);
          return `${minutes} min`;
        };
        return {
          id: item.Id,
          title: item.Name || "Film Sans Titre",
          originalTitle: item.OriginalTitle || "",
          providerIds: item.ProviderIds || {},
          studios: item.Studios?.map((s: any) => s.Name) || [],
          year: item.ProductionYear || new Date().getFullYear(),
          duration: ticksToMinutes(item.RunTimeTicks),
          rating: item.CommunityRating ? item.CommunityRating.toFixed(1) : "N/A",
          genre: item.Genres || [],
          description: item.Overview || "Aucun synopsis disponible pour ce titre sur Jellyfin.",
          director: item.People?.find((p: any) => p.Type === "Director")?.Name || "Réalisateur Inconnu",
          cast: item.People?.filter((p: any) => p.Type === "Actor").slice(0, 4).map((p: any) => p.Name) || [],
          castDetails: item.People?.filter((p: any) => p.Type === "Actor").slice(0, 8).map((p: any) => ({
            id: p.Id,
            name: p.Name,
            role: p.Role || "",
            imageUrl: p.PrimaryImageTag ? `${serverUrl}/Items/${p.Id}/Images/Primary?tag=${p.PrimaryImageTag}&quality=90&fillWidth=300&fillHeight=450` : undefined
          })) || [],
          posterUrl: `${serverUrl}/Items/${item.Id}/Images/Primary?fillHeight=600&fillWidth=400&quality=80`,
          backdropUrl: `${serverUrl}/Items/${item.Id}/Images/Backdrop?fillHeight=1080&fillWidth=1920&quality=90`,
          streamUrl: `${serverUrl}/Videos/${item.Id}/stream.mp4?Static=true&api_key=${apiKey}`,
          tagline: item.Taglines && item.Taglines.length > 0 ? item.Taglines[0] : "Disponible sur votre serveur",
          symbol: "📡🎬",
          accentColor: "text-[#ca8a04] border-[#ca8a04]/30 bg-[#ca8a04]/5",
          accentHex: "#ca8a04",
          isJellyfin: true
        };
      };

      if (url.includes("/api/jellyfin/movies")) {
        return (async () => {
          try {
            // Define background full refresh inside closure to inherit formatting & fetching helpers
            const triggerBackgroundRefresh = async () => {
              if ((window as any)._classico_is_refreshing) return;
              (window as any)._classico_is_refreshing = true;
              console.log("[CLIENT CACHE] Starting background fetch for full details (directors, actors)...");
              try {
                const userRes = await originalFetch(`${serverUrl}/Users?api_key=${apiKey}`);
                let uId = "";
                if (userRes.ok) {
                  const users = await userRes.json();
                  if (users && users.length > 0) {
                    uId = users[0].Id;
                  }
                }

                const fullFields = "Overview,Genres,People,CommunityRating,Taglines,ProductionYear,RunTimeTicks,Path,ProviderIds,OriginalTitle,Studios";
                const libUrl = uId
                  ? `${serverUrl}/Users/${uId}/Items?recursive=true&includeItemTypes=Movie,Series&fields=${fullFields}&limit=3000&api_key=${apiKey}`
                  : `${serverUrl}/Items?recursive=true&includeItemTypes=Movie,Series&fields=${fullFields}&limit=3000&api_key=${apiKey}`;

                const response = await originalFetch(libUrl);
                if (response.ok) {
                  const rData = await response.json();
                  const healthy = (rData.Items || []).filter((item: any) => {
                    const p = (item.Path || "").toLowerCase();
                    return !p.includes("movies_jellyfin_web");
                  });
                  const fullFormatted = healthy.map(formatItem);

                  // Update global cache
                  (window as any)._classico_movies_cache = fullFormatted;
                  try {
                    localStorage.setItem("classico_movies_cache_data", JSON.stringify(fullFormatted));
                  } catch (storageErr) {
                    console.warn("Storage quota exceeded, caching in memory only.");
                  }

                  console.log("[CLIENT CACHE] Background full fetch complete. Dispatching update event.");
                  // Notify App.tsx to update state seamlessly
                  window.dispatchEvent(new CustomEvent("classico-movies-updated", {
                    detail: { movies: fullFormatted }
                  }));
                }
              } catch (bgErr) {
                console.error("[CLIENT CACHE] Background full refresh failed:", bgErr);
              } finally {
                (window as any)._classico_is_refreshing = false;
              }
            };

            // 1. Check if we have an existing cache (memory or localStorage) for instantaneous load
            let cachedList = (window as any)._classico_movies_cache;
            if (!cachedList) {
              try {
                const stored = localStorage.getItem("classico_movies_cache_data");
                if (stored) {
                  cachedList = JSON.parse(stored);
                  (window as any)._classico_movies_cache = cachedList;
                }
              } catch (err) {
                console.warn("Failed to parse cached movies:", err);
              }
            }

            // 2. If cache exists, return it instantly and trigger background revalidation
            if (cachedList && cachedList.length > 0) {
              console.log("[CLIENT CACHE] Instant load from cache. Triggering revalidation...");
              setTimeout(() => {
                triggerBackgroundRefresh();
              }, 100);
              return new Response(JSON.stringify({ success: true, movies: cachedList }), { status: 200 });
            }

            // 3. Otherwise, perform an ultra-fast first-time sync fetch (excluding People/Taglines fields)
            console.log("[CLIENT CACHE] First-time load. Running fast sync fetch...");
            const userRes = await originalFetch(`${serverUrl}/Users?api_key=${apiKey}`);
            let userId = "";
            if (userRes.ok) {
              const users = await userRes.json();
              if (users && users.length > 0) {
                userId = users[0].Id;
              }
            }

            const fastFields = "Overview,Genres,CommunityRating,ProductionYear,RunTimeTicks,OriginalTitle,Studios";
            const libraryUrl = userId
              ? `${serverUrl}/Users/${userId}/Items?recursive=true&includeItemTypes=Movie,Series&fields=${fastFields}&limit=3000&api_key=${apiKey}`
              : `${serverUrl}/Items?recursive=true&includeItemTypes=Movie,Series&fields=${fastFields}&limit=3000&api_key=${apiKey}`;
            
            const res = await originalFetch(libraryUrl);
            const data = await res.json();
            const healthyMovies = (data.Items || []).filter((item: any) => {
              const p = (item.Path || "").toLowerCase();
              return !p.includes("movies_jellyfin_web");
            });
            const fastFormatted = healthyMovies.map(formatItem);

            // Cache the fast version
            (window as any)._classico_movies_cache = fastFormatted;
            try {
              localStorage.setItem("classico_movies_cache_data", JSON.stringify(fastFormatted));
            } catch (storageErr) {
              console.warn("Storage quota exceeded, caching in memory only.");
            }

            // Fire the background full refresh
            setTimeout(() => {
              triggerBackgroundRefresh();
            }, 500);

            return new Response(JSON.stringify({ success: true, movies: fastFormatted }), { status: 200 });
          } catch (e: any) {
            return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
          }
        })();
      }

      if (url.includes("/api/jellyfin/hero")) {
        return (async () => {
          try {
            const userRes = await originalFetch(`${serverUrl}/Users?api_key=${apiKey}`);
            const users = await userRes.json();
            if (!users || users.length === 0) throw new Error("No users");
            const userId = users[0].Id;
            
            const heroUrl = `${serverUrl}/Users/${userId}/Items/Latest?includeItemTypes=Movie&fields=Overview,Genres,People,CommunityRating,Taglines,ProductionYear,RunTimeTicks,Path,ProviderIds,OriginalTitle,Studios&limit=5&api_key=${apiKey}`;
            const res = await originalFetch(heroUrl);
            const data = await res.json();
            const healthyMovies = (data || []).filter((item: any) => {
              const p = (item.Path || "").toLowerCase();
              return !p.includes("movies_jellyfin_web");
            });
            const formatted = healthyMovies.map((item: any) => {
              const base = formatItem(item);
              return {
                ...base,
                hasLogo: item.ImageTags && item.ImageTags.Logo,
                logoUrl: item.ImageTags && item.ImageTags.Logo ? `${serverUrl}/Items/${item.Id}/Images/Logo?fillWidth=600&quality=90` : null,
                gradient: "from-zinc-950 via-neutral-900 to-[#ca8a04]/20",
                isJellyfin: true
              };
            });
            return new Response(JSON.stringify({ success: true, heroes: formatted, hero: formatted[0] }), { status: 200 });
          } catch (e: any) {
            return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
          }
        })();
      }
      
      if (url.includes("/api/jellyfin/config")) {
        return Promise.resolve(new Response(JSON.stringify({ success: true, url: serverUrl }), { status: 200 }));
      }
      
      if (url.includes("/api/jellyfin/recalculate")) {
        return Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200 }));
      }
      
      if (url.startsWith("/api/playback/")) {
        return (async () => {
          try {
            const parts = url.split("/api/playback/");
            const movieId = parts[1]?.split("?")[0];
            const streamUrl = `${serverUrl}/Videos/${movieId}/master.m3u8?Static=false&VideoCodec=h264&AudioCodec=aac&TranscodingMaxAudioChannels=2&Preset=ultrafast&SegmentContainer=ts&BreakOnNonKeyFrames=true&SegmentLength=3&MinSegments=1&api_key=${apiKey}&MediaSourceId=${movieId}`;
            
            return new Response(JSON.stringify({
                id: movieId,
                streamUrl: streamUrl,
                duration: 0,
                container: "m3u8",
                title: "Film",
                isDirect: false,
                videoCodec: "h264",
                audioCodec: "aac",
                chosenPath: "Netlify Intercept Bypass",
                subtitles: [],
                audios: []
            }), { status: 200 });
          } catch (e: any) {
            return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
          }
        })();
      }
    } else if (isNetlify && url.startsWith("/api/discover")) {
      return (async () => {
        try {
          const u = new URL(url, window.location.origin);
          const type = u.searchParams.get("type") || "movie";
          const page = u.searchParams.get("page") || "1";
          const activePlatform = u.searchParams.get("activePlatform");
          const activeGenre = u.searchParams.get("activeGenre");
          const activeLanguage = u.searchParams.get("activeLanguage");
          const activeYear = u.searchParams.get("activeYear");

          let tmdbUrl = `https://api.tmdb.org/3/trending/${type}/day?language=en-US&page=${page}`;
          if (type === "tv") tmdbUrl += "&without_genres=16";
          
          if (activePlatform || activeGenre || activeLanguage || activeYear) {
             tmdbUrl = `https://api.tmdb.org/3/discover/${type}?language=en-US&page=${page}&watch_region=US`;
             if (activeGenre === 'top_rated') {
                 tmdbUrl += `&sort_by=vote_average.desc&vote_count.gte=300`;
             } else {
                 tmdbUrl += `&sort_by=popularity.desc`;
             }
             if (activePlatform) tmdbUrl += `&with_watch_providers=${activePlatform}`;
             if (activeGenre && activeGenre !== 'top_rated') tmdbUrl += `&with_genres=${activeGenre}`;
             if (activeLanguage) tmdbUrl += `&with_original_language=${activeLanguage}`;
             if (type === "tv") tmdbUrl += `&without_genres=16`;
             if (activeYear) {
                 const dateField = type === "tv" ? "first_air_date" : "primary_release_date";
                 if (activeYear === '2010') {
                     tmdbUrl += `&${dateField}.gte=2010-01-01&${dateField}.lte=2019-12-31`;
                 } else if (activeYear === '2000') {
                     tmdbUrl += `&${dateField}.gte=2000-01-01&${dateField}.lte=2009-12-31`;
                 } else {
                     tmdbUrl += `&${dateField}.gte=${activeYear}-01-01&${dateField}.lte=${activeYear}-12-31`;
                 }
             }
          }

          const res = await fetch(tmdbUrl, {
            headers: { "Authorization": `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs`, "Accept": "application/json" }
          });
          if (!res.ok) throw new Error("TMDB failed");
          const data = await res.json();
          return new Response(JSON.stringify({ success: true, data: data }), { status: 200 });
        } catch (e: any) {
          return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
        }
      })();
    } else if (isNetlify && url.startsWith("/api/trending")) {
      return (async () => {
        try {
          const u = new URL(url, window.location.origin);
          const page = u.searchParams.get("page") || "1";
          const res = await fetch(`https://api.tmdb.org/3/trending/all/day?language=en-US&page=${page}`, {
            headers: { "Authorization": `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs`, "Accept": "application/json" }
          });
          if (!res.ok) throw new Error("TMDB failed");
          const data = await res.json();
          const valid = (data.results || []).filter((m: any) => m.media_type === "movie" || m.media_type === "tv");
          const enriched = valid.map((m: any) => ({
            id: String(m.id) + (m.media_type === "tv" ? "-tv" : ""),
            tmdbId: String(m.id),
            isTv: m.media_type === "tv",
            title: m.media_type === "tv" ? m.name : m.title,
            originalTitle: m.media_type === "tv" ? m.original_name : m.original_title,
            description: m.overview,
            posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "",
            backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : "",
            year: (m.media_type === "tv" ? m.first_air_date : m.release_date) ? parseInt((m.media_type === "tv" ? m.first_air_date : m.release_date).substring(0, 4)) : new Date().getFullYear(),
            voteAverage: m.vote_average,
            director: "Unknown",
            cast: [],
            genre: [],
            isIframeEmbed: true,
            iframeSrc: m.media_type === "tv" ? "" : `https://111movies.net/movie/${m.id}`
          }));
          return new Response(JSON.stringify({ success: true, results: enriched }), { status: 200 });
        } catch (e: any) {
          return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
        }
      })();
    } else if (isNetlify && url.startsWith("/api/search")) {
      return (async () => {
        try {
          const u = new URL(url, window.location.origin);
          const query = u.searchParams.get("query");
          if (!query) return new Response(JSON.stringify({ success: true, results: [] }), { status: 200 });
          const r1 = await fetch(`https://api.tmdb.org/3/search/multi?query=${encodeURIComponent(query)}&language=en-US&page=1`, { headers: { "Authorization": `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs`, "Accept": "application/json" } });
          const d1 = await r1.json();
          const combined = [...(d1.results || [])];
          const validRaw = combined.filter((m: any) => m.media_type === "movie" || m.media_type === "tv");
          const uniqueIds = new Set();
          const valid = [];
          for (const m of validRaw) {
            if (!uniqueIds.has(m.id)) {
              uniqueIds.add(m.id);
              valid.push(m);
            }
          }
          
          const lowerQuery = query.toLowerCase().trim();
          valid.sort((a: any, b: any) => {
            const aTitle = (a.name || a.title || "").toLowerCase();
            const bTitle = (b.name || b.title || "").toLowerCase();
            const aExact = aTitle === lowerQuery;
            const bExact = bTitle === lowerQuery;
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            return (b.popularity || 0) - (a.popularity || 0);
          });
          
          const topResults = valid.slice(0, 40);
          const enriched = topResults.map((m: any) => ({
            id: String(m.id) + (m.media_type === "tv" ? "-tv" : ""),
            tmdbId: String(m.id),
            isTv: m.media_type === "tv",
            title: m.media_type === "tv" ? m.name : m.title,
            originalTitle: m.media_type === "tv" ? m.original_name : m.original_title,
            description: m.overview,
            posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "",
            backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : "",
            year: (m.media_type === "tv" ? m.first_air_date : m.release_date) ? parseInt((m.media_type === "tv" ? m.first_air_date : m.release_date).substring(0, 4)) : new Date().getFullYear(),
            voteAverage: m.vote_average,
            director: "Unknown",
            cast: [],
            genre: [],
            isIframeEmbed: true,
            iframeSrc: m.media_type === "tv" ? "" : `https://111movies.net/movie/${m.id}`
          }));
          return new Response(JSON.stringify({ success: true, results: enriched }), { status: 200 });
        } catch (e: any) {
          return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
        }
      })();
    } else if (isNetlify && url.startsWith("/api/movie/")) {
      return (async () => {
        try {
          const parts = url.split("/api/movie/");
          const id = parts[1]?.split("?")[0];
          const isTv = id.endsWith('-tv');
          const actualId = isTv ? id.replace('-tv', '') : id;
          const u = isTv 
             ? `https://api.tmdb.org/3/tv/${actualId}?append_to_response=credits,videos,similar,images&include_image_language=en,null&language=en-US`
            : `https://api.tmdb.org/3/movie/${actualId}?append_to_response=credits,videos,similar,images&include_image_language=en,null&language=en-US`;
          const res = await fetch(u, { headers: { "Authorization": `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs`, "Accept": "application/json" } });
          if (!res.ok) throw new Error("TMDB failed");
          const m = await res.json();
          const releaseDate = isTv ? m.first_air_date : m.release_date;

          const logos = (m.images?.logos || []).filter((l: any) => l.file_path && l.file_path.endsWith('.png'));
          const bestLogo = logos.find((l: any) => l.iso_639_1 === 'en') || logos[0];
          const logoUrl = bestLogo ? `https://image.tmdb.org/t/p/w500${bestLogo.file_path}` : "";
          
          let seasons = [];
          if (isTv && m.seasons) {
            seasons = m.seasons.filter((s: any) => s.season_number > 0).map((s: any) => ({
              season_number: s.season_number,
              name: s.name,
              episode_count: s.episode_count,
              air_date: s.air_date,
              poster_path: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : "",
              episodes: []
            }));
          }
          
          const videos = m.videos?.results || [];
          const trailer = videos.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer') || videos.find((v: any) => v.site === 'YouTube');
          const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined;
          
          const movieData = {
            id: id,
            trailerUrl: trailerUrl,
            tmdbId: String(m.id),
            imdbId: m.imdb_id || String(m.id),
            isTv,
            tagline: m.tagline || "",
            title: isTv ? m.name : m.title,
            originalTitle: isTv ? m.original_name : m.original_title,
            originalLanguage: m.original_language || "en",
            description: m.overview,
            posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "",
            backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : "",
            year: releaseDate ? parseInt(releaseDate.substring(0, 4)) : new Date().getFullYear(),
            duration: isTv ? (m.episode_run_time?.[0] || 45) : (m.runtime || 120),
            logoUrl: logoUrl,
            hasLogo: !!logoUrl,
            director: "Unknown",
            cast: m.credits?.cast?.slice(0, 4).map((c: any) => c.name) || [],
            castDetails: m.credits?.cast?.slice(0, 8).map((c: any) => ({
              id: String(c.id),
              name: c.name,
              role: c.character,
              imageUrl: c.profile_path ? `https://image.tmdb.org/t/p/w200${c.profile_path}` : undefined
            })) || [],
            similar: m.similar?.results?.slice(0, 8).map((sm: any) => ({
              id: String(sm.id) + (isTv ? "-tv" : ""),
              tmdbId: String(sm.id),
              isTv,
              title: isTv ? sm.name : sm.title,
              description: sm.overview,
              posterUrl: sm.poster_path ? `https://image.tmdb.org/t/p/w500${sm.poster_path}` : "",
              backdropUrl: sm.backdrop_path ? `https://image.tmdb.org/t/p/w780${sm.backdrop_path}` : "",
              year: (isTv ? sm.first_air_date : sm.release_date) ? parseInt((isTv ? sm.first_air_date : sm.release_date).substring(0, 4)) : new Date().getFullYear(),
            })) || [],
            genre: m.genres ? m.genres.map((g: any) => g.name) : (isTv ? ["TV Series"] : ["Movie"]),
            voteAverage: m.vote_average,
            isIframeEmbed: true,
            seasons: seasons,
            iframeSrc: isTv ? "" : `https://111movies.net/movie/${m.id}`
          };
          return new Response(JSON.stringify({ success: true, movie: movieData }), { status: 200 });
        } catch (e: any) {
          return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
        }
      })();
    } else if (isNetlify && url.startsWith("/api/tv/")) {
      return (async () => {
        try {
          const parts = url.split("/api/tv/");
          const rest = parts[1]?.split("?")[0];
          const [id, seasonPart, seasonNumber] = rest.split("/");
          const cleanId = id.replace("-tv", "");
          const u = `https://api.tmdb.org/3/tv/${cleanId}/season/${seasonNumber}?language=en-US`;
          const res = await fetch(u, { headers: { "Authorization": `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs`, "Accept": "application/json" } });
          if (!res.ok) throw new Error("TMDB failed");
          const seasonData = await res.json();
          const episodes = seasonData.episodes.map((ep: any) => ({
            id: ep.id,
            episode_number: ep.episode_number,
            name: ep.name,
            overview: ep.overview,
            stillUrl: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : "",
            air_date: ep.air_date,
            runtime: ep.runtime
          }));
          return new Response(JSON.stringify({ success: true, episodes }), { status: 200 });
        } catch (e: any) {
          return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
        }
      })();
    } else if (isNetlify && url.startsWith("/api/playback/")) {
      const serverUrl = localStorage.getItem("classico_jellyfin_url") || "https://jellyfin-jacklumber00.siren.mygiga.cloud";
      const apiKey = localStorage.getItem("classico_jellyfin_apikey") || "a2aac09e434e4bcc897c1b181ca197eb";
      
      return (async () => {
        try {
          const parts = url.split("/api/playback/");
          const movieId = parts[1]?.split("?")[0];
          const streamUrl = `${serverUrl}/Videos/${movieId}/master.m3u8?Static=false&VideoCodec=h264&AudioCodec=aac&TranscodingMaxAudioChannels=2&Preset=ultrafast&SegmentContainer=ts&BreakOnNonKeyFrames=true&SegmentLength=3&MinSegments=1&api_key=${apiKey}&MediaSourceId=${movieId}`;
          
          return new Response(JSON.stringify({
              id: movieId,
              streamUrl: streamUrl,
              duration: 0,
              container: "m3u8",
              title: "Film",
              isDirect: false,
              videoCodec: "h264",
              audioCodec: "aac",
              chosenPath: "Netlify Intercept Bypass",
              subtitles: [],
              audios: []
          }), { status: 200 });
        } catch (e: any) {
          return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
        }
      })();
    }

    // Fetch calls will use relative paths or whatever is configured elsewhere.
    return originalFetch.call(window, input, init);
  };

  try {
    Object.defineProperty(window, 'fetch', {
      value: customFetch,
      configurable: true,
      writable: true,
      enumerable: true
    });
  } catch (err) {
    console.warn("Could not override window.fetch with defineProperty:", err);
    try {
      // Fallback: try to assign directly if defineProperty fails
      (window as any).fetch = customFetch;
    } catch (fallbackErr) {
      console.error("Critical: Could not intercept window.fetch:", fallbackErr);
    }
  }

  const ignorePatterns = [
    "websocket",
    "hmr",
    "vite",
    "subtitles",
    "failed to connect to websocket",
    "websocket connection to"
  ];

  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args.map(arg => String(arg)).join(" ");
    if (ignorePatterns.some(pattern => message.toLowerCase().includes(pattern))) {
      return;
    }
    originalConsoleError.apply(console, args);
  };

  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    const message = args.map(arg => String(arg)).join(" ");
    if (ignorePatterns.some(pattern => message.toLowerCase().includes(pattern))) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };

  window.addEventListener("error", (event) => {
    const message = event.message || "";
    if (ignorePatterns.some(pattern => message.toLowerCase().includes(pattern))) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  window.addEventListener("unhandledrejection", (event) => {
    const reason = String(event.reason || "");
    if (ignorePatterns.some(pattern => reason.toLowerCase().includes(pattern))) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  // Patch window.WebSocket prototype safely to intercept Vite's HMR WebSocket close/error events
  if (typeof window !== "undefined" && window.WebSocket) {
    try {
      const originalAddEventListener = window.WebSocket.prototype.addEventListener;
      window.WebSocket.prototype.addEventListener = function(type: string, listener: any, options?: any) {
        if (type === "close" || type === "error") {
          const url = (this as any).url || "";
          const isViteWS = String(url).includes("vite") || String(url).includes("/ws");
          if (isViteWS) {
            const wrappedListener = function(event: any) {
              console.warn(`[WS RESILIENCE] Intercepted Vite WS event '${type}' to prevent unrequested page reloads.`);
              if (event && typeof event.preventDefault === "function") {
                event.preventDefault();
              }
              if (event && typeof event.stopPropagation === "function") {
                event.stopPropagation();
              }
            };
            return originalAddEventListener.call(this, type, wrappedListener, options);
          }
        }
        return originalAddEventListener.call(this, type, listener, options);
      };
    } catch (e) {
      console.warn("[WS RESILIENCE] Could not patch WebSocket prototype safely:", e);
    }
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallbackTitle="Une interruption est survenue dans l'application Classico">
      <App />
      <Analytics />
    </ErrorBoundary>
  </StrictMode>,
);

