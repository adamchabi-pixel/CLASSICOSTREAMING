import React from "react";
import { AlertCircle } from "lucide-react";

interface EmbedPlayerProps {
  embedUrl: string;
}

const EmbedPlayer: React.FC<EmbedPlayerProps> = ({ embedUrl }) => {
  const [error, setError] = React.useState<boolean>(false);

  const handleError = (e: any) => {
    console.error("EmbedPlayer Error: failed to load iframe source", e);
    setError(true);
  };

  if (error) {
    return (
      <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-white z-40 p-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Erreur de chargement</h3>
        <p className="text-zinc-400 max-w-md">
          Impossible de charger le lecteur vidéo. Le serveur de streaming est peut-être inaccessible ou la vidéo n'est plus disponible.
        </p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full z-40 bg-black">
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        allowFullScreen
        onError={handleError}
      ></iframe>
    </div>
  );
};

export default EmbedPlayer;
