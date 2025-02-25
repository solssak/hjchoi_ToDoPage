const BoardModal = ({
  title,
  desc,
  isEditing,
  onClose,
  onSubmit,
  onTitleChange,
  onDescChange,
}: {
  title: string;
  desc: string;
  isEditing: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="p-4 bg-white rounded">
        <form className="flex flex-col" onSubmit={onSubmit}>
          <input
            type="text"
            placeholder="제목"
            value={title}
            onChange={onTitleChange}
            className="p-2 mb-2 border rounded"
          />
          <textarea
            placeholder="내용"
            value={desc}
            onChange={onDescChange}
            className="p-2 mb-2 border rounded"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-white bg-gray-500 rounded"
            >
              취소
            </button>
            <button
              type="submit"
              className="p-2 ml-2 text-white bg-blue-500 rounded"
            >
              {isEditing ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BoardModal;
