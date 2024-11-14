import offline from '@assets/images/offline.gif';

export default function OfflinePlayer() {
  return (
    <div className="flex h-full w-full justify-center border-b border-lico-gray-3 bg-black">
      <img src={offline} alt={offline} className="object-cover" />
    </div>
  );
}
