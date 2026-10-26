import { LEAFLET_JS, LEAFLET_CSS } from "../vendor/leafletAssets";

/** Shared Leaflet surface for iframe (web) and WebView (Android/iOS). */
export function mapHtml(features, layer = "lst", drawing = false) {
  const data = JSON.stringify(features || []).replace(/</g, "\\u003c");
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${LEAFLET_CSS}</style>
  <style>
    html, body, #map { height: 100%; margin: 0; font-family: system-ui; }
    #hint {
      position: absolute; bottom: 28px; left: 12px; z-index: 1000;
      background: white; padding: 10px; border-radius: 8px;
      max-width: 65%; font-size: 12px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="hint">${drawing ? "Clique para marcar vértices. Use os botões fora do mapa para salvar ou limpar." : "Clique em um ponto para consultar. Arraste para navegar e use +/− para ampliar."}</div>
  <script>${LEAFLET_JS}</script>
  <script>
    const points = ${data};
    const key = ${JSON.stringify(layer)};
    const drawing = ${drawing};
    const map = L.map('map', { preferCanvas: true }).setView([-23.55, -46.63], 11);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).on('tileerror', function () {
      document.getElementById('hint').textContent = 'Mapa-base indisponível. Os dados e as ferramentas de seleção continuam ativos.';
    }).addTo(map);

    function notify(data) {
      const message = JSON.stringify(data);
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(message);
      } else {
        window.parent.postMessage(message, '*');
      }
    }

    function color(value) {
      const scaled = key === 'error' ? (value + 5) / 10
        : ['lst', 'predicted_lst'].includes(key) ? (value - 18) / 22
        : (value + 1) / 2;
      const level = Math.max(0, Math.min(1, scaled));
      const palette = ['#25577E', '#4B9699', '#A6C87C', '#E9BC64', '#CD634A'];
      return palette[Math.min(4, Math.floor(level * 5))];
    }

    points.forEach(function (feature) {
      const coordinates = feature.geometry.coordinates;
      const properties = feature.properties || {};
      const value = properties[key];
      if (coordinates.length !== 2 || typeof value !== 'number') return;

      const marker = L.circleMarker([coordinates[1], coordinates[0]], {
        radius: 6, weight: 1, color: color(value), fillColor: color(value),
        fillOpacity: .8, bubblingMouseEvents: false
      }).addTo(map);
      const text = document.createElement('div');
      const unit = ['lst', 'predicted_lst', 'error'].includes(key) ? ' °C' : '';
      text.textContent = key.toUpperCase() + ': ' + value.toFixed(2) + unit;
      marker.bindPopup(text);
      marker.on('click', function () {
        notify({ type: 'pixel', coordinates, properties });
      });
    });

    const vertices = [];
    let polygon = null;
    map.on('click', function (event) {
      if (!drawing) return;
      vertices.push([event.latlng.lng, event.latlng.lat]);
      if (polygon) map.removeLayer(polygon);
      polygon = L.polygon(vertices.map(c => [c[1], c[0]]), {
        color: '#164C40', fillOpacity: .15
      }).addTo(map);
      notify({ type: 'polygon', coordinates: vertices });
    });
    setTimeout(() => map.invalidateSize(), 200);
  </script>
</body>
</html>`;
}
