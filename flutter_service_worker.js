'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "icons/Icon-512.png": "529f9281c7bd448463c995b47c9befe4",
"icons/Icon-192.png": "fcfd9515e216757d0c405b04a0741a21",
"manifest.json": "33ad2b4a1951c70756e32f9796b94618",
"assets/resources/lang/en.json": "9f43f91ab3584c3092a09c0343b7bab4",
"assets/resources/lang/it.json": "f910d71f1733f0f9d24bee90b0175808",
"assets/resources/lang/pt.json": "be50017c2b404bd2fad9fa9f39efd13b",
"assets/resources/lang/fr.json": "e8171640f2111fef88aa9017ffb413c9",
"assets/resources/images/angoli.png": "f8a0c60156c1d7a67f6781422b785f8c",
"assets/resources/images/prefissi.png": "69a1b0eed46990d3ff841d2c328cf94a",
"assets/resources/images/consumo.png": "d557b7b8da7a9887bb5dfa73c83c9e61",
"assets/resources/images/potenza.png": "92138ef7faa7e8f6fd136c265d7c4932",
"assets/resources/images/volume.png": "4241670b1d26ac8ca9dfd6a24e7b4b86",
"assets/resources/images/calculator.png": "5080b8b64bfb548edabd5f354018f2a0",
"assets/resources/images/valuta.png": "99a5c05753997b4ce9ce8097686c38ca",
"assets/resources/images/logo.png": "59b984028582182089ccdfbbc46f10c7",
"assets/resources/images/pressione.png": "a98980f0401565315a9e9bfb48627ffa",
"assets/resources/images/massa.png": "563a37b10d72222dee86a42b251d9441",
"assets/resources/images/energia.png": "103ed054f04d796a0c91d169e07fca80",
"assets/resources/images/tempo.png": "62219900f6e903a5ca20710b1a9b6aa1",
"assets/resources/images/temperatura.png": "1ec875c848337b5a1e5196e78ff9cd7f",
"assets/resources/images/scarpe.png": "d189f8dac179d2fc68ab257f5192d537",
"assets/resources/images/area.png": "fa724188ecbd91ecdbde6c0478ce26e3",
"assets/resources/images/forza.png": "63a1463fe0d29ca96122e74bf1e45605",
"assets/resources/images/dati.png": "cb5d3bfa5d85090037d249f234596f87",
"assets/resources/images/conversione_base.png": "b82321121be9324d77b9a9a39b4c5228",
"assets/resources/images/torque.png": "48c7d3cb1c1c2866b166de7d8e995075",
"assets/resources/images/lunghezza.png": "2d57f006df44e79fa5a3b243a63bfcf1",
"assets/resources/images/velocita.png": "a5dbe972024e38c2a26dd9854eb22438",
"assets/NOTICES": "c5c2054aed2b584c7668be0efecf32be",
"assets/AssetManifest.json": "bf5bf44aa5b40b766c1a0e8ec11bbef0",
"assets/FontManifest.json": "7b2a36307916a9721811788013e65289",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"index.html": "276cda2c1de98ca764b87bbbf2e5c0aa",
"/": "276cda2c1de98ca764b87bbbf2e5c0aa",
"version.json": "65e4ea473b00c7334430c896883ca5d3",
"main.dart.js": "eb3bb8dc708f4abf62ba9590d1b6f2ec",
"favicon.png": "9e118249f3d09c38b28095dbb5c14a7e"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey in Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
