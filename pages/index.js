// pages/index.js – Mizu Radio – Full Startup Flow with Restart and Push-to-Start Button
import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [showStartButton, setShowStartButton] = useState(false);
  const [started, setStarted] = useState(false);
  const [activeTrack, setActiveTrack] = useState(null);
  const [restarting, setRestarting] = useState(false);
  const [dots, setDots] = useState('');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [tracks, setTracks] = useState([]);
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const res = await fetch('/api/soundcloud');
        const data = await res.json();

        if (Array.isArray(data)) {
          setTracks(data);
        } else {
          console.error('Unexpected data from /api/soundcloud:', data);
          setTracks([]);
        }
      } catch (error) {
        console.error('Error fetching tracks:', error);
        setTracks([]);
      }
    };

    fetchTracks();
  }, []);

  useEffect(() => {
    if (!loading || restarting) return;
    const timer = setTimeout(() => setShowStartButton(true), 2000);
    return () => clearTimeout(timer);
  }, [loading, restarting]);

  useEffect(() => {
    if (!restarting) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, [restarting]);

  const handleStart = () => {
    setIsFadingOut(true);
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setTimeout(() => {
                setLoading(false);
                setShowStartButton(false);
                setStarted(true);
                setIsFadingOut(false);
              }, 500);
            })
            .catch(() => {
              setTimeout(() => {
                setLoading(false);
                setShowStartButton(false);
                setStarted(true);
                setIsFadingOut(false);
              }, 500);
            });
        }
      } catch {
        setTimeout(() => {
          setLoading(false);
          setShowStartButton(false);
          setStarted(true);
          setIsFadingOut(false);
        }, 500);
      }
    } else {
      setTimeout(() => {
        setLoading(false);
        setShowStartButton(false);
        setStarted(true);
        setIsFadingOut(false);
      }, 500);
    }
  };

  const restartSite = () => {
    setRestarting(true);
    setTimeout(() => {
      setRestarting(false);
      setLoading(true);
      setShowStartButton(false);
      setStarted(false);
      setActiveTrack(null);
    }, 3000);
  };

  return (
    <>
      <Head>
        <title>Mizu Radio | curated by mos.path</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌊</text></svg>"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Roboto:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div
        className={`font-sans min-h-screen bg-black text-white relative overflow-hidden ${
          started ? 'fade-in' : ''
        }`}
      >
        <audio ref={audioRef} src="/audio/start-intro.mp3" type="audio/mpeg" preload="auto" />

        {loading && !showStartButton && !restarting && (
          <div className="fixed inset-0 flex flex-col justify-center items-center z-50 bg-black text-center">
            <div
              className="absolute inset-0 bg-cover bg-center grayscale contrast-125 brightness-50 animate-pulse"
              style={{
                backgroundImage:
                  'url(https://images.unsplash.com/photo-1494232410401-ad00d5431038?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)'
              }}
            ></div>
            <h1 className="text-4xl md:text-6xl text-blue-400 font-mono pixel-font z-10 animate-fade-loop">
              Mizu Radio
            </h1>
            <p className="text-sm md:text-xl text-gray-300 mt-2 z-10 pixel-font">curated by mos.path</p>
            <div className="w-64 h-4 bg-blue-900 rounded overflow-hidden mt-6 z-10">
              <div className="h-full bg-blue-400 animate-loading w-full"></div>
            </div>
          </div>
        )}

        {loading && showStartButton && !restarting && (
          <div
            className={`fixed inset-0 flex flex-col justify-center items-center z-50 bg-black text-center fade-in ${
              isFadingOut ? 'fade-out' : ''
            }`}
          >
            <h1 className="text-blue-400 pixel-font text-xl animate-fade-loop">Push Start</h1>
            <button
              onClick={handleStart}
              className={`mt-8 bg-blue-600 text-white pixel-font px-6 py-3 rounded animate-pulse-fast border-2 border-blue-400 hover:scale-105 transition${
                isFadingOut ? ' fade-out' : ''
              }`}
            >
              ▶ Start
            </button>
          </div>
        )}

        {started && !loading && !restarting && (
          <main className="relative z-10 px-4 py-12 md:px-12">
            <header
              className="text-center text-blue-400 text-2xl pixel-font cursor-pointer mb-8"
              onClick={restartSite}
            >
              Mizu Radio
            </header>
            <h1 className="text-center text-xl md:text-3xl pixel-font text-blue-400 mb-12">
              CHOOSE YOUR VIBE
            </h1>

            {tracks.length === 0 && (
              <p className="text-center text-gray-500 pixel-font">No tracks available</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center items-start px-4">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="bg-black border-2 border-blue-500 rounded-lg shadow-lg overflow-hidden p-4"
                >
                  <div className="pixel-font text-blue-300 font-bold mb-2">Now Playing</div>
                  <div className="flex items-center space-x-4">
                    <img
                      src={track.artwork_url || 'https://via.placeholder.com/100'}
                      alt={track.title}
                      className="w-16 h-16 rounded-full"
                    />
                    <div className="flex-1">
                      <h2 className="text-blue-300 pixel-font text-sm">{track.title}</h2>
                      <audio
                      controls
                      src={track.stream_url}
                      className="w-full mt-2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        )}

        {activeTrack && !restarting && (
          <div className="fixed bottom-0 left-0 right-0 bg-black/80 border-t border-blue-800 px-6 py-4 flex flex-col md:flex-row justify-between items-center backdrop-blur">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <img
                src={activeTrack.artworkUrl}
                alt={activeTrack.title}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h4 className="pixel-font text-blue-300 text-sm">{activeTrack.title}</h4>
                <p className="text-xs text-gray-400">mos.path</p>
              </div>
            </div>
            <audio
              controls
              autoPlay
              src={activeTrack.audioUrl}
              className="w-full mt-4 md:mt-0 md:w-auto"
            />
          </div>
        )}

        {restarting && (
          <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-full h-1 bg-white animate-tv-shut" />
            </div>
            <p className="text-blue-400 pixel-font text-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              restarting{dots}
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .fade-in {
          animation: fadeIn 0.6s ease-in forwards;
        }
        .pixel-font {
          font-family: 'Press Start 2P', cursive;
        }
        @keyframes loading {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-loading {
          animation: loading 3s ease-out forwards;
        }
        @keyframes fade-loop {
          0%,
          100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }
        .animate-fade-loop {
          animation: fade-loop 2.5s ease-in-out infinite;
        }
        @keyframes tv-shut {
          0% {
            transform: scaleY(1);
            opacity: 1;
          }
          50% {
            transform: scaleY(0.1);
            opacity: 0.6;
          }
          100% {
            transform: scaleY(0);
            opacity: 0;
          }
        }
        .animate-tv-shut {
          animation: tv-shut 0.6s ease-out forwards;
        }
        @keyframes pulse-fast {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .animate-pulse-fast {
          animation: pulse-fast 0.8s ease-in-out infinite;
        }
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        .fade-out {
          animation: fadeOut 0.5s ease-out forwards;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}