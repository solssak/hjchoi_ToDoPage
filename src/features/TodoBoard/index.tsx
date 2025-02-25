'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import useThrottle from '@/hooks/useThrottle';
import { BoardProps } from '@/types/Board';
import BoardModal from '@/ui/BoardModal';

import BoardItems from '../BoardItems';
import { LOCAL_STORAGE_KEY, PLACEHOLDER, TITLE } from './common';

const ToDoBoard = () => {
  const [boards, setBoards] = useState<BoardProps[]>([]);
  const [history, setHistory] = useState<BoardProps[][]>([]);
  const [redoStack, setRedoStack] = useState<BoardProps[][]>([]);
  const [title, setTitle] = useState<string>('');
  const [desc, setDesc] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBoard, setEditingBoard] = useState<BoardProps | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const throttledSearchQuery = useThrottle(searchQuery, 300);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedBoards = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedBoards) {
      try {
        setBoards(JSON.parse(storedBoards));
      } catch (error) {
        console.error('Error parsing localStorage data:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (boards.length !== 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(boards));
    }
  }, [boards]);

  const saveHistory = () => {
    setHistory((prev) => [...prev, boards]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const prevBoards = history.pop() ?? [];
      setRedoStack((prev) => [...prev, boards]);
      setBoards(prevBoards);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prevBoards));
    } else {
      setBoards([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextBoards = redoStack.pop() ?? [];
      setHistory((prev) => [...prev, boards]);
      setBoards(nextBoards);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextBoards));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      saveHistory();
      if (editingBoard) {
        setBoards((prevBoards) =>
          prevBoards.map((board) =>
            board.id === editingBoard.id ? { ...board, title, desc } : board,
          ),
        );
      } else {
        const newBoard: BoardProps = { id: uuidv4(), title, desc, items: [] };
        setBoards([...boards, newBoard]);
      }
      setTitle('');
      setDesc('');
      setIsModalOpen(false);
      setEditingBoard(null);
    }
  };

  const handleDelete = (id: string) => {
    saveHistory();
    setBoards((prevBoards) => prevBoards.filter((board) => board.id !== id));
  };

  const handleEdit = (board: BoardProps) => {
    setTitle(board.title || '');
    setDesc(board.desc || '');
    setEditingBoard(board);
    setIsModalOpen(true);
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
    setBoards((prevBoards) => {
      const oldIndex = prevBoards.findIndex((board) => board.id === active.id);
      const newIndex = prevBoards.findIndex((board) => board.id === over.id);

      if (oldIndex < 0 || newIndex < 0) return prevBoards;
      return arrayMove(prevBoards, oldIndex, newIndex);
    });
  };

  const filteredBoards = useMemo(
    () =>
      boards.filter((board) =>
        board.title?.toLowerCase().includes(throttledSearchQuery.toLowerCase()),
      ),
    [boards, throttledSearchQuery],
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
            Undo
          </button>
          <button
            onClick={handleRedo}
            className="p-2 ml-2 bg-gray-500 text-white rounded"
          >
            Redo
          </button>
          <button
            onClick={() => {
              setTitle('');
              setDesc('');
              setEditingBoard(null);
              setIsModalOpen(true);
            }}
            className="p-2 ml-2 bg-blue-500 text-white rounded"
          >
            추가
          </button>
        </div>
      </div>
      <input
        type="text"
        placeholder={PLACEHOLDER}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 mb-4 border border-gray-300 rounded"
      />

      {isModalOpen && (
        <BoardModal
          title={title}
          desc={desc}
          isEditing={!!editingBoard}
          onClose={() => {
            setIsModalOpen(false);
            setEditingBoard(null);
          }}
          onSubmit={handleSubmit}
          onTitleChange={(e) => setTitle(e.target.value)}
          onDescChange={(e) => setDesc(e.target.value)}
        />
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredBoards.map((board) => board.id)}
          strategy={verticalListSortingStrategy}
        >
          <section className="grid grid-cols-1 gap-4">
            {filteredBoards.map((board) => (
              <BoardItems
                key={board.id}
                id={board.id}
                board={board}
                handleDelete={handleDelete}
                handleEdit={handleEdit}
              />
            ))}
          </section>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default ToDoBoard;
