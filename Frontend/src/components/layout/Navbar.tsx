import { NavLink } from 'react-router-dom';
import { LuMonitor, LuLayoutGrid, LuHeart, LuVideo, LuMenu, LuLogIn, LuLogOut } from 'react-icons/lu';
import useLayoutStore from '@store/useLayoutStore';
import { useAuthStore } from '@store/useAuthStore';
import { useAuth } from '@hooks/useAuth';

interface NavLinkProps {
  isActive: boolean;
}

export default function Navbar(): JSX.Element {
  const { toggleNavbar } = useLayoutStore();
  const user = useAuthStore(state => state.user);
  const { logout } = useAuth();

  const linkClass = ({ isActive }: NavLinkProps): string =>
    `flex items-center rounded-lg px-4 py-3 transition-colors hover:bg-lico-gray-3 text-lico-gray-1 hover:text-lico-orange-2 ${
      isActive ? 'text-lico-orange-2' : ''
    }`;

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  return (
    <nav className="fixed left-0 top-0 z-10 h-screen w-60 border-r border-lico-gray-3 bg-lico-gray-4">
      <div className="flex h-full flex-col px-3 py-5">
        <div className="mb-4 flex">
          <button
            type="button"
            onClick={toggleNavbar}
            className="justify-centerfont-bold flex items-center px-4 pb-4 text-3xl text-lico-orange-2"
          >
            <LuMenu size={36} />
          </button>
          <NavLink to="/" className="font-bold text-3xl text-lico-orange-2">
            LICO
          </NavLink>
        </div>
        <div className="flex flex-col">
          <NavLink to="/lives" className={linkClass}>
            <div className="flex items-center">
              <LuMonitor className="h-5 w-5" />
              <span className="ml-4 font-bold text-base">전체 방송</span>
            </div>
          </NavLink>
          <NavLink to="/category" className={linkClass}>
            <div className="flex items-center">
              <LuLayoutGrid className="h-5 w-5" />
              <span className="ml-4 font-bold text-base">카테고리</span>
            </div>
          </NavLink>
          <NavLink to="/following" className={linkClass}>
            <div className="flex items-center">
              <LuHeart className="h-5 w-5" />
              <span className="ml-4 font-bold text-base">팔로잉</span>
            </div>
          </NavLink>

          <div className="my-2 h-px bg-lico-gray-3" />

          <NavLink to={`/studio/${user?.channelId}`} target="_blank" rel="noopener noreferrer" className={linkClass}>
            <div className="flex items-center">
              <LuVideo className="h-5 w-5" />
              <span className="ml-4 font-bold text-base">스튜디오</span>
            </div>
          </NavLink>
        </div>

        <div className="flex-grow" />

        {user ? (
          <button
            onClick={handleLogout}
            className="flex w-full items-center rounded-lg px-4 py-3 text-lico-gray-1 transition-colors hover:bg-lico-gray-3 hover:text-lico-orange-2"
          >
            <div className="flex items-center">
              <LuLogOut className="h-5 w-5" />
              <span className="ml-4 font-bold text-base">로그아웃</span>
            </div>
          </button>
        ) : (
          <NavLink to="/login" className={linkClass}>
            <div className="flex items-center">
              <LuLogIn className="h-5 w-5" />
              <span className="ml-4 font-bold text-base">로그인</span>
            </div>
          </NavLink>
        )}
      </div>
    </nav>
  );
}
