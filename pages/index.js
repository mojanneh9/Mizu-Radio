// Mizu Radio – Full Startup Flow with Restart and Push-to-Start Button
import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';

const tracks = [
  {
    title: 'Sweet Swegbe (Path.Mizu)',
    artworkUrl: 'https://via.placeholder.com/300x300.png?text=Sweet+Swegbe',
    audioUrl: '/music/Sweet Swegbe (Path.Mizu).mp3',
    description: 'A meditative groove rooted in spirit and swing.'
  },
  {
    title: 'Ndovo Toti (Path.Mizu)',
    artworkUrl: 'https://via.placeholder.com/300x300.png?text=Ndovo+Toti',
    audioUrl: '/music/Ndovo Toti (Path.Mizu).mp3',
    description: 'An Afro-sonic journey into emotion and ritual.'
  }
];

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [showStartButton, setShowStartButton] = useState(false);
  const [started, setStarted] = useState(false);
  const [activeTrack, setActiveTrack] = useState(null);
  const [restarting, setRestarting] = useState(false);
  const [dots, setDots] = useState('');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const audioRef = useRef(null);

  useEffect(() => {
    if (!loading || restarting) return;
    const timer = setTimeout(() => {
      setShowStartButton(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, [loading, restarting]);

  useEffect(() => {
    if (!restarting) return;
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
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
                audioRef.current.onended = () => {
                  setLoading(false);
                  setShowStartButton(false);
                  setStarted(true);
                  setIsFadingOut(false);
                };
              }, 500);
            })
            .catch((error) => {
              console.error('Audio play error:', error);
              setTimeout(() => {
                setLoading(false);
                setShowStartButton(false);
                setStarted(true);
                setIsFadingOut(false);
              }, 500);
            });
        }
      } catch (err) {
        console.error('Playback error:', err);
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
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌊</text></svg>" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>
      <div className={`font-sans min-h-screen bg-black text-white relative overflow-hidden ${started ? 'fade-in' : ''}`}>
        <audio ref={audioRef} src="/audio/start-intro.mp3" type="audio/mpeg" preload="auto" />
        {loading && !showStartButton && !restarting && (
          <div className="fixed inset-0 flex flex-col justify-center items-center z-50 bg-black text-center">
            <div className="absolute inset-0 bg-cover bg-center grayscale contrast-125 brightness-50 animate-pulse" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1494232410401-ad00d5431038?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)' }}></div>
            <h1 className="text-4xl md:text-6xl text-blue-400 font-mono pixel-font z-10 animate-fade-loop">Mizu Radio</h1>
            <p className="text-sm md:text-xl text-gray-300 mt-2 z-10 pixel-font">curated by mos.path</p>
            <div className="w-64 h-4 bg-blue-900 rounded overflow-hidden mt-6 z-10">
              <div className="h-full bg-blue-400 animate-loading w-full"></div>
            </div>
          </div>
        )}

        {loading && showStartButton && !restarting && (
          <div className={`fixed inset-0 flex flex-col justify-center items-center z-50 bg-black text-center fade-in ${isFadingOut ? 'fade-out' : ''}`}>
            <h1 className="text-blue-400 pixel-font text-xl animate-fade-loop">Push Start</h1>
            <button onClick={handleStart} className={`mt-8 bg-blue-600 text-white pixel-font px-6 py-3 rounded animate-pulse-fast border-2 border-blue-400 hover:scale-105 transition${isFadingOut ? ' fade-out' : ''}`}>▶ Start</button>
          </div>
        )}

        {started && !loading && !restarting && (
          <>
            <main className="relative z-10 px-4 py-12 md:px-12">
              <header className="text-center text-blue-400 text-2xl pixel-font cursor-pointer mb-8" onClick={restartSite}>
                Mizu Radio
              </header>
              <h1 className="text-center text-xl md:text-3xl pixel-font text-blue-400 mb-12">SELECT A MIX</h1>

              <div className="flex justify-center space-x-4 mb-6">
                {['All', 'Tracks', 'Playlists'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded pixel-font border-2 transition ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white border-blue-400'
                        : 'bg-black text-blue-400 border-blue-700 hover:bg-blue-800 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {false && (
                <div className="flex justify-center items-center">
                  <div className="overflow-x-auto whitespace-nowrap flex space-x-6 px-4 pb-8 scrollbar-hide">
                    {tracks.map((track, index) => (
                      <div
                        key={index}
                        onClick={() => setActiveTrack(track)}
                        className="inline-block cursor-pointer transform hover:scale-105 transition duration-300"
                      >
                        <img
                          src={track.artworkUrl}
                          alt={track.title}
                          className="w-48 h-48 rounded-full object-cover border-4 border-blue-500 mx-auto"
                        />
                        <h3 className="text-lg pixel-font text-blue-300 mt-4 text-center">{track.title}</h3>
                        <p className="text-sm text-gray-400 text-center">{track.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </main>

            <section className="mt-16">
              {activeTab === 'Tracks' || activeTab === 'All' ? (
                <>
                  <div className="flex justify-center mb-6">
                    <div className="w-full max-w-2xl border-2 border-blue-500 rounded-lg shadow-lg overflow-hidden bg-black p-4">
                      <div className="pixel-font text-blue-300 font-bold mb-2">Now Playing</div>
                      <iframe
                        width="100%"
                        height="300"
                        scrolling="no"
                        frameBorder="no"
                        allow="autoplay"
                        src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/mos-path/sets/369-ep&color=%23b09b7f&auto_play=false&hide_related=false&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=true"
                        className="w-full h-full"
                      ></iframe>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center items-start px-4">
                    {[
                      'https://soundcloud.com/mos-path/forever-path-mizu',
                      'https://soundcloud.com/mos-path/joiful-distractrions-pathmizu',
                      'https://soundcloud.com/mos-path/sets/foundation-fm',
                      'https://soundcloud.com/mos-path/sets/kompound-radio-the-vibe-spot',
                      'https://soundcloud.com/mos-path/not-enough-smoke-path-mizu',
                      'https://soundcloud.com/wearerwdy/jester',
                      'https://soundcloud.com/mos-path/sets/mizu-radio',
                      'https://soundcloud.com/mos-path/sets/mizu-radio-a-junior-lamb'
                    ].map((url, index) => (
                      <div key={index} className="bg-black border-2 border-blue-500 rounded-lg shadow-lg overflow-hidden p-4">
                        <div className="pixel-font text-blue-300 font-bold mb-2">Now Playing</div>
                        <iframe
                          width="100%"
                          height="166"
                          scrolling="no"
                          frameBorder="no"
                          allow="autoplay"
                          src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%230066cc&auto_play=false&show_comments=false&show_user=true&show_reposts=false`}
                          className="w-full h-full"
                        ></iframe>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}

              {activeTab === 'Playlists' || activeTab === 'All' ? (
                <div className="flex justify-center">
                  <div className="w-full max-w-2xl border-2 border-blue-500 rounded-lg shadow-lg overflow-hidden bg-black p-4">
                    <div className="pixel-font text-blue-300 font-bold mb-2">Now Playing</div>
                    <iframe
                      width="100%"
                      height="300"
                      scrolling="no"
                      frameBorder="no"
                      allow="autoplay"
                      src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1970731944&color=%23b09b7f&auto_play=false&hide_related=false&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=true"
                      className="w-full h-full"
                    ></iframe>
                  </div>
                </div>
              ) : null}
            </section>

            {false && (
              <section className="mt-12">
                <h2 className="text-center text-blue-400 text-xl pixel-font mb-4">Available On</h2>
                <div className="flex justify-center gap-4 flex-wrap">
                  <a href="https://open.spotify.com/artist/your-artist-id" target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded pixel-font">Listen on Spotify</a>
                  <a href="https://music.apple.com/your-artist-link" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded pixel-font">Listen on Apple Music</a>
                  <a href="https://tidal.com/browse/artist/your-artist-id" target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded pixel-font">Listen on Tidal</a>
                  <a href="https://deezer.com/en/artist/your-artist-id" target="_blank" rel="noopener noreferrer" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded pixel-font">Listen on Deezer</a>
                </div>
              </section>
            )}
          </>
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
            <p className="text-blue-400 pixel-font text-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">restarting{dots}</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .fade-in {
          animation: fadeIn 0.6s ease-in forwards;
        }
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
        @keyframes pulse-fast {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-pulse-fast {
          animation: pulse-fast 0.8s ease-in-out infinite;
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
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
