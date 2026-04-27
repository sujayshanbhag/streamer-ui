import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import { useState, useRef, useEffect } from "react";
import {
  MediaPlayer,
  MediaProvider,
  PlayButton,
  SeekButton,
  Gesture,
  useMediaState,
  useMediaRemote,
  Menu,
  isHLSProvider,
} from "@vidstack/react";
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";
import {
  TbPlayerPlayFilled,
  TbPlayerPauseFilled,
  TbRewindBackward10,
  TbRewindForward10,
  TbCheck,
} from "react-icons/tb";

interface HLSPlayerProps {
  src: string;
  currentQualityLabel: string;
  availableQualities: string[];
  onQualityChange: (label: string) => void;
  error?: string;
}

export const HLSPlayer = ({
  src,
  currentQualityLabel,
  availableQualities,
  onQualityChange,
  error: externalError,
}: HLSPlayerProps) => {
  const [mediaError, setMediaError] = useState(false);

  const errorOverlay = externalError || mediaError;

  if (errorOverlay) {
    return (
      <div className="w-full rounded-xl overflow-hidden bg-black aspect-video shadow-2xl flex flex-col items-center justify-center gap-3 text-center px-6">
        <svg
          viewBox="0 0 24 24"
          className="w-12 h-12 text-neutral-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-neutral-300 font-semibold text-lg">
          Failed to load video
        </p>
        <p className="text-sm text-neutral-500">
          The video could not be played.
        </p>
      </div>
    );
  }
  return (
    <div className="w-full rounded-xl overflow-hidden bg-black aspect-video shadow-2xl relative">
      <MediaPlayer
        src={src}
        autoPlay
        playsInline
        className="w-full h-full"
        onError={() => setMediaError(true)}
        onProviderChange={(provider) => {
          if (isHLSProvider(provider)) {
            provider.config = {
              xhrSetup: (xhr: XMLHttpRequest) => {
                xhr.withCredentials = true;
              },
            };
          }
        }}
      >
        <MediaProvider />
        <CenterControls />
        <DefaultVideoLayout
          icons={defaultLayoutIcons}
          seekStep={10}
          noGestures={true}
          smallLayoutWhen={false}
          slots={{
            settingsMenu: null,
            beforeCaptionButton: (
              <CustomQualityMenu
                current={currentQualityLabel}
                options={availableQualities}
                onSelect={onQualityChange}
              />
            ),
            captionButton: (
              <Menu.Root>
                <Menu.Button className="group inline-flex items-center justify-center h-10 w-10 text-white hover:bg-white/20 rounded-md transition-colors outline-none">
                  <svg
                    version="1.1"
                    id="Layer_1"
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    viewBox="0 0 122.88 114.83"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <g>
                      <path d="M25.5,57.01c0-2.51,0.42-4.97,1.26-7.4c0.84-2.43,2.07-4.61,3.68-6.54c1.61-1.93,3.57-3.49,5.87-4.68 c2.3-1.2,4.92-1.79,7.87-1.79c3.53,0,6.59,0.82,9.18,2.46c2.59,1.64,4.52,3.81,5.79,6.51l-7.67,6.13c-0.34-1-0.8-1.83-1.36-2.49 c-0.57-0.66-1.19-1.18-1.88-1.56c-0.69-0.39-1.4-0.66-2.14-0.81c-0.74-0.15-1.45-0.23-2.14-0.23c-1.44,0-2.68,0.32-3.73,0.95 c-1.05,0.64-1.9,1.46-2.57,2.49c-0.67,1.02-1.17,2.18-1.49,3.47c-0.33,1.29-0.49,2.57-0.49,3.85c0,1.43,0.19,2.8,0.57,4.11 c0.38,1.31,0.93,2.47,1.65,3.47c0.72,1,1.6,1.8,2.65,2.4c1.05,0.6,2.22,0.9,3.52,0.9c0.69,0,1.39-0.09,2.11-0.26 c0.72-0.17,1.42-0.46,2.08-0.87s1.27-0.93,1.8-1.56c0.53-0.64,0.95-1.42,1.26-2.34l8.18,5.49c-0.55,1.5-1.38,2.85-2.5,4.05 c-1.11,1.2-2.38,2.2-3.81,3.01c-1.42,0.81-2.95,1.43-4.58,1.85c-1.63,0.42-3.22,0.64-4.76,0.64c-2.71,0-5.19-0.61-7.43-1.82 c-2.25-1.21-4.18-2.82-5.81-4.83c-1.63-2-2.89-4.28-3.78-6.82C25.94,62.21,25.5,59.63,25.5,57.01L25.5,57.01L25.5,57.01z M15.77,0 h91.34c4.34,0,8.28,1.77,11.14,4.63s4.63,6.8,4.63,11.14v83.29c0,4.34-1.77,8.28-4.63,11.14c-2.86,2.86-6.8,4.63-11.14,4.63H15.77 c-4.34,0-8.28-1.77-11.14-4.63C1.77,107.34,0,103.4,0,99.06V15.77c0-4.34,1.77-8.29,4.63-11.14C7.48,1.77,11.43,0,15.77,0L15.77,0z M107.11,9.91H15.77c-1.61,0-3.07,0.66-4.13,1.72c-1.06,1.06-1.72,2.53-1.72,4.13v83.29c0,1.61,0.66,3.07,1.72,4.13 c1.06,1.06,2.53,1.72,4.13,1.72h91.34c1.61,0,3.07-0.66,4.13-1.72c1.06-1.06,1.72-2.53,1.72-4.13V15.77c0-1.61-0.66-3.07-1.72-4.13 C110.18,10.57,108.72,9.91,107.11,9.91L107.11,9.91z M63.38,57.01c0-2.51,0.42-4.97,1.26-7.4c0.84-2.43,2.07-4.61,3.68-6.54 c1.61-1.93,3.57-3.49,5.87-4.68c2.3-1.2,4.92-1.79,7.87-1.79c3.53,0,6.59,0.82,9.18,2.46c2.59,1.64,4.52,3.81,5.79,6.51l-7.67,6.13 c-0.34-1-0.8-1.83-1.36-2.49c-0.57-0.66-1.19-1.18-1.88-1.56c-0.69-0.39-1.4-0.66-2.14-0.81c-0.74-0.15-1.45-0.23-2.14-0.23 c-1.44,0-2.68,0.32-3.73,0.95c-1.05,0.64-1.9,1.46-2.57,2.49s-1.17,2.18-1.49,3.47c-0.33,1.29-0.49,2.57-0.49,3.85 c0,1.43,0.19,2.8,0.57,4.11c0.38,1.31,0.93,2.47,1.65,3.47c0.72,1,1.6,1.8,2.65,2.4c1.05,0.6,2.22,0.9,3.52,0.9 c0.69,0,1.39-0.09,2.11-0.26c0.72-0.17,1.41-0.46,2.08-0.87c0.67-0.4,1.27-0.93,1.8-1.56c0.53-0.64,0.95-1.42,1.26-2.34l8.18,5.49 c-0.55,1.5-1.38,2.85-2.5,4.05c-1.11,1.2-2.38,2.2-3.81,3.01c-1.42,0.81-2.95,1.43-4.58,1.85c-1.63,0.42-3.22,0.64-4.76,0.64 c-2.71,0-5.19-0.61-7.43-1.82c-2.25-1.21-4.18-2.82-5.81-4.83c-1.63-2-2.89-4.28-3.78-6.82C63.82,62.21,63.37,59.63,63.38,57.01 L63.38,57.01L63.38,57.01z" />
                    </g>
                  </svg>
                </Menu.Button>
                <Menu.Content
                  className="z-[100] bg-[#1a1a1a] border border-white/10 p-2 rounded-lg min-w-[120px] shadow-2xl animate-in fade-in slide-in-from-bottom-2"
                  placement="top end"
                >
                  <div className="py-1 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                    Captions
                  </div>
                  <div className="text-sm  text-white/40 italic">
                    Coming Soon
                  </div>
                </Menu.Content>
              </Menu.Root>
            ),
          }}
        />
      </MediaPlayer>
    </div>
  );
};

