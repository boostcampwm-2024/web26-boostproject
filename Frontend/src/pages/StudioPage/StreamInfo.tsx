import { useRef, useState, useEffect } from 'react';
import { LuX } from 'react-icons/lu';

import SearchInput from '@components/common/SearchInput';
import Dropdown from '@components/common/Dropdown';
import CategoryBadge from '@components/common/Badges/CategoryBadge';
import Toast from '@components/common/Toast';

import { useClickOutside } from '@hooks/useClickOutside';
import { useLiveDetail } from '@hooks/useLive';
import { useSearch } from '@hooks/useSearch';
import { useUpdateLive } from '@hooks/useLive';

import { useAuthStore } from '@store/useAuthStore';
import { CATEGORIES } from '@constants/categories';
import type { Category } from '@/types/category';

interface StreamInfoProps {
  channelId: string;
}

export default function StreamInfo({ channelId }: StreamInfoProps) {
  const { user } = useAuthStore();
  const { data: liveDetail, isLoading } = useLiveDetail(channelId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const updateLive = useUpdateLive();

  useEffect(() => {
    if (!user) return;

    const defaultTitle = `${user.nickname}의 라이브 방송`;
    const defaultDescription = `${user.nickname}의 라이브 방송입니다`;

    if (!isLoading && liveDetail) {
      setTitle(liveDetail.livesName || defaultTitle);
      setDescription(liveDetail.livesDescription || defaultDescription);

      if (liveDetail.categoriesId) {
        const category = CATEGORIES.find(cat => cat.id === liveDetail.categoriesId);
        setSelectedCategory(category || null);
      }
    } else {
      setTitle(defaultTitle);
      setDescription(defaultDescription);
    }
  }, [liveDetail, isLoading, user]);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
  };

  const {
    searchValue: categorySearch,
    setSearchValue: setCategorySearch,
    showDropdown,
    setShowDropdown,
    highlightedIndex,
    setHighlightedIndex,
    filteredItems,
    handleKeyDown,
    handleSelect,
  } = useSearch({
    items: CATEGORIES,
    searchKey: 'name',
    onSelect: handleCategorySelect,
  });

  useClickOutside(containerRef, () => setShowDropdown(false));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateLive.mutateAsync({
        channelId,
        updateData: {
          name: title,
          description,
          categoriesId: selectedCategory?.id,
        },
      });

      setToastMessage('방송 정보가 업데이트되었습니다.');
      setShowToast(true);
    } catch (error) {
      console.error('Update error:', error);
      setToastMessage('방송 정보 업데이트에 실패했습니다.');
      setShowToast(true);
    }
  };

  return (
    <>
      <form className="flex flex-col gap-6" aria-label="방송 정보 설정" onSubmit={handleSubmit} autoComplete="off">
        <div>
          <label htmlFor="title" className="mb-2 block font-bold text-lico-gray-1">
            방송 제목
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full rounded bg-lico-gray-5 p-2 font-medium text-lico-gray-1 outline-none focus:ring-2 focus:ring-lico-orange-2"
            aria-label="방송 제목"
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-2 block font-bold text-lico-gray-1">
            방송 설명
          </label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="h-24 w-full resize-none overflow-y-auto rounded bg-lico-gray-5 p-2 font-medium text-lico-gray-1 outline-none focus:ring-2 focus:ring-lico-orange-2"
            aria-label="방송 설명"
          />
        </div>

        <div id="category-container" ref={containerRef} className="relative">
          <label htmlFor="category" className="mb-2 block font-bold text-lico-gray-1" onClick={e => e.preventDefault()}>
            카테고리
          </label>
          <div className="flex flex-col gap-2">
            <SearchInput
              value={categorySearch}
              onChange={setCategorySearch}
              onClick={() => setShowDropdown(true)}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
              placeholder="카테고리 검색"
            />

            {selectedCategory && (
              <div className="-mb-2 flex items-center gap-1">
                <div className="w-fit">
                  <CategoryBadge
                    category={selectedCategory.name}
                    categoryId={selectedCategory.id}
                    className="text-sm text-lico-gray-4"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="rounded p-0.5 hover:bg-lico-gray-4"
                  aria-label="카테고리 삭제"
                >
                  <LuX className="h-4 w-4 text-lico-gray-2" />
                </button>
              </div>
            )}

            <Dropdown
              show={showDropdown}
              items={filteredItems}
              highlightedIndex={highlightedIndex}
              onSelect={handleSelect}
              onHighlight={setHighlightedIndex}
              renderItem={category => (
                <div className="flex items-center gap-2">
                  <img src={category.image} alt={category.name} className="h-6 w-6 rounded" />
                  <span className="font-medium text-sm text-lico-gray-1">{category.name}</span>
                </div>
              )}
            />
          </div>
        </div>

        {/* <div>
        <label htmlFor="tags" className="mb-2 block font-bold text-lico-gray-1">
          태그<span className="text-lico-gray-2"> (최대 5개)</span>
        </label>
        <div className="flex gap-2">
          <input
            id="tags"
            type="text"
            className="flex-1 rounded bg-lico-gray-5 p-2 font-medium text-sm text-lico-gray-1 outline-none focus:ring-2 focus:ring-lico-orange-2"
            placeholder="태그 입력"
            aria-label="태그 입력"
          />
          <button
            type="button"
            className="whitespace-nowrap rounded-md bg-lico-gray-3 px-3 py-2 font-medium text-sm text-lico-gray-1 hover:bg-lico-gray-1 hover:text-lico-orange-2"
            aria-label="태그 추가"
          >
            추가
          </button>
        </div>
      </div> */}

        <button
          type="submit"
          className="flex items-center justify-center rounded bg-lico-orange-2 px-4 py-2 font-bold text-lico-gray-5 transition-colors hover:bg-lico-orange-1"
          aria-label="방송 정보 업데이트"
        >
          업데이트
        </button>
      </form>
      <Toast message={toastMessage} isOpen={showToast} onClose={() => setShowToast(false)} />
    </>
  );
}
