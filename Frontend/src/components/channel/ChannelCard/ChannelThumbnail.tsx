import Badge from '@components/common/Badges/Badge';
import { formatNumber } from '@utils/format';
import ChannelThumbnailPlaceholder from './ChannelThumbnailPlaceholder';

interface ChannelThumbnailProps {
  title: string;
  thumbnailUrl: string;
  viewers: number;
}

function ChannelThumbnail({ title, thumbnailUrl, viewers }: ChannelThumbnailProps) {
  return (
    <div className="relative aspect-video cursor-pointer overflow-hidden rounded-xl">
      <ChannelThumbnailPlaceholder />
      <img src={thumbnailUrl} alt={title} className="absolute h-full w-full object-cover hover:brightness-50" />
      <div className="flex gap-2">
        <Badge text="LIVE" className="absolute left-2 top-2 bg-red-600 text-lico-gray-1" />
        <Badge
          text={`${formatNumber(viewers)}명`}
          className="absolute bottom-2 left-2 bg-lico-orange-2 text-lico-gray-1"
        />
      </div>
    </div>
  );
}

export default ChannelThumbnail;
