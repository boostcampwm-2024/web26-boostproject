import { NavLink } from 'react-router-dom';
import { LuMonitor, LuLayoutGrid, LuHeart, LuVideo, LuMenu, LuLogIn, LuLogOut } from 'react-icons/lu';
import useLayoutStore from '@store/useLayoutStore';
import { useAuthStore } from '@store/useAuthStore';
import { useAuth } from '@hooks/useAuth';

interface NavLinkProps {
  isActive: boolean;
}

export default function NavbarMini(): JSX.Element {
  const { toggleNavbar } = useLayoutStore();
  const user = useAuthStore(state => state.user);
  const { logout } = useAuth();

  const linkClass = ({ isActive }: NavLinkProps): string =>
    `flex justify-center items-center rounded-lg px-4 py-3 transition-colors text-lico-gray-1 hover:bg-lico-gray-3 hover:text-lico-orange-2 ${
      isActive ? 'text-lico-orange-2' : ''
    }`;

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  return (
    <nav className="fixed left-0 top-0 z-10 h-screen border-r border-lico-gray-3 bg-lico-gray-4">
      <div className="flex h-full flex-col px-3 py-5">
        <button
          type="button"
          onClick={toggleNavbar}
          className="justify-centerfont-bold flex items-center px-2 pb-4 text-3xl text-lico-orange-2"
        >
          <LuMenu size={36} />
        </button>
        <div className="flex flex-col">
          <NavLink to="/lives" className={linkClass}>
            <div className="flex items-center">
              <LuMonitor className="h-5 w-5" />
            </div>
          </NavLink>
          <NavLink to="/category" className={linkClass}>
            <div className="flex items-center">
              <LuLayoutGrid className="h-5 w-5" />
            </div>
          </NavLink>
          <NavLink to="/following" className={linkClass}>
            <div className="flex items-center">
              <LuHeart className="h-5 w-5" />
            </div>
          </NavLink>

          <div className="my-2 h-px bg-lico-gray-3" />

          <NavLink to={`/studio/${user?.channelId}`} target="_blank" rel="noopener noreferrer" className={linkClass}>
            <div className="flex items-center">
              <LuVideo className="h-5 w-5" />
            </div>
          </NavLink>
        </div>

        <div className="flex-grow" />

        {user ? (
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center rounded-lg px-4 py-3 text-lico-gray-1 transition-colors hover:bg-lico-gray-3 hover:text-lico-orange-2"
          >
            <LuLogOut className="h-5 w-5" />
          </button>
        ) : (
          <NavLink to="/login" className={linkClass}>
            <div className="flex items-center">
              <LuLogIn className="h-5 w-5" />
            </div>
          </NavLink>
        )}
      </div>
    </nav>
  );
}
