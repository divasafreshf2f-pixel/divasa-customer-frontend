import { useEffect, useRef, useState } from "react";

const DEFAULT_CENTER = { lng: 77.5946, lat: 12.9716 };
const GOOGLE_SCRIPT_ID = "divasa-google-maps-script";
const BENGALURU_KEYWORDS = ["bengaluru", "bangalore", "karnataka", "560"];
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const normalizeText = (value = "") => String(value).toLowerCase().trim();

const queryLooksBengaluruScoped = (query) => {
  const q = normalizeText(query);
  return BENGALURU_KEYWORDS.some((k) => q.includes(k));
};

const scorePrediction = (prediction, query) => {
  const q = normalizeText(query);
  const main = normalizeText(prediction?.structured_formatting?.main_text || "");
  const secondary = normalizeText(prediction?.structured_formatting?.secondary_text || "");
  const full = normalizeText(prediction?.description || "");
  const hay = `${main} ${secondary} ${full}`;
  const tokens = q.split(/\s+/).filter(Boolean);

  let score = 0;

  if (main === q) score += 140;
  if (full.startsWith(q)) score += 80;
  if (main.includes(q)) score += 60;
  if (full.includes(q)) score += 40;

  const tokenHits = tokens.filter((t) => hay.includes(t)).length;
  score += tokenHits * 12;

  if (BENGALURU_KEYWORDS.some((k) => hay.includes(k))) score += 35;

  return score;
};

const rankAndDedupePredictions = (predictions, query) => {
  const map = new Map();

  predictions.forEach((prediction) => {
    const key = prediction?.place_id || prediction?.description || "";
    if (!key) return;

    const current = map.get(key);
    const next = { ...prediction, __score: scorePrediction(prediction, query) };
    if (!current || next.__score > current.__score) {
      map.set(key, next);
    }
  });

  return [...map.values()]
    .sort((a, b) => b.__score - a.__score)
    .map((prediction) => {
      const cleaned = { ...prediction };
      delete cleaned.__score;
      return cleaned;
    });
};

const loadGoogleMapsScript = (apiKey) => {
  if (!apiKey) {
    return Promise.reject(new Error("Missing Google Maps API key"));
  }

  if (window.google?.maps?.places) {
    return Promise.resolve(window.google);
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existing) {
      if (window.google?.maps?.places) {
        resolve(window.google);
        return;
      }
      const onLoad = () => {
        if (window.google?.maps?.places) resolve(window.google);
        else reject(new Error("Google Maps loaded without Places library"));
      };
      existing.addEventListener("load", onLoad, { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
    script.onload = () => {
      if (window.google?.maps?.places) resolve(window.google);
      else reject(new Error("Google Maps loaded without Places library"));
    };
    script.onerror = () => reject(new Error("Failed to load Google Maps script"));
    document.head.appendChild(script);
  });
};

const getPredictions = (service, request) =>
  new Promise((resolve) => {
    service.getPlacePredictions(request, (predictions, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && Array.isArray(predictions)) {
        resolve(predictions);
      } else {
        resolve([]);
      }
    });
  });

const getPlaceDetails = (service, placeId) =>
  new Promise((resolve) => {
    service.getDetails(
      {
        placeId,
        fields: ["name", "formatted_address", "geometry"],
      },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          resolve(place);
        } else {
          resolve(null);
        }
      }
    );
  });

const reverseGeocode = (geocoder, lat, lng) =>
  new Promise((resolve) => {
    geocoder.geocode(
      {
        location: { lat, lng },
        region: "IN",
        language: "en",
      },
      (results, status) => {
        if (status === "OK" && Array.isArray(results) && results.length > 0) {
          const preferred =
            results.find((r) => /bengaluru|bangalore|karnataka/i.test(r.formatted_address || "")) || results[0];
          resolve(preferred.formatted_address || "");
          return;
        }
        resolve("");
      }
    );
  });

