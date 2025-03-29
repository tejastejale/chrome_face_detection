import { useEffect, useRef, useState } from "react";

const LiveFaceDetection = () => {
  const videoRef = useRef(null);
  const [faceBoxes, setFaceBoxes] = useState([]);

  useEffect(() => {
    if (!("FaceDetector" in window)) {
      alert("Face Detection API is not supported in this browser.");
      return;
    }

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        alert("Failed to access webcam");
      }
    };

    startVideo();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const detectFaces = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const faceDetector = new window.FaceDetector();

    try {
      const faces = await faceDetector.detect(video);

      // Get video dimensions
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      const displayWidth = video.clientWidth;
      const displayHeight = video.clientHeight;

      // Scale factors
      const scaleX = displayWidth / videoWidth;
      const scaleY = displayHeight / videoHeight;

      setFaceBoxes(
        faces.map(({ boundingBox }) => ({
          top: boundingBox.top * scaleY,
          left: boundingBox.left * scaleX,
          width: boundingBox.width * scaleX,
          height: boundingBox.height * scaleY,
        }))
      );

      requestAnimationFrame(detectFaces); // Keep detecting
    } catch (err) {
      console.error("Face detection error:", err);
    }
  };

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-screen h-screen"
        onPlay={detectFaces}
      />
      {faceBoxes.map((box, index) => (
        <div
          key={index}
          className="absolute border-2 border-red-500"
          style={{
            position: "absolute",
            top: `${box.top}px`,
            left: `${box.left}px`,
            width: `${box.width}px`,
            height: `${box.height}px`,
          }}
        ></div>
      ))}
    </div>
  );
};

export default LiveFaceDetection;
