import { useEffect, useRef } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';

maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY;

// India-wide default view so pins make sense even before the map fits data.
const INDIA_CENTER = [78.9629, 22.5937];

export default function ClusterMap({ artworks }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const map = new maptilersdk.Map({
            container: containerRef.current,
            style: maptilersdk.MapStyle.BRIGHT,
            center: INDIA_CENTER,
            zoom: 3.5
        });

        map.on('load', () => {
            const geojson = {
                type: 'FeatureCollection',
                features: artworks
                    .filter(a => a.geometry)
                    .map(a => ({
                        type: 'Feature',
                        geometry: a.geometry,
                        properties: { popUpMarkup: a?.properties?.popUpMarkup }
                    }))
            };

            map.addSource('artworks', {
                type: 'geojson',
                data: geojson,
                cluster: true,
                clusterMaxZoom: 14,
                clusterRadius: 50
            });

            map.addLayer({
                id: 'clusters',
                type: 'circle',
                source: 'artworks',
                filter: ['has', 'point_count'],
                paint: {
                    'circle-color': ['step', ['get', 'point_count'], '#00BCD4', 10, '#2196F3', 30, '#3F51B5'],
                    'circle-radius': ['step', ['get', 'point_count'], 15, 10, 20, 30, 25]
                }
            });

            map.addLayer({
                id: 'cluster-count',
                type: 'symbol',
                source: 'artworks',
                filter: ['has', 'point_count'],
                layout: {
                    'text-field': '{point_count_abbreviated}',
                    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                    'text-size': 12
                }
            });

            map.addLayer({
                id: 'unclustered-point',
                type: 'circle',
                source: 'artworks',
                filter: ['!', ['has', 'point_count']],
                paint: {
                    'circle-color': '#11b4da',
                    'circle-radius': 5,
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#fff'
                }
            });

            map.on('click', 'clusters', async (e) => {
                const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
                const clusterId = features[0].properties.cluster_id;
                const zoom = await map.getSource('artworks').getClusterExpansionZoom(clusterId);
                map.easeTo({ center: features[0].geometry.coordinates, zoom });
            });

            map.on('click', 'unclustered-point', (e) => {
                const { popUpMarkup } = e.features[0].properties;
                const coordinates = e.features[0].geometry.coordinates.slice();
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
                new maptilersdk.Popup().setLngLat(coordinates).setHTML(popUpMarkup).addTo(map);
            });

            map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
            map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
        });

        return () => map.remove();
    }, [artworks]);

    return <div id="cluster-map" ref={containerRef}></div>;
}
