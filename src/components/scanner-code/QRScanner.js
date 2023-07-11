import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

const QRScanner = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let video = videoRef.current;
    let canvas = canvasRef.current;
    let context = canvas.getContext('2d');

    let zoneWidth = 200;
    let zoneHeight = 200;
    let zoneX = 0;
    let zoneY = 0;

    // Request camera permission
    const requestCameraPermission = async () => {
      try {
        const permissionStatus = await navigator.permissions.query({
          name: 'camera',
        });
        if (permissionStatus.state === 'granted') {
          startVideo();
        } else if (permissionStatus.state === 'prompt') {
          permissionStatus.onchange = () => {
            if (permissionStatus.state === 'granted') {
              startVideo();
            }
          };
        }
      } catch (error) {
        console.error('Camera permission request error:', error);
      }
    };

    // Start video stream and scanning
    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: { exact: 'environment' } } })
        .then(function (stream) {
          // Set the video source and start scanning
          video.srcObject = stream;
          video.play();
          setLoading(false);
          requestAnimationFrame(scan);
        })
        .catch(function (error) {
          console.error('Camera access denied:', error);
        });
    };

    // Check if getUserMedia is supported
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      if (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      ) {
        // Request camera permission on mobile devices
        requestCameraPermission();
      } else {
        // Start video stream directly on non-mobile devices
        startVideo();
      }
    } else {
      console.error('getUserMedia is not supported');
    }

    video.addEventListener('loadedmetadata', updateZoneDimensions);
    window.addEventListener('resize', updateZoneDimensions);

    function updateZoneDimensions() {
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // Calculate the scanning zone dimensions and position
      zoneWidth = Math.min(videoWidth, zoneWidth);
      zoneHeight = Math.min(videoHeight, zoneHeight);
      zoneX = (videoWidth - zoneWidth) / 2;
      zoneY = (videoHeight - zoneHeight) / 2;

      // Update the canvas dimensions
      canvas.width = videoWidth;
      canvas.height = videoHeight;
    }

    // Function to scan the video frames for QR codes
    function scan() {
      // Draw the current video frame onto the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get the image data from the scanning zone
      const imageData = context.getImageData(
        zoneX,
        zoneY,
        zoneWidth,
        zoneHeight
      );

      // Decode the QR code from the image data
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      // If a QR code is found, display the result
      if (code) {
        console.log('QR Code:', code.data);
      }

      // Clear the previous zone indicators
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the corner indicators
      const cornerSize = 20;
      const cornerLineWidth = 4;
      const cornerColor = 'red';

      context.strokeStyle = cornerColor;
      context.lineWidth = cornerLineWidth;

      // Top-left corner
      context.beginPath();
      context.moveTo(zoneX, zoneY + cornerSize);
      context.lineTo(zoneX, zoneY);
      context.lineTo(zoneX + cornerSize, zoneY);
      context.stroke();

      // Top-right corner
      context.beginPath();
      context.moveTo(zoneX + zoneWidth - cornerSize, zoneY);
      context.lineTo(zoneX + zoneWidth, zoneY);
      context.lineTo(zoneX + zoneWidth, zoneY + cornerSize);
      context.stroke();

      // Bottom-right corner
      context.beginPath();
      context.moveTo(zoneX + zoneWidth, zoneY + zoneHeight - cornerSize);
      context.lineTo(zoneX + zoneWidth, zoneY + zoneHeight);
      context.lineTo(zoneX + zoneWidth - cornerSize, zoneY + zoneHeight);
      context.stroke();

      // Bottom-left corner
      context.beginPath();
      context.moveTo(zoneX + cornerSize, zoneY + zoneHeight);
      context.lineTo(zoneX, zoneY + zoneHeight);
      context.lineTo(zoneX, zoneY + zoneHeight - cornerSize);
      context.stroke();

      // Request the next animation frame to continue scanning
      requestAnimationFrame(scan);
    }

    return () => {
      // Clean up the video stream and event listeners when the component is unmounted
      if (video.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
      }
      video.removeEventListener('loadedmetadata', updateZoneDimensions);
      window.removeEventListener('resize', updateZoneDimensions);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          Loading...
        </div>
      )}
      <video
        ref={videoRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: loading ? 'none' : 'block',
        }}
      ></video>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        width={videoRef.current ? videoRef.current.videoWidth : 0}
        height={videoRef.current ? videoRef.current.videoHeight : 0}
      ></canvas>
    </div>
  );
};

export default QRScanner;
