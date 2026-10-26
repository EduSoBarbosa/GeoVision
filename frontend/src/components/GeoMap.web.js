import React, { useEffect, useMemo, useRef } from "react";
import { mapHtml } from "./mapHtml";

export default function GeoMap({ features, layer, drawing, onEvent }) {
  const ref = useRef(null);
  const html = useMemo(
    () => mapHtml(features, layer, drawing),
    [features, layer, drawing],
  );
  useEffect(() => {
    function receive(event) {
      if (event.source !== ref.current?.contentWindow) return;
      try {
        const message = JSON.parse(event.data);
        if (["pixel", "polygon"].includes(message.type)) onEvent?.(message);
      } catch {}
    }
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [onEvent]);
  return (
    <iframe
      ref={ref}
      title="Mapa interativo GeoVision"
      srcDoc={html}
      sandbox="allow-scripts"
      style={{ width: "100%", height: 470, border: 0, borderRadius: 12 }}
    />
  );
}
