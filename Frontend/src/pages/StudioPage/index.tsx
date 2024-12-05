import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import VideoPlayer from '@components/VideoPlayer';
import StreamSettings from '@pages/StudioPage/StreamSettings';
import WebStreamControls from '@pages/StudioPage/WebStreamControls';
import StreamInfo from '@pages/StudioPage/StreamInfo';
import ChatWindow from '@components/chat/ChatWindow';
import ChatOpenButton from '@components/common/Buttons/ChatOpenButton';
import { useLiveDetail, useLiveStatus } from '@hooks/useLive.ts';
import LoadingSpinner from '@components/common/LoadingSpinner';
import NotFound from '@components/error/NotFound';
import { config } from '@config/env';
import { useStreamingKey, useFinishLive } from '@hooks/useLive';
import StreamContainer from '@pages/StudioPage/StreamContainer';
import { useStudioStore } from '@store/useStudioStore';
import { LuInfo } from 'react-icons/lu';
import useMediaQuery from '@hooks/useMediaQuery';
import useCheckStream from '@hooks/useCheckStream';
import OfflinePlayer from '@components/VideoPlayer/OfflinePlayer';
import { useDelayedLoading } from '@hooks/useDelayedLoading.ts';
import StreamGuide from './Modals/StreamGuide';

type TabType = 'External' | 'WebStudio' | 'Info';
type VideoMode = 'player' | 'container';
const MEDIUM_BREAKPOINT = '(min-width: 800px)';

