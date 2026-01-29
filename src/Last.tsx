import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BsHeartFill } from 'react-icons/bs'
import { getCard, initializeDb } from './lib/db';

export default function Last() {
  const navigate = useNavigate();
  const { cardId } = useParams();
  const [fadeOut, setFadeOut] = useState(false);
  const [showFinal, setShowFinal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastPageMessage, setLastPageMessage] = useState('');
  const [lastPageText, setLastPageText] = useState('');
  const [lastPageLink, setLastPageLink] = useState('');

  useEffect(() => {
    const fetchCardData = async () => {
      if (!cardId) {
        setLoading(false);
        return;
      }

      try {
        await initializeDb();
        const card = await getCard(cardId);
        if (card) {
          setLastPageMessage(card.lastPageMessage || 'thanks for reading my card! here are some things you might like:');
          setLastPageText(card.lastPageText || 'create another card');
          setLastPageLink(card.lastPageLink || '');
        }
      } catch (err) {
        console.error('Error fetching card:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCardData();

    setTimeout(() => setFadeOut(true), 1500);
    setTimeout(() => setShowFinal(true), 2500);
  }, [cardId]);

  const handleLinkClick = () => {
    if (lastPageLink) {
      if (lastPageLink.startsWith('/')) {
        navigate(lastPageLink);
      } else {
        let url = lastPageLink;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        window.open(url, '_blank');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-xl text-black">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center h-screen text-center text-black">
      <div
        className={`
          absolute text-3xl transition-opacity duration-1000
          ${fadeOut ? "opacity-0" : "opacity-100"}
        `}
      >
        and one more thing...
      </div>

      {showFinal && (
        <div className="space-y-8 max-w-2xl">
          <div className="space-y-4">
            <div
              className="text-2xl opacity-0"
              style={{ animation: "fadeIn 1s ease forwards" }}
            >
              {lastPageMessage}
            </div>
          </div>

          {lastPageText && (
            <button
              onClick={handleLinkClick}
              className="btn btn-primary btn-lg text-white w-full opacity-0"
              style={{ animation: "fadeIn 1s ease forwards 0.2s", animationFillMode: "forwards" }}
            >
              {lastPageText}
            </button>
          )}

          <button
            onClick={() => navigate('/')}
            className="btn btn-ghost text-black mt-8 text-lg opacity-0"
            style={{ animation: "fadeIn 1s ease forwards 0.4s", animationFillMode: "forwards" }}
          >
            back to home
          </button>
        </div>
      )}
      <div className="fixed bottom-0 left-0 w-full text-xl flex justify-center text-center p-4 bg-base-200 text-black">
        made with 
            <span>
            <BsHeartFill size={20} className="ms-2 me-2 mt-1 mb-1 text-red-500" />
              </span> 
              by 
              <a 
                href="https://github.com/akshayans" 
                className="ms-2 me-2 mb-2 mt font-shrikhand text-white visited:text-white text-outline-white no-underline" 
                style={{ textShadow: '0 0 10px red, 0 0 20px darkred' }}
              >
              akshayan
            </a> 
          </div>
    </div>
  );
}