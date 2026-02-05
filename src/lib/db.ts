const API_BASE = (import.meta.env.VITE_CARDMAKER_API_URL as string | undefined)?.replace(/\/+$/, '');

function requireApiBase() {
  if (!API_BASE) {
    throw new Error('no api url');
  }
  return API_BASE;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = requireApiBase();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status} ${res.statusText}${text ? `: ${text}` : ''}`);
  }

  return (await res.json()) as T;
}

export type CardData = {
  id: string;
  title: string;
  emoji: string;
  message: string;
  imageUrl?: string;
  audioUrl?: string;
  lastPageMessage?: string;
  lastPageText?: string;
  lastPageLink?: string;
  createdAt: number;
};

export async function initializeDb() {
  try {
    await apiFetch<{ ok: true }>('/init', { method: 'POST', body: '{}' });
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

export async function insertCard(cardData: Omit<CardData, 'id'>): Promise<string> {
  try {
    const result = await apiFetch<{ id: string }>('/cards', {
      method: 'POST',
      body: JSON.stringify(cardData),
    });

    return result.id;
  } catch (error) {
    console.error('Error inserting card:', error);
    throw error;
  }
}

export async function getCard(id: string): Promise<CardData | null> {
  try {
    const result = await apiFetch<{ card: CardData | null }>(`/cards/${encodeURIComponent(id)}`, {
      method: 'GET',
    });

    return result.card;
  } catch (error) {
    console.error('Error fetching card:', error);
    throw error;
  }
}