const CustomQualityMenu = ({ current, options, onSelect }: any) => (
  <Menu.Root>
    <Menu.Button className="group inline-flex items-center justify-center h-10 px-0 text-white hover:bg-white/20 rounded-md transition-colors text-xs sm:text-sm font-medium gap-1 outline-none">
      <span className="uppercase">{current}</span>
    </Menu.Button>
    <Menu.Content
      className="z-[100] bg-[#1a1a1a] border border-white/10 p-2 rounded-lg min-w-[120px] shadow-2xl animate-in fade-in slide-in-from-bottom-2"
      placement="top end"
    >
      <div className="flex flex-col gap-1">
        <div className="px-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
          Resolution
        </div>
        {options.map((label: string) => {
          const isSelected = current === label;
          return (
            <button
              key={label}
              onClick={() => onSelect(label)}
              className={`flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/10 text-sm transition-all text-left outline-none ${
                isSelected
                  ? "text-white font-bold"
                  : "text-white/70 font-medium"
              }`}
            >
              {/* The Tick (Checkmark) Container */}
              <div className="w-4 h-4 flex items-center justify-center">
                {isSelected && <TbCheck size={16} className="text-white" />}
              </div>
              {label}
            </button>
          );
        })}
      </div>
    </Menu.Content>
  </Menu.Root>
);

