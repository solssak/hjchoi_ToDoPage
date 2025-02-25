import { ArrowDownUp, Pen, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TodoItems = ({
  id,
  title,
  handleDeleteTodo,
  handleEditTodo,
}: {
  id: string;
  title: string;
  handleDeleteTodo: (id: string) => void;
  handleEditTodo: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: id as string });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const confirmDelete = (id: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      handleDeleteTodo(id);
    }
  };

  return (
    <>
      <div
        key={id}
        ref={setNodeRef}
        style={style}
        {...attributes}
        className="p-2 mb-2 border rounded"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">{title}</div>
          <button className="p-2 cursor-pointer" {...listeners}>
            <ArrowDownUp size={20} />
          </button>
          <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              handleEditTodo(id);
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
    </>
  );
};

export default TodoItems;
