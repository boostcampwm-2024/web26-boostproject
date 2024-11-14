import { RiGhostLine, RiHome4Line } from 'react-icons/ri';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="flex h-full w-full items-center justify-center p-4">
      <div className="text-center">
        <RiGhostLine className="mx-auto mb-6 h-24 w-24 text-lico-orange-2" />
        <h1 className="mb-4 font-bold text-4xl text-lico-gray-2">채널을 찾을 수 없습니다</h1>
        <p className="mb-8 font-bold text-xl text-lico-gray-3">
          채널을 찾을 수 없습니다. 이미 사라졌거나 다른 우주로 갔나 봐요!
        </p>
        <div className="flex justify-center font-medium text-sm text-lico-gray-1">
          <Link to="/" className="flex items-center gap-1 rounded-md bg-lico-orange-2 px-3 py-2 hover:bg-lico-orange-1">
            <RiHome4Line size={18} className="mt-0.5" />
            홈페이지로 이동
          </Link>
        </div>
      </div>
    </main>
  );
}
