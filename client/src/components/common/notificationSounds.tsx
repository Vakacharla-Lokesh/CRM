import { useEffect, useRef } from "react";

const NotificationSound = ({ trigger }: { trigger: boolean }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (trigger && audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.log("Audio play failed:", err);
      });
    }
  }, [trigger]);

  return (
    <audio
      ref={audioRef}
      src="/sounds/notification.wav"
    />
  );
};

export default NotificationSound;
