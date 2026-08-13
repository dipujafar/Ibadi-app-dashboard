"use client";
import { Input, Modal, TableProps } from "antd";
import { useState } from "react";
import DataTable from "@/utils/DataTable";
import { Eye, Search } from "lucide-react";
import { useGetAllUsersQuery } from "@/redux/api/usersApi";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "use-debounce";
import moment from "moment";
import BlockUser from "@/components/shared/BlockUser";
import { cn } from "@/lib/utils";
import { Image, Avatar } from "antd";
import {
  Download,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

type TDataType = {
  id: string;
  key?: number;
  name: string;
  email: string;
  status: string;
  phoneNumber?: string;
  serviceProviderInfo: any;
};

const ServiceProvider = () => {
  const page = useSearchParams().get("page") || "1";
  const limit = useSearchParams().get("limit") || "12";
  const [searchText, setSearchText] = useState("");
  const [searchValue] = useDebounce(searchText, 500);

  const [selectedRecord, setSelectedRecord] = useState<TDataType | null>(null);
  const [docsModalOpen, setDocsModalOpen] = useState(false);

  //  set queries
  const queries: Record<string, string> = {};
  if (page) queries.page = page;
  if (limit) queries.limit = limit;
  if (searchValue) queries.searchTerm = searchValue;
  queries.role = "service_provider";

  const { data: usersData, isLoading } = useGetAllUsersQuery(queries);

  console.log(usersData);

  const openDocsModal = (record: any) => {
    setSelectedRecord(record);
    setDocsModalOpen(true);
  };

  const columns: TableProps<TDataType>["columns"] = [
    {
      title: "No.",
      dataIndex: "serial",
      render: (_, __, index) => (
        <p>
          {`# ${
            Number(page) === 1
              ? index + 1
              : (Number(page) - 1) * Number(limit) + index + 1
          }`}
        </p>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      render: (text, rec) => (
        <div className="flex items-center gap-x-1.5">
          <p>{text}</p>
          <div
            className={cn(
              rec?.status === "blocked"
                ? " bg-red-600 text-white px-2 rounded-sm"
                : "hidden",
            )}
          >
            {rec?.status}
          </div>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      render: (text) => <p>{text || "N/A"}</p>,
    },

    {
      title: "Date",
      dataIndex: "createdAt",
      render: (text) => <p>{moment(text).format("DD MMM YYYY")}</p>,
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, rec) => (
        <div className="flex items-center gap-2">
          <BlockUser id={rec?.id} isActive={rec?.status === "active"} />
          <Eye
            size={22}
            onClick={() => openDocsModal(rec)}
            className="text-blue-600 hover:text-blue-800  cursor-pointer"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="bg-section-bg rounded-xl">
      <div className="md:flex items-center justify-between py-4 px-2">
        <div></div>
        <Input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<Search size={18} />}
          placeholder="Search"
          className="!max-w-72 h-9 !bg-[#F7F6F4]"
        />
      </div>
      <DataTable
        columns={columns}
        data={usersData?.data?.data}
        pageSize={Number(limit)}
        total={usersData?.data?.meta?.total}
        isLoading={isLoading}
      ></DataTable>

      <DocumentsModal
        record={selectedRecord}
        open={docsModalOpen}
        onClose={() => setDocsModalOpen(false)}
      />
    </div>
  );
};

export default ServiceProvider;

const DocumentsModal = ({
  record,
  open,
  onClose,
}: {
  record: any;
  open: boolean;
  onClose: () => void;
}) => {
  if (!record) return null;

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // fallback: open in new tab
      window.open(url, "_blank");
    }
  };

  const isPending = record.status === "pending";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      closeIcon={false}
      width={640}
      title={null}
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            Service Provider Info.
          </h2>
          {/* <StatusBadge status={record.status} /> */}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
          {record?.profile ? (
            <Image
              src={record?.profile}
              alt={record?.name}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover border border-gray-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  `https://ui-avatars.com/api/?name=${record?.name}&background=e5e7eb&color=374151`;
              }}
            />
          ) : (
            <Avatar size={48}>
              <Avatar size={40} className="uppercase text-xl">
                {record.name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </Avatar>
            </Avatar>
          )}
          <div>
            <p className="font-semibold text-gray-900">
              {record?.name || "N/A"}
            </p>
            <p className="text-sm text-gray-500">{record?.email || "N/A"}</p>
            <p className="text-sm text-gray-500">
              {record?.phoneNumber || "N/A"}
            </p>
          </div>
          <div className="ml-auto text-right text-xs text-gray-400">
            <p>Join Date</p>
            <p className="font-medium text-gray-600">
              {moment(record.createdAt).format("DD MMM YYYY, HH:mm")}
            </p>
          </div>
        </div>

        {/* Bio */}

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
            Bio
          </p>
          <p className="text-sm text-gray-700">
            {record?.serviceProviderInfo?.bio || "N/A"}
          </p>
        </div>

        {/* experience */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
            Experience
          </p>
          <p className="text-sm text-gray-700">
            {record?.serviceProviderInfo?.experience?.value || "N/A"}
          </p>
        </div>

        {/* specialistsIn */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
            Specialists In
          </p>
          <p className="text-sm text-gray-700">
            {record?.serviceProviderInfo?.specialistsIn?.length
              ? record?.serviceProviderInfo?.specialistsIn
                  ?.map((item: any) => item?.category?.name)
                  .join(", ")
              : "N/A"}
          </p>
        </div>

        {/* Documents */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
            Images ({record?.serviceProviderInfo?.images?.length || 0})
          </p>
          {record?.serviceProviderInfo?.images?.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No Images attached.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {record?.serviceProviderInfo?.images.map(
                (doc: any, idx: number) => (
                  <div
                    key={doc?.id}
                    className="border border-gray-200 rounded-xl overflow-hidden group relative"
                  >
                    {/* Image preview */}
                    <div className="relative h-36 bg-gray-100 flex items-center justify-center overflow-hidden">
                      <Image
                        src={doc?.url}
                        alt={`Document ${idx + 1}`}
                        className="object-cover w-full h-full"
                        fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='1.5'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/%3E%3Cpolyline points='14 2 14 8 20 8'/%3E%3C/svg%3E"
                        preview={{
                          mask: (
                            <div className="flex items-center gap-1 text-xs">
                              <Eye size={14} /> Preview
                            </div>
                          ),
                        }}
                      />
                    </div>

                    {/* Footer row */}
                    <div className="flex items-center justify-between px-3 py-2 bg-white border-t border-gray-100">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <FileText size={13} />
                        <span>Doc {idx + 1}</span>
                      </div>
                      <button
                        onClick={() =>
                          handleDownload(
                            doc.url,
                            `document-${idx + 1}-${doc.id}`,
                          )
                        }
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        <Download size={13} />
                        Download
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {!isPending && (
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
