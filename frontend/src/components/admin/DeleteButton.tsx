"use client";

import { useTransition } from 'react';
import { deletePostAction } from '@/app/actions';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function DeleteButton({ id, title }: { id: string, title: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!window.confirm(`确定要永久删除文章 "${title}" 吗？此操作不可逆。`)) return;

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
      className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 font-medium text-xs"
    >
      <TrashIcon className="w-4 h-4" />
      删除
    </button>
  );
}