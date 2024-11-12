//@ts-nocheck

"use client";

import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import { QRCodeSVG } from "qrcode.react";
import { ControlView } from "./control-view";
import { RoomShader } from "./room-shader";

export default function WebRTCExample() {
  const [peerId, setPeerId] = useState<string>("");
  const [remotePeerId, setRemotePeerId] = useState<string>("");

  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const peerInstance = useRef<Peer | null>(null);
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const mobileRegex =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      setIsMobile(mobileRegex.test(userAgent));
    };

    checkDevice();
  }, []);

  useEffect(() => {
    const peer = new Peer();

    peer.on("open", (id) => {
      setPeerId(id);
      console.log("My peer ID is:", id);
    });

    peer.on("connection", (conn) => {
      conn.on("data", (data) => setData(data));
    });

    peerInstance.current = peer;

    return () => peer.destroy();
  }, []);

  const connectToPeer = () => {
    if (!peerInstance.current) return;

    peerInstance.current.connect(remotePeerId);
  };

  const updateControl = (data: any) => {
    const connections = peerInstance.current.connections[remotePeerId];
    if (connections && connections[0]) {
      connections[0].send(data);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(peerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getQRUrl = () => {
    //const baseUrl = "https://react-ba-2024.vercel.app/webrtc"; //https://react-ba-2024.vercel.app/webrtc
    //return `${baseUrl}?connect=${peerId}`;

    return peerId;
  };

  useEffect(() => {
    if (isMobile) {
      const params = new URLSearchParams(window.location.search);
      const connectId = params.get("connect");
      if (connectId) {
        setRemotePeerId(connectId);
        setTimeout(() => connectToPeer(), 1000);
      }
    }
  }, [isMobile, peerInstance]);

  if (isMobile === undefined) return null;

  return (
    <div className="min-h-screen bg-black p-4">
      {!isMobile && <RoomShader controls={data} />}

      {!isMobile && (
        <div className="absolute bottom-0 left-24 right-24 mx-auto">
          <div className="mb-6 border-2 border-green-500 bg-black p-4 font-mono text-green-500 shadow-[0_0_10px_rgba(0,255,0,0.3)]">
            <p className="text-sm opacity-70">&gt; SYSTEM_ID:</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="flex-1 border border-green-500 bg-black/50 p-2 font-mono">
                {peerId || "GENERATING_ID..."}
              </p>
              <button
                onClick={copyToClipboard}
                className={`border-2 border-green-500 px-4 py-2 transition-all
                      ${
                        copied
                          ? "bg-green-500 text-black"
                          : "hover:bg-green-500/20"
                      }`}
              >
                [{copied ? "COPIED" : "COPY_ID"}]
              </button>

              <button
                onClick={() => setShowQR((prev) => !prev)}
                className="border-2 border-green-500 px-4 py-2 transition-all hover:bg-green-500/20"
              >
                [QR]
              </button>
            </div>

            {showQR && peerId && (
              <div className="absolute bottom-full left-1/2 mb-4 -translate-x-1/2 transform">
                <div className="rounded border-2 border-green-500 bg-white p-4">
                  <QRCodeSVG
                    value={getQRUrl()}
                    size={200}
                    level="H"
                    fgColor="#22c55e"
                    bgColor="#ffffff"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isMobile && (
        <div className="relative mx-auto">
          <div className="mb-6 border-2 border-green-500 p-4 font-mono text-green-500 shadow-[0_0_10px_rgba(0,255,0,0.3)]">
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={remotePeerId}
                  onChange={(e) => setRemotePeerId(e.target.value)}
                  placeholder="ENTER_TARGET_ID"
                  className="flex-1 border-2 border-green-500 bg-black p-2 text-green-500 placeholder:text-green-500/50 focus:border-green-400 focus:outline-none"
                />
                <button
                  onClick={connectToPeer}
                  className="border-2 border-green-500 px-4 transition-colors"
                >
                  [CONNECT]
                </button>
              </div>
            </>
          </div>
        </div>
      )}

      {isMobile && <ControlView onControlsUpdate={updateControl} />}
    </div>
  );
}
