import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCard, initializeDb } from './lib/db';
import type { CardData } from './lib/db';

export default function ViewCard() {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  useEffect(() => {
    if (!cardId) {
      setError(true);
      setLoading(false);
      return;
    }

    const fetchCard = async () => {
      try {
        await initializeDb();
        const cardData = await getCard(cardId);
        if (cardData) {
          setCard(cardData);
          setError(false);
        } else {
          setError(true);
        }
      } catch (error) {
        console.error('Error fetching card:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [cardId]);

  useEffect(() => {
    if (!card?.audioUrl) return;

    const el = audioRef.current;
    if (!el) return;

    const playPromise = el.play();
    if (playPromise) {
      playPromise
        .then(() => setAutoplayBlocked(false))
        .catch(() => setAutoplayBlocked(true));
    }

    return () => {
      el.pause();
      el.currentTime = 0;
    };
  }, [card?.audioUrl]);

  useEffect(() => {
    if (!autoplayBlocked) return;
    if (!card?.audioUrl) return;

    const onFirstInteraction = () => {
      const el = audioRef.current;
      if (!el) return;
      const playPromise = el.play();
      if (playPromise) {
        playPromise
          .then(() => setAutoplayBlocked(false))
          .catch(() => setAutoplayBlocked(true));
      }
    };

    window.addEventListener('click', onFirstInteraction, { once: true });
    window.addEventListener('touchstart', onFirstInteraction, { once: true });
    return () => {
      window.removeEventListener('click', onFirstInteraction);
      window.removeEventListener('touchstart', onFirstInteraction);
    };
  }, [autoplayBlocked, card?.audioUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-xl text-black">loading...</p>
        </div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-black">card not found :(</h1>
          <p className="text-xl text-black opacity-80">we can't find the card you're looking for!</p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary btn-lg text-white"
          >
            create your own card
          </button>   
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-black">a card for you!</h1>
      </header>

      {card.audioUrl && (
        <>
          <audio
            ref={audioRef}
            className="hidden"
            preload="auto"
            playsInline
            src={card.audioUrl}
          />
          {autoplayBlocked && (
            <div className="w-full max-w-2xl mb-8">
              <div className="bg-white rounded-xl shadow-lg p-4 text-sm text-black opacity-70">
                open the card!
              </div>
            </div>
          )}
        </>
      )}

      {(() => {
        const hasExtraSurprise = Boolean(
          card.lastPageMessage || card.lastPageText || card.lastPageLink
        );
        return (
          <div className="flex flex-row items-center gap-12 max-w-7xl flex-wrap justify-center">
            <div 
              className="relative w-112.5 h-150 perspective-2000px cursor-pointer group"
              onClick={() => setIsOpen(!isOpen)}
            >
              <div 
                className={`absolute inset-0 z-20 transition-transform duration-1000 ease-in-out origin-left transform-3d ${
                  isOpen ? 'transform-[rotateY(-155deg)]' : 'group-hover:transform-[rotateY(-15deg)]'
                }`}
              >
                <div className="absolute inset-0 bg-primary text-secondary-content rounded-r-2xl border-y-2 border-r-2 border-secondary-focus/30 flex items-center justify-center backface-hidden shadow-2xl">
                  <div className="text-center px-10">
                    <div className="text-7xl mb-8">{card.emoji}</div>
                    <h1 className="text-5xl font-black text-white tracking-tight">{card.title}</h1>
                  </div>
                </div>

                <div className="absolute inset-0 bg-white text-neutral-content rounded-l-2xl transform-[rotateY(180deg)] backface-hidden border-l border-white/10 flex flex-col items-center justify-center p-12">
                    {card.imageUrl ? (
                      <img src={card.imageUrl} alt="card" className="w-full h-full object-cover rounded-l-xl" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">no image</div>
                    )}
                </div>
              </div>

              <div className="absolute inset-0 z-10 bg-white text-neutral-content rounded-r-2xl border-2 border-neutral-focus shadow-[25px_25px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col justify-between p-12">
                <div className="space-y-8">
                  <p className="text-sm text-black leading-relaxed opacity-80">
                    {card.message}
                  </p>
                </div>
              </div>
            </div>

            {hasExtraSurprise && (
              <div className="flex flex-col gap-4">
                <button 
                  className="btn btn-primary text-white p-5" 
                  onClick={() => navigate(`/card/${cardId}/last`)}
                >
                  extra surprise
                </button>
              </div>
            )}
          </div>
        );
      })()}

      <button 
        className="btn btn-secondary text-white p-5 mt-8" 
        onClick={() => navigate('/')}
      >
        create your own card
      </button>
    </div>
  );
}
