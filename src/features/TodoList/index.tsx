'use client';
import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import useThrottle from '@/hooks/useThrottle';
import { BoardProps } from '@/types/Board';
import ListModal from '@/ui/ListModal';

import TodoItems from '../TodoItems';
import { LOCAL_STORAGE_KEY, PLACEHOLDER, REDO, TITLE, UNDO } from './common';

const TodoList = () => {
  const [board, setBoard] = useState<BoardProps | null>(null);
  const [history, setHistory] = useState<BoardProps[][]>([]);
  const [redoStack, setRedoStack] = useState<BoardProps[][]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newTodo, setNewTodo] = useState<string>('');
  const [editingTodo, setEditingTodo] = useState<string | null>(null);
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const throttledSearchQuery = useThrottle(searchQuery, 300);

  useEffect(() => {
    if (typeof window !== 'undefined' && id) {
      const storedBoards = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedBoards) {
        const boards: BoardProps[] = JSON.parse(storedBoards);
        const currentBoard = boards.find((board) => board.id === id);
        setBoard(currentBoard || null);
      }
    }
  }, [id]);

  useEffect(() => {
    if (board) {
      const storedBoards = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedBoards) {
        const boards: BoardProps[] = JSON.parse(storedBoards);
        const updatedBoards = boards.map((b) =>
          b.id === board.id ? board : b,
        );
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedBoards));
      }
    }
  }, [board]);

  const saveHistory = () => {
    if (board) {
      setHistory((prev) => [...prev, [...(prev.at(-1) || []), board]]);
      setRedoStack([]);
    }
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const prevBoards = history.pop() ?? [];
      setRedoStack((prev) => [...prev, board ? [board] : []]);
      setBoard(prevBoards.at(-1) || null);
      setHistory([...history]);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextBoards = redoStack.pop() ?? [];
      setHistory((prev) => [...prev, board ? [board] : []]);
      setBoard(nextBoards.at(-1) || null);
      setRedoStack([...redoStack]);
    }
  };

  const handleAddTodo = () => {
    if (board && id && newTodo.trim()) {
      saveHistory();
      const updatedBoard = editingTodo
        ? {
            ...board,
            items: (board.items ?? []).map((item) =>
              item.id === editingTodo ? { ...item, title: newTodo } : item,
            ),
          }
        : {
            ...board,
            items: [
              ...(board.items ?? []),
              { id: uuidv4(), title: newTodo.trim() },
            ],
          };

      setBoard(updatedBoard);
      setIsModalOpen(false);
      setNewTodo('');
      setEditingTodo(null);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    saveHistory();
    setBoard((prevBoard) => {
      if (!prevBoard) return prevBoard;
      const oldIndex =
        prevBoard.items?.findIndex((item) => item.id === active.id) ?? -1;
      const newIndex =
        prevBoard.items?.findIndex((item) => item.id === over.id) ?? -1;

      if (oldIndex < 0 || newIndex < 0) return prevBoard;
      const newItems = arrayMove(prevBoard.items ?? [], oldIndex, newIndex);
      return { ...prevBoard, items: newItems };
    });
  };

  const handleDeleteTodo = (todoId: string) => {
    saveHistory();
    if (board) {
      const updatedBoard = {
        ...board,
        items: (board.items ?? []).filter((item) => item.id !== todoId),
      };
      setBoard(updatedBoard);
    }
  };

  const handleEditTodo = (todoId: string, todo: string) => {
    setNewTodo(todo);
    setEditingTodo(todoId);
    setIsModalOpen(true);
  };

  const filteredBoards = useMemo(
    () =>
      (board?.items ?? []).filter((item) =>
        item.title.toLowerCase().includes(throttledSearchQuery.toLowerCase()),
      ),
    [board, throttledSearchQuery],
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{TITLE}</h1>
        <div>
          <button
            onClick={handleUndo}
            className="p-2 ml-2 bg-gray-500 text-white rounded"
          >
            {UNDO}
          </button>
          <button
            onClick={handleRedo}
            className="p-2 ml-2 bg-gray-500 text-white rounded"
          >
            {REDO}
          </button>
          <button
            className="p-2 ml-2 text-white bg-blue-500 rounded"
            onClick={() => setIsModalOpen(true)}
          >
            추가
          </button>
        </div>
      </div>
      <p className="text-xl font-semibold">{board?.title}</p>
      <p className="mb-4">{board?.desc}</p>

      <input
        type="text"
        placeholder={PLACEHOLDER}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 mb-4 border border-gray-300 rounded"
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredBoards.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <section className="grid grid-cols-1 gap-2">
            {filteredBoards.map((item) => (
              <TodoItems
                key={item.id}
                id={item.id}
                title={item.title}
                handleDeleteTodo={() => handleDeleteTodo(item.id)}
                handleEditTodo={() => handleEditTodo(item.id, item.title)}
              />
            ))}
          </section>
        </SortableContext>
      </DndContext>

      {isModalOpen && (
        <ListModal
          newTodo={newTodo}
          setNewTodo={setNewTodo}
          onClose={() => {
            setIsModalOpen(false);
            setNewTodo('');
            setEditingTodo(null);
          }}
          handleAddTodo={handleAddTodo}
          editingTodo={editingTodo}
        />
      )}
    </div>
  );
};

export default TodoList;