export default function StudioPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('External');
  const [videoMode, setVideoMode] = useState<VideoMode>('player');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState<boolean>(true);
  const [isChatLocked, setIsChatLocked] = useState<boolean>(false);
  const isMediumScreen = useMediaQuery(MEDIUM_BREAKPOINT);

  const screenStream = useStudioStore(state => state.screenStream);
  const mediaStream = useStudioStore(state => state.mediaStream);
  const setScreenStream = useStudioStore(state => state.setScreenStream);
  const setMediaStream = useStudioStore(state => state.setMediaStream);
  const setIsStreaming = useStudioStore(state => state.setIsStreaming);


  const { data: liveDetail, isLoading, error: detailError } = useLiveDetail(channelId!);
  const { data: liveStatus, error: statusError } = useLiveStatus(channelId!);
  const { data: streamKey } = useStreamingKey();
  const { mutateAsync: finishLive } = useFinishLive();

  if ((detailError && detailError.status === 404) || !liveDetail || !channelId) return <NotFound />;
  if (detailError || statusError) return <div>에러가 발생했습니다.</div>;

  const currentOnAir = liveStatus?.onAir ?? liveDetail.onAir;

  const STREAM_URL = `${config.storageUrl}/${channelId}/index.m3u8`;
  const WEBRTC_URL = config.webrtcUrl;

  const { isStreamReady, isChecking, checkStreamAvailability } = useCheckStream(STREAM_URL);
  const showLoading = useDelayedLoading(isLoading, { minLoadingTime: 300 });
  const showStreamCheckLoading = useDelayedLoading(isChecking, { minLoadingTime: 500 });

  const currentOnAir = liveStatus?.onAir || liveDetail?.onAir || false;

  const handleChatToggle = () => {
    isChatExpanded ? setIsChatLocked(true) : setIsChatLocked(false);
    setIsChatExpanded(!isChatExpanded);
  };

  const handleTabChange = async (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'External') {
      setVideoMode('player');
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      }
      setIsStreaming(false);
      await finishLive(streamKey?.toString() || '');
    } else if (tab === 'WebStudio') {
      setVideoMode('container');
    }
  };

  useEffect(() => {
    if (!isChatLocked) {
      setIsChatExpanded(isMediumScreen);
    }
  }, [isChatLocked, isMediumScreen]);

  useEffect(() => {
    checkStreamAvailability();
  }, [checkStreamAvailability]);

  const renderVideoContent = () => {
    function AspectRatioContainer({ children }: { children: React.ReactNode }) {
      return <div className="relative h-full w-full bg-black">{children}</div>;
    }

    if (videoMode === 'player') {
      return !currentOnAir ? (
        <OfflinePlayer />
      ) : isStreamReady ? (
        <VideoPlayer streamUrl={STREAM_URL} onAir={currentOnAir} />
      ) : showStreamCheckLoading ? (
        <div className="flex h-full w-full items-center justify-center bg-black text-center font-bold text-white">
          <p>
            방송 준비 중입니다. <br /> 잠시만 기다려주세요!
          </p>
        </div>
      ) : (
        <div className="flex h-full w-full" />
      );
    }

    return (
      <AspectRatioContainer>
        <StreamContainer streamKey={streamKey?.toString() || ''} webrtcUrl={WEBRTC_URL} />
      </AspectRatioContainer>
    );
  };

  if (showLoading)
    return (
      <div className="relative h-full w-full">
        <LoadingSpinner />
      </div>
    );
  if (!channelId || !liveDetail) return <NotFound />;

  return (
    <div className="flex h-screen min-w-[500px]">
      <main className="flex-1 overflow-y-auto p-6 scrollbar-hide" role="main">
        <h1 className="mb-4 font-bold text-2xl text-lico-gray-1">스튜디오</h1>
        <div className="space-y-4">
          {renderVideoContent()}

          <div className="mt-4">
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                className="inline-flex items-center hover:text-lico-orange-2"
              >
                <LuInfo className="h-5 w-5 text-lico-gray-1 hover:text-lico-orange-2" />
              </button>
              <div className="inline-flex rounded-lg bg-lico-gray-4 p-1" role="tablist">
                <button
                  type="button"
                  onClick={() => handleTabChange('External')}
                  className={`rounded px-3 py-1.5 font-medium text-sm transition-colors ${
                    activeTab === 'External'
                      ? 'bg-lico-orange-2 text-lico-gray-5'
                      : 'text-lico-gray-1 hover:text-lico-orange-2'
                  }`}
                  role="tab"
                  aria-selected={activeTab === 'External'}
                  aria-controls="External-panel"
                >
                  외부 스트림
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('WebStudio')}
                  className={`rounded px-3 py-1.5 font-medium text-sm transition-colors ${
                    activeTab === 'WebStudio'
                      ? 'bg-lico-orange-2 text-lico-gray-5'
                      : 'text-lico-gray-1 hover:text-lico-orange-2'
                  }`}
                  role="tab"
                  aria-selected={activeTab === 'WebStudio'}
                  aria-controls="WebStudio-panel"
                >
                  웹 스튜디오
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('Info')}
                  className={`rounded px-3 py-1.5 font-medium text-sm transition-colors ${
                    activeTab === 'Info'
                      ? 'bg-lico-orange-2 text-lico-gray-5'
                      : 'text-lico-gray-1 hover:text-lico-orange-2'
                  }`}
                  role="tab"
                  aria-selected={activeTab === 'Info'}
                  aria-controls="info-panel"
                >
                  방송 정보
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-lico-gray-4 p-6">
            {activeTab === 'External' && (
              <div id="External-panel" role="tabpanel">
                <StreamSettings streamKey={streamKey?.toString() || ''} />
              </div>
            )}
            {activeTab === 'WebStudio' && (
              <div id="WebStudio-panel" role="tabpanel">
                <WebStreamControls streamKey={streamKey?.toString() || ''} />
              </div>
            )}
            {activeTab === 'Info' && (
              <div id="info-panel" role="tabpanel">
                <StreamInfo channelId={channelId} />
              </div>
            )}
          </div>
        </div>
      </main>

      {isChatExpanded && isMediumScreen && (
        <aside className="min-w-[360px] overflow-hidden border-x border-lico-gray-3 bg-lico-gray-4" aria-label="채팅">
          <ChatWindow id={channelId} onAir={currentOnAir} onToggleChat={handleChatToggle} />
        </aside>
      )}
      {!isChatExpanded && isMediumScreen && <ChatOpenButton className="text-lico-gray-2" onClick={handleChatToggle} />}
      {isGuideOpen && <StreamGuide onClose={() => setIsGuideOpen(false)} />}
    </div>
  );
}
