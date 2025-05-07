// Mizu Radio – With Header, Restart Animation, and Fade-to-TV Effect
import { useEffect, useState } from 'react';
import Head from 'next/head';

const tracks = [
  {
    title: 'Sweet Swegbe (Path.Mizu)',
    artworkUrl: 'https://via.placeholder.com/300x300.png?text=Sweet+Swegbe',
    audioUrl: '/music/sweet-swegbe.mp3',
    description: 'A meditative groove rooted in spirit and swing.'
  },
  {
    title: 'Ndovo Toti (Path.Mizu)',
    artworkUrl: 'https://via.placeholder.com/300x300.png?text=Ndovo+Toti',
    audioUrl: '/music/ndovo-toti.mp3',
    description: 'An Afro-sonic journey into emotion and ritual.'
  }
];

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [activeTrack, setActiveTrack] = useState(null);
  const [restarting, setRestarting] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!loading && !restarting) return;
    const timer = setTimeout(() => setLoading(false), 4000);
    return () => clearTimeout(timer);
  }, [loading, restarting]);

  useEffect(() => {
    if (!restarting) return;
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);
    return () => clearInterval(interval);
  }, [restarting]);

  const restartSite = () => {
    setRestarting(true);
    setTimeout(() => {
      setRestarting(false);
      setLoading(true);
      setActiveTrack(null);
    }, 3000);
  };

  return (
    <>
      <Head>
        <title>Mizu Radio | curated by mos.path</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌊</text></svg>" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>
      <div className="font-sans min-h-screen bg-black text-white relative overflow-hidden">
        {loading && !restarting && (
          <div className="fixed inset-0 flex flex-col justify-center items-center z-50 bg-black text-center">
            <div className="absolute inset-0 bg-cover bg-center grayscale contrast-125 brightness-50 animate-pulse" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1494232410401-ad00d5431038?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)' }}></div>
            <h1 className="text-4xl md:text-6xl text-blue-400 font-mono pixel-font z-10 animate-fade-loop">Mizu Radio</h1>
            <p className="text-sm md:text-xl text-gray-300 mt-2 z-10 pixel-font">curated by mos.path</p>
            <div className="w-64 h-4 bg-blue-900 rounded overflow-hidden mt-6 z-10">
              <div className="h-full bg-blue-400 animate-loading w-full"></div>
            </div>
          </div>
        )}

        {!loading && !restarting && (
          <main className="relative z-10 px-4 py-12 md:px-12">
            <header className="text-center text-blue-400 text-2xl pixel-font cursor-pointer mb-8" onClick={restartSite}>
              Mizu Radio
            </header>
            <h1 className="text-center text-xl md:text-3xl pixel-font text-blue-400 mb-12">SELECT A MIX</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {tracks.map((track, index) => (
                <div key={index} onClick={() => setActiveTrack(track)} className="cursor-pointer bg-gray-900 p-4 rounded-lg border border-blue-800 hover:border-blue-400 hover:scale-[1.02] transform transition duration-300">
                  <img src={track.artworkUrl} alt={track.title} className="rounded-full w-full aspect-square object-cover mb-4" />
                  <h3 className="text-lg pixel-font text-blue-300 mb-2">{track.title}</h3>
                  <p className="text-sm text-gray-400">{track.description}</p>
                </div>
              ))}
            </div>
          </main>
        )}

        {activeTrack && !restarting && (
          <div className="fixed bottom-0 left-0 right-0 bg-black/80 border-t border-blue-800 px-6 py-4 flex flex-col md:flex-row justify-between items-center backdrop-blur">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <img src={activeTrack.artworkUrl} alt={activeTrack.title} className="w-16 h-16 rounded-full" />
              <div>
                <h4 className="pixel-font text-blue-300 text-sm">{activeTrack.title}</h4>
                <p className="text-xs text-gray-400">mos.path</p>
              </div>
            </div>
            <audio controls autoPlay src={activeTrack.audioUrl} className="w-full mt-4 md:mt-0 md:w-auto" />
          </div>
        )}

        {restarting && (
          <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-full h-1 bg-white animate-tv-shut" />
            </div>
            <p className="text-blue-400 pixel-font mt-6 text-xl">restarting{dots}</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .pixel-font {
          font-family: 'Press Start 2P', cursive;
        }
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-loading {
          animation: loading 3s ease-out forwards;
        }
        @keyframes fade-loop {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        .animate-fade-loop {
          animation: fade-loop 2.5s ease-in-out infinite;
        }
        @keyframes tv-shut {
          0% { transform: scaleY(1); opacity: 1; }
          50% { transform: scaleY(0.1); opacity: 0.6; }
          100% { transform: scaleY(0); opacity: 0; }
        }
        .animate-tv-shut {
          animation: tv-shut 0.6s ease-out forwards;
        }
      `}</style>
    </>
  );
}
