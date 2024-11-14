import { Link } from 'react-router-dom';
import ChannelThumbnail from '@components/channel/ChannelCard/ChannelThumbnail';
import ChannelInfo from './ChannelInfo';

export interface ChannelCardProps {
  id: string;
  title: string;
  streamerName: string;
  profileImgUrl: string;
  viewers: number;
  category: string;
  categoryId: number;
  thumbnailUrl: string;
}

export default function ChannelCard({
  id,
  title,
  streamerName,
  viewers,
  category,
  categoryId,
  profileImgUrl,
  thumbnailUrl,
}: ChannelCardProps) {
  return (
    <Link to={`/live/${id}`} className="mb-4 block min-w-60" aria-label={`${streamerName}의 ${title} 스트림으로 이동`}>
      <ChannelThumbnail title={title} thumbnailUrl={thumbnailUrl} viewers={viewers} />
      <ChannelInfo
        title={title}
        streamerName={streamerName}
        category={category}
        categoryId={categoryId.toString()}
        profileImgUrl={profileImgUrl}
      />
    </Link>
  );
}
