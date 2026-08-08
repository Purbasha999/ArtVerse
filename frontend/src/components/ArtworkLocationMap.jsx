import { useEffect, useRef } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';

maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY;

export default function ArtworkLocationMap({ artwork }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current || !artwork?.geometry?.coordinates) return;

        const map = new maptilersdk.Map({
            container: containerRef.current,
            style: maptilersdk.MapStyle.BRIGHT,
            center: artwork.geometry.coordinates,
            zoom: 10
        });

        new maptilersdk.Marker()
            .setLngLat(artwork.geometry.coordinates)
            .setPopup(
                new maptilersdk.Popup({ offset: 25 })
                    .setHTML(`<h3>${artwork.title}</h3><p>${artwork.location}</p>`)
            )
            .addTo(map);

        return () => map.remove();
    }, [artwork]);

    return <div id="map" ref={containerRef}></div>;
}
