"use client";
import PaginationSection from "@/components/shared/PaginationSection";
import {
  useDeleteCustomerSupportMutation,
  useGetCustomerSupportQuery,
} from "@/redux/api/customerSupportApis";
import { Button, Popconfirm, message } from "antd";
import { Loader2, Mail, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function GuestUsersMessages() {
  const page = useSearchParams().get("page") || 1;
  const limit = useSearchParams().get("limit") || 10;
  const query: Record<string, string | number> = {
    page,
    limit,
  };

  const { data, isLoading } = useGetCustomerSupportQuery(query);
  const [deleteMessage, { isLoading: isDeleting }] =
    useDeleteCustomerSupportMutation();

  const messages = data?.data?.data ?? [];

  const handleDelete = async (id: string) => {
    try {
      await deleteMessage(id).unwrap();
      message.success("Message deleted");
    } catch (err) {
      message.error("Failed to delete message");
    }
  };

  const handleReply = (email: string, subject: string) => {
    // Opens the browser's default mail handler, prefilled
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      `RE: ${subject}`,
    )}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!messages.length) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        No guest messages found.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 p-4">
        {messages.map((msg: any) => (
          <div
            key={msg.id}
            className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{msg.name}</span>
                <span className="text-xs text-muted-foreground">
                  {msg.email}
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {msg.subject}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {msg.message}
              </p>
              <span className="mt-1 text-xs text-gray-500">
                {new Date(msg.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Button
                size="small"
                icon={<Mail className="h-4 w-4" />}
                onClick={() => handleReply(msg.email, msg.subject)}
              >
                Reply
              </Button>

              <Popconfirm
                title="Delete this message?"
                description="This action cannot be undone."
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true, loading: isDeleting }}
                onConfirm={() => handleDelete(msg.id)}
              >
                <Button
                  size="small"
                  danger
                  icon={<Trash2 className="h-4 w-4" />}
                >
                  Delete
                </Button>
              </Popconfirm>
            </div>
          </div>
        ))}
      </div>

      <PaginationSection
        total={data?.data?.meta?.total}
        current={data?.data?.meta?.page}
        pageSize={Number(limit)}
      />
    </>
  );
}
