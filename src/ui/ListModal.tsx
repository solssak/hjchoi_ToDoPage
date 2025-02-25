import React from 'react';

const ListModal = ({
  newTodo,
  setNewTodo,
  onClose,
  handleAddTodo,
  editingTodo,
}: {
  newTodo: string;
  setNewTodo: (value: string) => void;
  onClose: () => void;
  handleAddTodo: () => void;
  editingTodo: string | null;
}) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-4 rounded">
      <h2 className="text-xl mb-4">
        {editingTodo ? '할일 수정' : '새로운 Todo 추가'}
      </h2>
      <input
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        className="border p-2 mb-4 w-full"
        placeholder="Todo 내용 입력"
      />
      <div className="flex justify-end">
        <button
          className="p-2 mr-2 text-white bg-gray-500 rounded"
          onClick={onClose}
        >
          취소
        </button>
        <button
          className="p-2 text-white bg-blue-500 rounded"
          onClick={handleAddTodo}
        >
          {editingTodo ? '수정' : '추가'}
        </button>
      </div>
    </div>
  </div>
);

export default ListModal;
