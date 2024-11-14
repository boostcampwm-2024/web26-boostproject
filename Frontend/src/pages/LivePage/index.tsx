import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { config } from '@config/env';
import { useLiveDetail } from '@hooks/useLive';
import useMediaQuery from '@hooks/useMediaQuery';
import useLayoutStore from '@store/useLayoutStore';
import ChatWindow from '@components/chat/ChatWindow';
import ChatOpenButton from '@components/common/Buttons/ChatOpenButton';
import NotFound from '@components/error/NotFound';
import LoadingSpinner from '@components/common/LoadingSpinner';
import VideoPlayer from '@components/VideoPlayer';
import StreamerInfo from '@components/LiveInfo/StreamerInfo';
import LiveInfo from '@components/LiveInfo';

export default function LivePage() {
  const { id } = useParams<{ id: string }>();
  const { chatState, videoPlayerState, toggleChat, handleBreakpoint } = useLayoutStore();
  const { data: liveDetail, isLoading, error } = useLiveDetail(id!);

  const isLarge = useMediaQuery('(min-width: 1200px)');
  const isMedium = useMediaQuery('(min-width: 700px)');
  const STREAM_URL = `${config.storageUrl}/${id}/index.m3u8`;

  useEffect(() => {
    if (isLarge) {
      handleBreakpoint('FULL');
    } else if (isMedium) {
      handleBreakpoint('NAV_COLLAPSED');
    } else {
      handleBreakpoint('CHAT_HIDDEN');
    }
  }, [isLarge, isMedium, handleBreakpoint]);

  if (isLoading)
    return (
      <div className="relative h-full w-full">
        <LoadingSpinner />
      </div>
    );
  if (error?.status === 404 || !liveDetail || !id) return <NotFound />;
  if (error) return <div>에러가 발생했습니다.</div>;

  const {
    categoriesId: categoryId,
    categoriesName: categoryName,
    livesDescription: liveDescription,
    livesName: liveName,
    onAir,
    startedAt,
    usersNickname: userNickName,
    usersProfileImage: userProfileImage,
  } = liveDetail;

  const isChatToggleVisible = isMedium && chatState === 'hidden';
  const isTheaterMode = videoPlayerState === 'theater';
  const isVerticalMode = !isMedium;

  return (
    <div className={`flex h-screen ${isTheaterMode && isVerticalMode ? 'flex-col' : ''}`}>
      <div className="relative flex-1">
        <div className="flex h-full flex-col overflow-y-auto scrollbar-hide">
          <VideoPlayer streamUrl={STREAM_URL} onAir={onAir} />
          {!isTheaterMode && (
            <>
              <LiveInfo
                streamerName={userNickName}
                categoryId={categoryId}
                categoryName={categoryName}
                profileImgUrl={userProfileImage}
                viewers={0}
                title={liveName}
                createdAt={startedAt}
                channelId={id}
              />
              <StreamerInfo streamerName={userNickName} channelDescription={liveDescription} followers={0} />
            </>
          )}
        </div>
      </div>

      {chatState === 'expanded' && (
        <div className={`${isTheaterMode && isVerticalMode ? 'w-full overflow-hidden' : 'w-[360px]'}`}>
          <ChatWindow />
        </div>
      )}

      {((isTheaterMode && chatState === 'hidden') || (!isTheaterMode && isChatToggleVisible)) && (
        <ChatOpenButton onClick={toggleChat} />
      )}
    </div>
  );
}
