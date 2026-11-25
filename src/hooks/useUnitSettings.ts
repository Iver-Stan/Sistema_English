import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { UnitSettings, YoutubeLink } from '../types/database';

const FALLBACK_SETTINGS: UnitSettings = {
  unit_id: 'unit-1',
  practice_url: 'https://www.gamestolearnenglish.com/clothes-game/',
  theory_pdf_url: null,
  youtube_links: [
    {
      title: 'Clothes Vocabulary in English (Basic)',
      description: 'Repasa las prendas básicas y su pronunciación en inglés con ejemplos visuales.',
      url: 'https://www.youtube.com/results?search_query=clothes+vocabulary+in+english+for+beginners',
    },
    {
      title: 'Colors & Clothes: What are you wearing?',
      description: 'Practica cómo combinar colores y ropa usando frases como I am wearing...',
      url: 'https://www.youtube.com/results?search_query=what+are+you+wearing+clothes+and+colors+english',
    },
    {
      title: 'British Council LearnEnglish - Clothes',
      description: 'Canciones y ejercicios interactivos de pronunciación para principiantes.',
      url: 'https://www.youtube.com/results?search_query=british+council+clothes+and+colors+english',
    },
  ],
  updated_at: new Date().toISOString(),
};

function sanitizeYoutubeLinks(raw: unknown): YoutubeLink[] {
  if (!Array.isArray(raw)) return FALLBACK_SETTINGS.youtube_links;
  return raw
    .filter(
      (item): item is YoutubeLink =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof (item as YoutubeLink).title === 'string' &&
        typeof (item as YoutubeLink).url === 'string'
    )
    .map((item) => ({
      title: item.title,
      description: item.description || '',
      url: item.url,
    }));
}

export function useUnitSettings(unitId = 'unit-1') {
  const [settings, setSettings] = useState<UnitSettings>(FALLBACK_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('unit_settings')
      .select('*')
      .eq('unit_id', unitId)
      .maybeSingle();

    if (error) {
      console.error('Error cargando configuración de unidad:', error.message);
      setLoading(false);
      return;
    }

    if (data) {
      setSettings({
        unit_id: data.unit_id,
        practice_url: data.practice_url || FALLBACK_SETTINGS.practice_url,
        theory_pdf_url: data.theory_pdf_url || null,
        youtube_links: sanitizeYoutubeLinks(data.youtube_links),
        updated_at: data.updated_at,
      });
    }
    setLoading(false);
  }, [unitId]);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  return { settings, loading, refresh: fetchSettings };
}
