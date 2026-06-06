'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import type { Hospital } from '@/types'
import 'mapbox-gl/dist/mapbox-gl.css'

interface HospitalMapProps {
  hospitals: Hospital[]
  selectedId?: string | null
  onMarkerClick?: (id: string) => void
}

export default function HospitalMap({
  hospitals,
  selectedId,
  onMarkerClick,
}: HospitalMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef          = useRef<mapboxgl.Map | null>(null)
  const markersRef      = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const popupRef        = useRef<mapboxgl.Popup | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style:     'mapbox://styles/mapbox/streets-v12',
      center:    [8.6753, 9.0820],
      zoom:      5.5,
    })

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions:   { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'top-right'
    )

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const addMarkers = () => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current.clear()
      popupRef.current?.remove()

      if (hospitals.length === 0) return

      const bounds = new mapboxgl.LngLatBounds()

      hospitals.forEach(hospital => {
        if (hospital.lat == null || hospital.lng == null) return

        const isSelected = hospital.id === selectedId

        // Wrapper keeps transform stable
        const wrapper = document.createElement('div')
        wrapper.style.cssText = `
          position: relative;
          width: ${isSelected ? '20px' : '14px'};
          height: ${isSelected ? '20px' : '14px'};
        `

        const el = document.createElement('div')
        el.style.cssText = `
          width: 100%;
          height: 100%;
          background: ${isSelected ? '#1b6b6a' : '#3a9e9d'};
          border: 2.5px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          transition: transform 0.15s ease, background 0.15s ease;
        `

        wrapper.appendChild(el)

        // Popup
        const popup = new mapboxgl.Popup({
          closeButton:  false,
          closeOnClick: false,
          offset:       [0, -8],
          className:    'carefinder-popup',
          maxWidth:     '220px',
          anchor:       'bottom',
        }).setHTML(`
          <div style="font-family: system-ui; padding: 2px;">
            <p style="font-weight: 700; font-size: 12px;
                      color: #0F172A; margin: 0 0 3px 0;
                      line-height: 1.3;">
              ${hospital.name}
            </p>
            <p style="font-size: 11px; color: #6B7280;
                      margin: 0 0 5px 0;">
              ${hospital.lga}, ${hospital.city}
            </p>
            <div style="display: flex; align-items: center;
                        justify-content: space-between;">
              <span style="font-size: 10px; font-weight: 600;
                           padding: 1px 7px; border-radius: 20px;
                           background: ${hospital.ownership === 'public'
                             ? '#f0faf9' : '#ede9fe'};
                           color: ${hospital.ownership === 'public'
                             ? '#1b6b6a' : '#6d28d9'};">
                ${hospital.ownership}
              </span>
              ${hospital.rating_avg ? `
                <span style="font-size: 11px; color: #F59E0B;
                             font-weight: 600;">
                  ★ ${Number(hospital.rating_avg).toFixed(1)}
                </span>
              ` : ''}
            </div>
          </div>
        `)

        // Hover on wrapper — not el — so transform doesn't affect marker pos
        wrapper.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.4)'
          el.style.background = '#1b6b6a'
          popupRef.current?.remove()
          popup
            .setLngLat([hospital.lng, hospital.lat])
            .addTo(map)
          popupRef.current = popup
        })

        wrapper.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)'
          el.style.background = isSelected ? '#1b6b6a' : '#3a9e9d'
          popup.remove()
        })

        wrapper.addEventListener('click', () => {
          onMarkerClick?.(hospital.id)
        })

        const marker = new mapboxgl.Marker({
          element: wrapper,
          anchor:  'center',
        })
          .setLngLat([hospital.lng, hospital.lat])
          .addTo(map)

        markersRef.current.set(hospital.id, marker)
        bounds.extend([hospital.lng, hospital.lat])
      })

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          padding:  { top: 60, bottom: 60, left: 60, right: 60 },
          maxZoom:  13,
          duration: 800,
        })
      }
    }

    if (map.isStyleLoaded()) {
      addMarkers()
    } else {
      map.once('load', addMarkers)
    }
  }, [hospitals, selectedId, onMarkerClick])

  useEffect(() => {
    if (!selectedId || !mapRef.current) return
    const hospital = hospitals.find(h => h.id === selectedId)
    if (hospital?.lat == null || hospital?.lng == null) return

    mapRef.current.easeTo({
      center:   [hospital.lng, hospital.lat],
      zoom:     12,
      duration: 600,
    })
  }, [selectedId, hospitals])

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden
                    border border-gray-100 shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full" />

      <style>{`
        .carefinder-popup .mapboxgl-popup-content {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
          border: 1px solid #F3F4F6;
          padding: 10px 12px;
        }
        .carefinder-popup .mapboxgl-popup-tip {
          border-top-color: white;
        }
        .mapboxgl-ctrl-attrib {
          font-size: 10px;
        }
      `}</style>
    </div>
  )
}