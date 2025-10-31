import React, { useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';

const VideoCall = () => {
  const { roomID: urlRoomID } = useParams();
  const location = useLocation();
  const { userID: stateUserID, userName: stateUserName } = location.state || {};
  
  const containerRef = useRef(null);
  const zpRef = useRef(null);

  useEffect(() => {
    // Generate random IDs if not provided
    const roomID = urlRoomID || (Math.floor(Math.random() * 10000) + "");
    const userID = stateUserID || (Math.floor(Math.random() * 10000) + "");
    const userName = stateUserName || ("userName" + userID);
    
    const appID = 1888548866;
    const serverSecret = "78db5cc0bc70a631137cf34c97fb9322";

    // Load ZegoUIKitPrebuilt script if not already loaded
    const loadZegoScript = () => {
      return new Promise((resolve, reject) => {
        if (window.ZegoUIKitPrebuilt) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@zegocloud/zego-uikit-prebuilt/zego-uikit-prebuilt.js';
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const initializeVideoCall = async () => {
      try {
        await loadZegoScript();

        // Generate Kit Token
        const kitToken = window.ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          roomID,
          userID,
          userName
        );

        // Create ZegoUIKitPrebuilt instance
        const zp = window.ZegoUIKitPrebuilt.create(kitToken);
        zpRef.current = zp;

        // Join room
        zp.joinRoom({
          container: containerRef.current,
          sharedLinks: [{
            name: 'Personal link',
            url: window.location.protocol + '//' + 
                 window.location.host + 
                 window.location.pathname + 
                 '?roomID=' + roomID,
          }],
          scenario: {
            mode: window.ZegoUIKitPrebuilt.VideoConference,
          },
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: true,
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: true,
          showScreenSharingButton: true,
          showTextChat: true,
          showUserList: true,
          maxUsers: 2,
          layout: "Auto",
          showLayoutButton: false,
          showPrejoinView: false,
        });
      } catch (error) {
        console.error("Failed to initialize video call:", error);
      }
    };

    initializeVideoCall();

    // Cleanup function
    return () => {
      if (zpRef.current) {
        try {
          zpRef.current.destroy();
        } catch (error) {
          console.error("Error during cleanup:", error);
        }
      }
    };
  }, [urlRoomID, stateUserID, stateUserName]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100vw', 
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0
      }}
    />
  );
};

export default VideoCall;