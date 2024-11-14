import { LuUser } from 'react-icons/lu';
import CategoryBadge from '@components/common/Badges/CategoryBadge';
import FollowButton from '@components/common/Buttons/FollowButton';
import { useState } from 'react';

import { formatNumber } from '@utils/format';
import StreamingTimer from '@components/LiveInfo/StreamingTimer';

interface LiveInfoProps {
  channelId: string;
  title: string;
  profileImgUrl: string;
  streamerName: string;
  viewers: number;
  createdAt: string;
  categoryId: number;
  categoryName: string;
}

export default function LiveInfo({
  channelId,
  title,
  profileImgUrl,
  streamerName,
  viewers,
  createdAt,
  categoryId,
  categoryName,
}: LiveInfoProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="w-full bg-lico-gray-4 p-3">
      <div className="m-1.5 font-medium text-xl text-lico-gray-1">{title}</div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white">
            {!imageError ? (
              <img
                src={profileImgUrl}
                alt={streamerName}
                className="h-12 w-12 rounded-full"
                onError={() => setImageError(true)}
              />
            ) : (
              <LuUser size={24} className="text-lico-gray-2" />
            )}
          </div>
          <div>
            <div className="font-bold text-base text-lico-orange-2">{streamerName}</div>
            <div className="font-medium text-sm text-lico-gray-2">{formatNumber(viewers)}명 시청중</div>
            <StreamingTimer startAt={createdAt} />
          </div>
        </div>
        <FollowButton channelId={channelId} />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <CategoryBadge category={categoryName} categoryId={categoryId} className="text-sm text-lico-gray-1" />
      </div>
    </div>
  );
}
