import { useState } from 'react';
import { useParams } from 'react-router-dom';
import useLayoutStore from '@store/useLayoutStore';
// import { useAuth } from '@hooks/useAuth';
import VideoPlayer from '@components/VideoPlayer';
import StreamSettings from '@pages/StudioPage/StreamSettings';
import WebStreamControls from '@pages/StudioPage/WebStreamControls';
import StreamInfo from '@pages/StudioPage/StreamInfo';
import ChatWindow from '@components/chat/ChatWindow';
import ChatOpenButton from '@components/common/Buttons/ChatOpenButton';

type StreamType = 'OBS' | 'WebOBS';

export default function StudioPage() {
  const { channelId } = useParams<{ channelId: string }>();
  // const { refreshToken } = useAuth();
  const [streamType, setStreamType] = useState<StreamType>('OBS');
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [screenEnabled, setScreenEnabled] = useState(false);
  const [imageEnabled, setImageEnabled] = useState(false);
  const [textEnabled, setTextEnabled] = useState(false);
  const [drawEnabled, setDrawEnabled] = useState(false);
  const [arEnabled, setArEnabled] = useState(false);

  const { chatState, toggleChat } = useLayoutStore();

  // useEffect(() => {
  //   refreshToken();
  // }, [refreshToken]);

  if (!channelId) {
    return (
      <>
        <div className="flex h-screen items-center justify-center">
          <div className="font-bold text-lg text-lico-gray-1">올바른 주소를 입력해주세요</div>
        </div>
      </>
    );
  }

  return (
    <div className="flex h-screen">
      <main className="min-w-96 flex-1 overflow-y-auto p-6 scrollbar-hide" role="main">
        <h1 className="mb-4 font-bold text-2xl text-lico-gray-1">스튜디오</h1>
        <div className="mt-4 h-3/5">
          <VideoPlayer streamUrl={`/stream/${channelId}`} onAir />
        </div>

        <div className="mt-4">
          <div className="flex justify-end">
            <div className="inline-flex rounded-lg bg-lico-gray-4 p-1" role="tablist">
              <button
                type="button"
                onClick={() => setStreamType('OBS')}
                className={`rounded px-3 py-1.5 font-medium text-sm transition-colors ${
                  streamType === 'OBS'
                    ? 'bg-lico-orange-2 text-lico-gray-5'
                    : 'text-lico-gray-1 hover:text-lico-orange-2'
                }`}
                role="tab"
                aria-selected={streamType === 'OBS'}
                aria-controls="obs-panel"
              >
                OBS
              </button>
              <button
                type="button"
                onClick={() => setStreamType('WebOBS')}
                className={`rounded px-3 py-1.5 font-medium text-sm transition-colors ${
                  streamType === 'WebOBS'
                    ? 'bg-lico-orange-2 text-lico-gray-5'
                    : 'text-lico-gray-1 hover:text-lico-orange-2'
                }`}
                role="tab"
                aria-selected={streamType === 'WebOBS'}
                aria-controls="webobs-panel"
              >
                WebOBS
              </button>
            </div>
          </div>

          {streamType === 'OBS' ? (
            <div id="obs-panel" role="tabpanel">
              <StreamSettings showStreamKey={showStreamKey} setShowStreamKey={setShowStreamKey} />
            </div>
          ) : (
            <div id="webobs-panel" role="tabpanel">
              <WebStreamControls
                screenEnabled={screenEnabled}
                setScreenEnabled={setScreenEnabled}
                webcamEnabled={webcamEnabled}
                setWebcamEnabled={setWebcamEnabled}
                imageEnabled={imageEnabled}
                setImageEnabled={setImageEnabled}
                textEnabled={textEnabled}
                setTextEnabled={setTextEnabled}
                drawEnabled={drawEnabled}
                setDrawEnabled={setDrawEnabled}
                arEnabled={arEnabled}
                setArEnabled={setArEnabled}
              />
            </div>
          )}
        </div>
      </main>

      <aside className="min-w-96 overflow-y-auto bg-lico-gray-4 p-6 scrollbar-hide" aria-label="방송 정보">
        <StreamInfo channelId={channelId} />
      </aside>

      {chatState === 'expanded' && (
        <aside className="min-w-96 overflow-hidden border-x border-lico-gray-3 bg-lico-gray-4" aria-label="채팅">
          <ChatWindow />
        </aside>
      )}
      {chatState === 'hidden' && <ChatOpenButton className="text-lico-gray-2" onClick={toggleChat} />}
    </div>
  );
}
