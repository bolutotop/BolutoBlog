"use client";

import { useTransition } from 'react';
import { deletePostAction } from '@/app/actions';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function DeleteButton({ id, title }: { id: string, title: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!window.confirm(`确定要永久删除文章 "${title}" 吗？此操作不可逆。`)) return;

    // 使用 transition 包裹 Server Action 调用
    startTransition(async () => {
      const result = await deletePostAction(id);
      if (!result.success) {
        alert(result.message);
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      title="删除"
      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 transition-colors disabled:opacity-50"
    >
      <TrashIcon className="w-5 h-5" />
    </button>
  );
}