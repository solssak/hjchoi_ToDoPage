'use client';
import { ArrowDownUp, Trash2, Pen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { BoardProps } from '@/types/Board';

const BoardItems = ({
  id,
  board,
  handleDelete,
  handleEdit,
}: {
  id: string;
  board: BoardProps;
  handleDelete: (id: string) => void;
  handleEdit: (board: BoardProps) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: id as string });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const router = useRouter();
  const handleClick = () => {
    router.push(`/${id}`);
  };

  const confirmDelete = (id: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      handleDelete(id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex flex-col p-4 bg-gray-100 border rounded-xl cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-lg font-bold truncate">{board.title}</h2>
          <p className="truncate">{board.desc}</p>
        </div>
        <button className="p-2 cursor-pointer" {...listeners}>
          <ArrowDownUp size={20} />
        </button>
        <button
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            handleEdit(board);
          }}
          className="p-2 cursor-pointer"
        >
          <Pen size={20} />
        </button>
        <button
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            confirmDelete(id);
          }}
          className="p-2 text-red-500 cursor-pointer"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default BoardItems;