const CenterControls = () => {
  const isPaused = useMediaState("paused");
  const isVisible = useMediaState("controlsVisible");
  const remote = useMediaRemote();
  const isVisibleRef = useRef(isVisible);
  const wasVisibleOnTouchRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep isVisibleRef in sync with current controls visibility
  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  // Use native capture-phase touchstart so we record visibility BEFORE
  // vidstack's own listener fires and shows the controls.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onTouchStart = () => {
      wasVisibleOnTouchRef.current = isVisibleRef.current;
    };
    el.addEventListener("touchstart", onTouchStart, {
      capture: true,
      passive: true,
    });
    return () =>
      el.removeEventListener("touchstart", onTouchStart, { capture: true });
  }, []);

  return (
    <>
      <Gesture
        className="absolute inset-y-0 left-0 z-10 block w-[40%]"
        event="dblpointerup"
        action="seek:-10"
      />
      <Gesture
        className="absolute inset-y-0 right-0 z-10 block w-[40%]"
        event="dblpointerup"
        action="seek:10"
      />
      {/*
        Custom tap handler replaces the Gesture toggle:paused.
        On touch: if the controls were hidden when the tap started, we let
        vidstack show them (first tap = reveal only, no action).
        On subsequent taps (controls already visible) we toggle play/pause.
        On desktop pointer the behaviour is unchanged.
      */}
      <div
        ref={containerRef}
        className="absolute inset-0 z-0 block h-full w-full"
        onPointerUp={(e) => {
          if (e.pointerType === "touch" && !wasVisibleOnTouchRef.current) {
            // First tap on mobile: controls were hidden, just let them appear
            return;
          }
          remote.togglePaused(e.nativeEvent);
        }}
      />
      <div
        className={`absolute inset-0 z-20 flex items-center justify-center gap-8 sm:gap-12 pointer-events-none transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <SeekButton
          seconds={-10}
          className={`transition-transform active:scale-90 text-white ${
            isVisible ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <TbRewindBackward10 className="drop-shadow-lg w-9 h-9 sm:w-12 sm:h-12" />
        </SeekButton>
        <PlayButton
          className={`transition-transform active:scale-95 hover:scale-110 text-white ${
            isVisible ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          {isPaused ? (
            <TbPlayerPlayFilled className="w-14 h-14 sm:w-18 sm:h-18" />
          ) : (
            <TbPlayerPauseFilled className="w-14 h-14 sm:w-18 sm:h-18" />
          )}
        </PlayButton>
        <SeekButton
          seconds={10}
          className={`transition-transform active:scale-90 text-white ${
            isVisible ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <TbRewindForward10 className="drop-shadow-lg w-9 h-9 sm:w-12 sm:h-12" />
        </SeekButton>
      </div>
    </>
  );
};