export default function MapSelector({ onLocationSelect }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const initializedRef = useRef(false);
  const searchWrapRef = useRef(null);
  const mapListenersRef = useRef([]);

  const autocompleteRef = useRef(null);
  const placesServiceRef = useRef(null);
  const geocoderRef = useRef(null);

  const [center, setCenter] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locatingLabel, setLocatingLabel] = useState("");
  const [locError, setLocError] = useState("");
  const [confirming, setConfirming] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const initMap = (longitude, latitude) => {
    if (!mapContainer.current || mapRef.current || !window.google?.maps) return;

    const google = window.google;
    const map = new google.maps.Map(mapContainer.current, {
      center: { lat: latitude, lng: longitude },
      zoom: 16,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      clickableIcons: true,
    });

    mapRef.current = map;
    autocompleteRef.current = new google.maps.places.AutocompleteService();
    placesServiceRef.current = new google.maps.places.PlacesService(map);
    geocoderRef.current = new google.maps.Geocoder();

    setCenter({ lat: latitude, lng: longitude });

    const idleListener = map.addListener("idle", () => {
      const c = map.getCenter();
      if (!c) return;
      setCenter({ lat: c.lat(), lng: c.lng() });
    });

    mapListenersRef.current = [idleListener];
  };

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    let cancelled = false;

    loadGoogleMapsScript(GOOGLE_MAPS_API_KEY)
      .then(() => {
        if (cancelled) return;

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (cancelled) return;
            initMap(pos.coords.longitude, pos.coords.latitude);
          },
          () => {
            if (cancelled) return;
            initMap(DEFAULT_CENTER.lng, DEFAULT_CENTER.lat);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      })
      .catch((err) => {
        if (cancelled) return;
        setSearchError(
          err?.message?.toLowerCase().includes("key")
            ? "Google Maps API key missing. Set VITE_GOOGLE_MAPS_API_KEY."
            : "Could not load Google Maps. Please try again."
        );
      });

    return () => {
      cancelled = true;
      mapListenersRef.current.forEach((listener) => listener?.remove?.());
      mapListenersRef.current = [];
      mapRef.current = null;
      initializedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const onDocClick = (event) => {
      if (!searchWrapRef.current) return;
      if (!searchWrapRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    const q = searchText.trim();
    if (q.length < 1) {
      setIsSearching(false);
      setSearchError("");
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        if (!autocompleteRef.current || !window.google?.maps?.places) {
          setSuggestions([]);
          return;
        }

        setIsSearching(true);
        setSearchError("");

        const google = window.google;
        const centerPoint = Number.isFinite(center?.lat) && Number.isFinite(center?.lng)
          ? new google.maps.LatLng(center.lat, center.lng)
          : new google.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);

        const primaryRequest = {
          input: q,
          componentRestrictions: { country: "in" },
          location: centerPoint,
          radius: 50000,
        };

        const bengaluruRequest = {
          input: queryLooksBengaluruScoped(q) ? q : `${q} bengaluru`,
          componentRestrictions: { country: "in" },
          location: new google.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
          radius: 70000,
        };

        const [primaryPredictions, bengaluruPredictions] = await Promise.all([
          getPredictions(autocompleteRef.current, primaryRequest),
          getPredictions(autocompleteRef.current, bengaluruRequest),
        ]);

        const merged = rankAndDedupePredictions(
          [...bengaluruPredictions, ...primaryPredictions],
          q
        ).slice(0, 10);

        if (merged.length > 0) {
          setSuggestions(merged);
        } else {
          const broadPredictions = await getPredictions(autocompleteRef.current, { input: q });
          setSuggestions(rankAndDedupePredictions(broadPredictions, q).slice(0, 10));
        }
      } catch {
        setSearchError("Could not fetch place suggestions. Please try again.");
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchText, center]);

  const handleSuggestionSelect = async (prediction) => {
    try {
      const placeId = prediction?.place_id;
      if (!placeId || !placesServiceRef.current || !mapRef.current) return;

      const place = await getPlaceDetails(placesServiceRef.current, placeId);
      const location = place?.geometry?.location;
      if (!location) return;

      const lat = location.lat();
      const lng = location.lng();

      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(16);

      setCenter({ lat, lng });
      setSearchText(place.formatted_address || prediction.description || place.name || "");
      setShowSuggestions(false);
      setSearchError("");
    } catch {
      setSearchError("Could not open selected place. Try another result.");
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocError("Geolocation not supported by your browser.");
      return;
    }

    setLocating(true);
    setLocatingLabel("Finding your location...");
    setLocError("");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        mapRef.current?.panTo({ lat: latitude, lng: longitude });
        mapRef.current?.setZoom(16);
        setCenter({ lat: latitude, lng: longitude });
        setLocating(false);
        setLocatingLabel("");
      },
      (err) => {
        setLocating(false);
        setLocatingLabel("");
        if (err.code === 1) setLocError("Location denied. Enable it in browser settings.");
        else if (err.code === 2) setLocError("Location unavailable. Search manually.");
        else setLocError("Location timed out. Try again.");
        setTimeout(() => setLocError(""), 4000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleConfirm = async () => {
    if (!center || confirming) return;
    setConfirming(true);

    try {
      let fullPlace = "";
      if (geocoderRef.current) {
        fullPlace = await reverseGeocode(geocoderRef.current, center.lat, center.lng);
      }

      if (typeof onLocationSelect === "function") {
        onLocationSelect({
          lat: center.lat,
          lng: center.lng,
          name: fullPlace || `${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`,
        });
      }
    } catch {
      if (typeof onLocationSelect === "function") {
        onLocationSelect({
          lat: center.lat,
          lng: center.lng,
          name: `${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`,
        });
      }
    } finally {
      setConfirming(false);
    }
  };

  const noResults =
    showSuggestions &&
    searchText.trim().length >= 1 &&
    !isSearching &&
    !searchError &&
    suggestions.length === 0;

  return (
    <div style={{ height: "100%", position: "relative", minHeight: 300 }}>
      <div ref={mapContainer} style={{ height: "100%", minHeight: 300 }} />

      <div
        ref={searchWrapRef}
        style={{ position: "absolute", top: 10, left: 10, width: "calc(100% - 20px)", maxWidth: 320, zIndex: 25 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#fff",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            padding: "0 10px",
            boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
          }}
        >
          <span style={{ fontSize: 15, color: "#6b7280", marginRight: 6 }}>Search</span>
          <input
            type="text"
            value={searchText}
            placeholder="Search location"
            onChange={(e) => {
              setSearchText(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            style={{
              width: "100%",
              height: 42,
              border: "none",
              outline: "none",
              fontSize: 16,
              background: "transparent",
            }}
          />
        </div>

        {showSuggestions && (isSearching || searchError || noResults || suggestions.length > 0) && (
          <div
            style={{
              marginTop: 6,
              background: "#fff",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
              maxHeight: 250,
              overflowY: "auto",
            }}
          >
            {isSearching && (
              <div style={{ padding: "11px 12px", fontSize: 13, color: "#6b7280" }}>Searching places...</div>
            )}
            {searchError && (
              <div style={{ padding: "11px 12px", fontSize: 13, color: "#b91c1c" }}>{searchError}</div>
            )}
            {noResults && <div style={{ padding: "11px 12px", fontSize: 13, color: "#6b7280" }}>No results found</div>}
            {!isSearching &&
              !searchError &&
              suggestions.map((prediction) => (
                <button
                  key={prediction.place_id}
                  onClick={() => handleSuggestionSelect(prediction)}
                  style={{
                    width: "100%",
                    border: "none",
                    background: "#fff",
                    textAlign: "left",
                    padding: "11px 12px",
                    cursor: "pointer",
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", lineHeight: 1.2 }}>
                    {prediction.structured_formatting?.main_text || prediction.description}
                  </div>
                  <div style={{ marginTop: 3, fontSize: 12, color: "#6b7280", lineHeight: 1.3 }}>
                    {prediction.description}
                  </div>
                </button>
              ))}
          </div>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -100%)",
          fontSize: 36,
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        +
      </div>

      {locError && (
        <div
          style={{
            position: "absolute",
            top: 62,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fee2e2",
            color: "#991b1b",
            padding: "8px 14px",
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 600,
            zIndex: 20,
            width: "88%",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {locError}
        </div>
      )}

      {locating && (
        <div
          style={{
            position: "absolute",
            top: 62,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#ecfeff",
            color: "#0f766e",
            padding: "8px 14px",
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 600,
            zIndex: 20,
            width: "88%",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            border: "1px solid #99f6e4",
          }}
        >
          {locatingLabel || "Finding your location..."}
        </div>
      )}

      <div style={{ position: "absolute", right: 12, bottom: 80, zIndex: 10 }}>
        <button
          onClick={handleCurrentLocation}
          disabled={locating}
          title="Use my current location"
          style={{
            background: locating ? "#ecfeff" : "#ffffff",
            border: locating ? "1px solid #14b8a6" : "1px solid #d1d5db",
            width: 52,
            height: 52,
            borderRadius: "50%",
            cursor: locating ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            boxShadow: locating ? "0 6px 18px rgba(20,184,166,0.35)" : "0 3px 12px rgba(0,0,0,0.15)",
            opacity: locating ? 0.6 : 1,
            transition: "0.2s",
            position: "relative",
          }}
        >
          {locating ? "◎" : "🎯"}
        </button>
      </div>

      <div style={{ position: "absolute", bottom: 16, left: 12, right: 12, zIndex: 10 }}>
        <button
          onClick={handleConfirm}
          disabled={confirming}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 12,
            border: "none",
            background: confirming ? "#059669" : "#16a34a",
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            cursor: confirming ? "not-allowed" : "pointer",
            boxShadow: "0 4px 14px rgba(22,163,74,0.35)",
            opacity: confirming ? 0.8 : 1,
            transition: "all 0.2s",
          }}
        >
          {confirming ? "Confirming..." : "Confirm Location"}
        </button>
      </div>
    </div>
  );
}
