"use client";

import { useState } from "react";
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Tooltip,
  Popconfirm,
  Typography,
  Row,
  Col,
  Space,
  message,
  Skeleton,
  Empty,
  Pagination,
  Alert,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InboxOutlined,
  ReloadOutlined,
  CloudServerOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd";

import {
  useGetAllServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} from "@/redux/api/servicesApi";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const PAGE_SIZE = 9;

// ─── Skeleton Card ────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <Card className="h-full border border-gray-100 bg-white rounded-2xl shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <Skeleton
          active
          title={{ width: "55%" }}
          paragraph={{ rows: 3, width: ["100%", "90%", "70%"] }}
        />
      </div>
      <Skeleton.Image active className="!w-14 !h-14 !rounded-xl flex-shrink-0" />
    </div>
  </Card>
);

// ─── Error State ──────────────────────────────────────────────────────────────

const ErrorState = ({
  message: msg,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <div className="flex flex-col items-center justify-center py-24 gap-4">
    <CloudServerOutlined className="text-6xl text-red-300" />
    <Alert
      type="error"
      message="Failed to load services"
      description={msg || "An unexpected error occurred. Please try again."}
      className="max-w-md w-full"
      action={
        <Button size="small" danger icon={<ReloadOutlined />} onClick={onRetry}>
          Retry
        </Button>
      }
    />
  </div>
);

// ─── Service Card ─────────────────────────────────────────────────────────────

interface ServiceCardProps {
  service: any;
  isActive: boolean;
  onEdit: (svc: any) => void;
  onDelete: (id: string) => void;
  deleteLoading: boolean;
}

const ServiceCard = ({
  service,
  isActive,
  onEdit,
  onDelete,
  deleteLoading,
}: ServiceCardProps) => (
  <Card
    className={`h-full transition-all duration-300 hover:shadow-md rounded-2xl border ${isActive
      ? "border-teal-400 bg-teal-50 shadow-md"
      : "border-gray-100 bg-white shadow-sm hover:border-teal-200"
      }`}
    styles={{ body: { padding: "24px", height: "100%" } }}
  >
    {/* Top row: action buttons */}
    <div className="flex justify-between gap-1 mb-3">
      <div>


        {service.image ? (
          <img
            src={service.image}
            alt={service.name}
            className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-gray-100"
            onError={(e) => {
              // If image fails to load, hide it gracefully
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          // Fallback placeholder when no image URL (shouldn't happen after create enforces image)
          <div className="w-14 h-14 rounded-xl flex-shrink-0 bg-teal-50 border border-teal-100 flex items-center justify-center">
            <InboxOutlined className="text-teal-300 text-xl" />
          </div>
        )}
      </div>
      <div>
        <Tooltip title="Edit Service" placement="top">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(service);
            }}
            className="!text-gray-400 hover:!text-teal-600 hover:!bg-teal-50 !rounded-lg"
          />
        </Tooltip>

        <Popconfirm
          title="Delete this service?"
          description="This action cannot be undone."
          okText="Yes, Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true, loading: deleteLoading }}
          onConfirm={(e) => {
            e?.stopPropagation();
            onDelete(service.id);
          }}
          onCancel={(e) => e?.stopPropagation()}
        >
          <Tooltip title="Delete Service" placement="top">
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
              loading={deleteLoading}
              className="!text-gray-400 hover:!text-red-500 hover:!bg-red-50 !rounded-lg"
            />
          </Tooltip>
        </Popconfirm>
      </div>
    </div>

    {/* Content row: text left, image right */}
    <div className="flex items-start gap-4">
      {/* Text */}
      <div className="flex-1 min-w-0">
        <Title
          level={5}
          className="!mb-2 !text-gray-800 !font-semibold leading-tight"
        >
          {service.name}
        </Title>
        <Paragraph
          ellipsis={{ rows: 3, tooltip: service.description }}
          className="!text-gray-500 !text-sm !mb-0 leading-relaxed"
        >
          {service.description}
        </Paragraph>
      </div>


    </div>
  </Card>
);

// ─── Service Form Modal ───────────────────────────────────────────────────────

interface ServiceFormModalProps {
  open: boolean;
  onClose: () => void;
  editingService: any | null;
}

const ServiceFormModal = ({
  open,
  onClose,
  editingService,
}: ServiceFormModalProps) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const isEditing = !!editingService;

  const [createService, { isLoading: isCreating }] = useCreateServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();

  const isSubmitting = isCreating || isUpdating;

  const handleClose = () => {
    form.resetFields();
    setFileList([]);
    onClose();
  };

  const handleFinish = async (values: {
    name: string;
    description: string;
  }) => {
    try {
      const formData = new FormData();
      formData.append(
        "data",
        JSON.stringify({ name: values.name, description: values.description })
      );
      // Attach image file if user picked one
      if (fileList[0]?.originFileObj) {
        formData.append("image", fileList[0].originFileObj as Blob);
      }

      if (isEditing) {
        await updateService({ id: editingService.id, data: formData }).unwrap();
        message.success("Service updated successfully!");
      } else {
        await createService(formData).unwrap();
        message.success("Service created successfully!");
      }

      handleClose();
    } catch (err: any) {
      const errMsg =
        err?.data?.message || err?.message || "Something went wrong.";
      message.error(errMsg);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <span className="font-semibold text-gray-800">
            {isEditing ? "Update Service" : "Add New Service"}
          </span>
        </Space>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={520}
      centered
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={
          isEditing
            ? {
              name: editingService.name,
              description: editingService.description,
            }
            : {}
        }
        className="mt-5"
      >
        {/* Service Name */}
        <Form.Item
          label={
            <span className="font-medium text-gray-700">Service Name</span>
          }
          name="name"
          rules={[
            { required: true, message: "Please enter the service name" },
            { min: 3, message: "Name must be at least 3 characters" },
          ]}
        >
          <Input
            placeholder="e.g. Resident Care"
            size="large"
            className="rounded-lg"
          />
        </Form.Item>

        {/* Description */}
        <Form.Item
          label={
            <span className="font-medium text-gray-700">Description</span>
          }
          name="description"
          rules={[
            { required: true, message: "Please enter a description" },
            {
              min: 10,
              message: "Description must be at least 10 characters",
            },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Describe what this service offers..."
            showCount
            maxLength={500}
            className="rounded-lg"
          />
        </Form.Item>

        {/* Image upload
            • CREATE  → required (enforced via custom validator)
            • UPDATE  → optional (user may skip to keep existing image)       */}
        <Form.Item
          label={
            <span className="font-medium text-gray-700">
              Service Image
              {!isEditing && (
                <span className="ml-1 text-red-500 font-normal">*</span>
              )}
              {isEditing && (
                <span className="ml-2 text-xs text-gray-400 font-normal">
                  (leave empty to keep current image)
                </span>
              )}
            </span>
          }
          name="image"
          // Custom validator: required only when creating
          rules={[
            {
              validator: () => {
                if (!isEditing && fileList.length === 0) {
                  return Promise.reject(
                    new Error("Please upload a service image")
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
          // Keep field value in sync so the validator re-runs on change
          valuePropName="fileList"
          getValueFromEvent={() => fileList}
        >
          <Dragger
            listType="picture"
            maxCount={1}
            beforeUpload={() => false} // prevent auto-upload
            fileList={fileList}
            onChange={({ fileList: fl }) => {
              setFileList(fl);
              // Trigger form validation for this field on change
              form.validateFields(["image"]);
            }}
            accept="image/*"
            className="rounded-xl"
          >
            {fileList.length === 0 ? (
              <>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined className="!text-teal-400 !text-3xl" />
                </p>
                <p className="ant-upload-text text-gray-600 font-medium">
                  Click or drag image to upload
                </p>
                <p className="ant-upload-hint text-gray-400 text-xs">
                  Supports PNG, JPG, JPEG, WEBP
                </p>
              </>
            ) : (
              <p className="text-teal-600 text-sm py-2">
                ✓ Image selected — drag a new one to replace
              </p>
            )}
          </Dragger>
        </Form.Item>

        {/* If editing, show the current image as a preview */}
        {isEditing && editingService.image && fileList.length === 0 && (
          <div className="mb-4 flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <img
              src={editingService.image}
              alt="Current"
              className="w-12 h-12 rounded-lg object-cover border border-gray-200"
            />
            <div>
              <p className="text-xs font-medium text-gray-600 mb-0">
                Current image
              </p>
              <p className="text-xs text-gray-400">
                Upload a new image above to replace it
              </p>
            </div>
          </div>
        )}

        {/* Footer buttons */}
        <Form.Item className="!mb-0 pt-2">
          <div className="flex justify-end gap-3">
            <Button
              onClick={handleClose}
              className="rounded-lg"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              className="!bg-teal-500 !border-teal-500 hover:!bg-teal-600 !rounded-lg !font-medium"
            >
              {isEditing ? "Update Service" : "Add Service"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── RTK Query ──
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetAllServicesQuery({ page: currentPage, limit: PAGE_SIZE });

  const [deleteService] = useDeleteServiceMutation();

  const services: any[] = response?.data?.data ?? [];
  const totalItems = response?.data?.meta?.total ?? 0;

  // ── Handlers ──
  const handleOpenAdd = () => {
    setEditingService(null);
    setModalOpen(true);
  };

  const handleEdit = (svc: any) => {
    setEditingService(svc);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteService(id).unwrap();
      message.success("Service deleted successfully!");
      if (services.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      }
    } catch (err: any) {
      const errMsg =
        err?.data?.message || err?.message || "Failed to delete service.";
      message.error(errMsg);
    } finally {
      setDeletingId(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setActiveId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const errorMessage =
    (error as any)?.data?.message ||
    (error as any)?.message ||
    "Unable to fetch services.";

  // ── Render ──
  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" ">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Title level={3} className="!mb-1 !text-gray-800 !font-bold">
              Our Services
            </Title>
            <Text className="text-gray-500 text-sm">
              {isLoading
                ? "Loading services..."
                : isError
                  ? "Could not load services"
                  : `${totalItems} service${totalItems !== 1 ? "s" : ""} available`}
            </Text>
          </div>

          <Space>
            
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleOpenAdd}
              className="!bg-teal-500 !border-teal-500 hover:!bg-teal-600 !font-medium !rounded-lg"
            >
              Add Service
            </Button>
          </Space>
        </div>

        {/* Loading */}
        {isLoading && (
          <Row gutter={[24, 24]}>
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <Col key={i} xs={24} sm={12} lg={8}>
                <SkeletonCard />
              </Col>
            ))}
          </Row>
        )}

        {/* Error */}
        {!isLoading && isError && (
          <ErrorState message={errorMessage} onRetry={refetch} />
        )}

        {/* Empty */}
        {!isLoading && !isError && services.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-gray-400">
                  No services found. Add your first service to get started.
                </span>
              }
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenAdd}
                className="!bg-teal-500 !border-teal-500 hover:!bg-teal-600 !rounded-lg"
              >
                Add First Service
              </Button>
            </Empty>
          </div>
        )}

        {/* Grid */}
        {!isLoading && !isError && services.length > 0 && (
          <>
            {isFetching && (
              <div className="mb-4">
                <Alert
                  type="info"
                  message="Refreshing services..."
                  banner
                  className="rounded-lg"
                />
              </div>
            )}

            <Row gutter={[24, 24]}>
              {services.map((svc) => (
                <Col key={svc.id} xs={24} sm={12} lg={8}>
                  <div
                    className="h-full cursor-pointer"
                    onClick={() =>
                      setActiveId(svc.id === activeId ? null : svc.id)
                    }
                  >
                    <ServiceCard
                      service={svc}
                      isActive={activeId === svc.id}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      deleteLoading={deletingId === svc.id}
                    />
                  </div>
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            {totalItems > PAGE_SIZE && (
              <div className="flex justify-center mt-10">
                <Pagination
                  current={currentPage}
                  pageSize={PAGE_SIZE}
                  total={totalItems}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showTotal={(total, range) =>
                    `${range[0]}–${range[1]} of ${total} services`
                  }
                />
              </div>
            )}

          
          </>
        )}
      </div>

      {/* Modal */}
      <ServiceFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingService(null);
        }}
        editingService={editingService}
      />
    </div>
  );
}