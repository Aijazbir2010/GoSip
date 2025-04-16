import { useEffect, useState } from "react";
import { useNavigation } from "@remix-run/react";

export default function ProgressBar() {
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (navigation.state === "loading") {
      setProgress(0);
      timer = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);
    } else {
      setProgress(100); // Complete the progress bar
      setTimeout(() => setProgress(100), 500);
    }
    return () => clearInterval(timer);
  }, [navigation.state]);

  return (
    <div style={{width: `${progress}%`, transition: 'width 0.2s ease-out, opacity 0.5s ease-out', opacity: `${progress === 100 ? '0' : '100'}`}} className={`fixed top-0 left-0 h-2 bg-[#4BB3FD] rounded-r-full z-[100]`}></div>
  );
}