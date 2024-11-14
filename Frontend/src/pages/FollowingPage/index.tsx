import useFollowStore from '@store/useFollowStore.ts';
import mockChannels from '@mocks/mockChannels';
import mockUsers from '@mocks/mockUsers';
import ChannelGrid from '@components/channel/ChannelGrid';
import type { ChannelCardProps } from '@components/channel/ChannelCard';

export default function FollowingPage() {
  const { followingChannels } = useFollowStore();

  const followedChannels = followingChannels
    .map(channelId => {
      const channel = mockChannels.find(c => c.id === channelId);
      const user = mockUsers[channelId];

      if (!channel || !user) return null;

      const channelData: ChannelCardProps = {
        id: channel.id,
        title: channel.title,
        streamerName: user.channelName,
        viewers: channel.viewers,
        category: channel.category,
        categoryId: channel.categoryId,
        profileImgUrl: channel.profileImgUrl,
        thumbnailUrl: channel.thumbnailUrl,
      };

      return channelData;
    })
    .filter((channel): channel is ChannelCardProps => channel !== null);

  if (followedChannels.length === 0) {
    return (
      <div className="p-12">
        <div className="mb-3 px-4 font-bold text-2xl text-lico-gray-1">팔로잉</div>
        <div className="flex min-h-[300px] items-center justify-center font-medium text-lico-gray-2">
          아직 팔로우한 채널이 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className="p-12">
      <div className="mb-3 px-4 font-bold text-2xl text-lico-gray-1">팔로잉</div>
      <ChannelGrid channels={followedChannels} />
    </div>
  );
}
