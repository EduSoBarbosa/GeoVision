import React, { useMemo } from "react";
import { WebView } from "react-native-webview";
import { mapHtml } from "./mapHtml";
export default function GeoMap({ features, layer, drawing, onEvent }) {
  const html = useMemo(
    () => mapHtml(features, layer, drawing),
    [features, layer, drawing],
  );
  return (
    <WebView
      style={{ height: 470, flex: 0 }}
      originWhitelist={["*"]}
      source={{ html }}
      onMessage={(event) => {
        try {
          onEvent?.(JSON.parse(event.nativeEvent.data));
        } catch {}
      }}
    />
  );
}
