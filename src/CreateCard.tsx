import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { insertCard, initializeDb } from './lib/db';

const emojis = ['🎂', '🎉', '❤️', '🌟', '🎁', '🎊', '💝', '🌹', '🎈', '✨', '🦋', '🌺', '💐', '🍾', '🎭', '🎨', '🎵', '🌈'];

export default function CreateCard() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    emoji: '💖',
    message: '',
    imageUrl: '',
    audioUrl: '',
    lastPageMessage: '',
    lastPageText: '',
    lastPageLink: '',
  });
  const [copied, setCopied] = useState(false);
  const [cardCreated, setCardCreated] = useState(false);
  const [cardLink, setCardLink] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [audioName, setAudioName] = useState<string>('');


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      setFormData(prev => ({
        ...prev,
        imageUrl: base64
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert('Please upload an audio file');
      return;
    }

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      alert('Audio file is too large. Please use an mp3 under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAudioPreview(base64);
      setAudioName(file.name);
      setFormData(prev => ({
        ...prev,
        audioUrl: base64
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreateCard = async () => {
    if (!formData.title || !formData.message) {
      alert('Please fill in all fields');
      return;
    }

    await initializeDb();

    const cardData = {
      title: formData.title,
      emoji: formData.emoji,
      message: formData.message,
      ...(formData.imageUrl && { imageUrl: formData.imageUrl }),
      ...(formData.audioUrl && { audioUrl: formData.audioUrl }),
      ...(formData.lastPageMessage && { lastPageMessage: formData.lastPageMessage }),
      ...(formData.lastPageText && { lastPageText: formData.lastPageText }),
      ...(formData.lastPageLink && { lastPageLink: formData.lastPageLink }),
      createdAt: Date.now(),
    };

    try {
      const cardId = await insertCard(cardData);
      const link = `${window.location.origin}/card/${cardId}`;
      setCardLink(link);
      setCardCreated(true);
    } catch (error) {
      console.error('Error creating card:', error);
      alert('Failed to create card. Please try again.');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(cardLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (cardCreated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-bold text-black mb-4">card created!!</h2>
          <p className="text-black opacity-80 mb-6">give this link to someone</p>       
          <div className="bg-white rounded-lg p-4 mb-10 shadow-lg w-full max-w-3xl">
            <input type="text" value={cardLink} readOnly className="bg-gray-100 text-black p-3 rounded border-2 border-gray-300 text-sm font-mono w-full" />
          </div>
          <button
            onClick={handleCopyLink}
            className="btn btn-primary btn-lg text-white mb-4 w-full"
          >
            {copied ? 'copied!' : 'copy'}
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn btn-ghost text-black w-full mt-3"
          >
            go back
          </button>
        </div>
      </div>
    );
  }

  return (
      <>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-black mb-8 text-center">create a card</h1>
        
        <div className="space-y-6 bg-white rounded-xl p-8 shadow-lg">
          <div>
            <label className="label">
              <span className="label-text font-semibold mb-3 text-black">title</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="for example: happy birthday!"
              className="input input-bordered w-full text-black placeholder-gray-400"
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-semibold text-black">cover emoji</span>
            </label>
            <div className="grid grid-cols-6 gap-2">
              {emojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setFormData(prev => ({ ...prev, emoji }))}
                  className={`text-3xl p-3 rounded-lg transition-all ${
                    formData.emoji === emoji ? 'ring-2 ring-primary scale-110' : 'hover:scale-110'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-semibold text-black">a message</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="write your message!"
              rows={6}
              className="textarea textarea-bordered w-full text-black placeholder-gray-400"
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-semibold text-black">add an image (optional)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="file-input file-input-bordered w-full text-black"
            />
            {imagePreview && (
              <div className="mt-4 rounded-lg overflow-hidden shadow-md">
                <img src={imagePreview} alt="preview" className="max-h-64 mx-auto" />
              </div>
            )}
          </div>

          <div>
            <label className="label">
              <span className="label-text font-semibold text-black">add music (mp3) (optional)</span>
            </label>
            <input
              type="file"
              accept="audio/mpeg,audio/mp3,audio/*"
              onChange={handleAudioUpload}
              className="file-input file-input-bordered w-full text-black"
            />
            {audioPreview && (
              <div className="mt-4 rounded-lg overflow-hidden shadow-md p-4 bg-gray-50">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="text-sm text-black opacity-80 break-all">{audioName}</div>
                  <button
                    className="btn btn-ghost btn-sm text-black"
                    onClick={() => {
                      setAudioPreview(null);
                      setAudioName('');
                      setFormData(prev => ({ ...prev, audioUrl: '' }));
                    }}
                  >
                    remove
                  </button>
                </div>
                <audio className="w-full mt-3" controls preload="metadata" src={audioPreview} />
              </div>
            )}
          </div>

          <div className="divider text-black my-8">optional: customize the final page</div>

          <div>
            <label className="label">
              <span className="label-text font-semibold text-black">final message</span>
            </label>
            <textarea
              name="lastPageMessage"
              value={formData.lastPageMessage}
              onChange={handleChange}
              placeholder="heres a gift!"
              rows={3}
              className="textarea textarea-bordered w-full text-black placeholder-gray-400"
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-semibold text-black">button text</span>
            </label>
            <input
              type="text"
              name="lastPageText"
              value={formData.lastPageText}
              onChange={handleChange}
              placeholder="e.g., open gift"
              className="input input-bordered w-full text-black placeholder-gray-400"
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-semibold text-black">button link (optional)</span>
            </label>
            <input
              type="url"
              name="lastPageLink"
              value={formData.lastPageLink}
              onChange={handleChange}
              placeholder="https://example.com"
              className="input input-bordered w-full text-black placeholder-gray-400"
            />
          </div>

          <button
            onClick={handleCreateCard}
            className="btn btn-primary btn-lg text-white w-full"
          >
            create card
          </button>

          <button
            onClick={() => navigate('/')}
            className="btn btn-ghost text-black w-full"
          >
            cancel
          </button>
        </div>
      </div>
    </>
  );
}
