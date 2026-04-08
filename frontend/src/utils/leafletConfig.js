import L from "leaflet";
import EXTERNAL_CONFIG from "../config/external";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: EXTERNAL_CONFIG.CDN.LEAFLET.MARKER_ICON_2X,
  iconUrl: EXTERNAL_CONFIG.CDN.LEAFLET.MARKER_ICON,
  shadowUrl: EXTERNAL_CONFIG.CDN.LEAFLET.MARKER_SHADOW,
});
