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
  Rate,
  Avatar,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InboxOutlined,
  ReloadOutlined,
  CloudServerOutlined,
  UserOutlined,
  StarFilled,
} from "@ant-design/icons";
import type { UploadFile } from "antd";

import {
  useGetAllClientReviewsQuery,
  useCreateClientReviewMutation,
  useUpdateClientReviewMutation,
  useDeleteClientReviewMutation,
} from "@/redux/api/clientReviewsApi";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const PAGE_SIZE = 9;

// ─── Star display helper ──────────────────────────────────────────────────────
// Renders a read-only star row with the numeric score beside it

const StarDisplay = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-2">
    <Rate
      disabled
      allowHalf
      value={rating}
      className="!text-amber-400 !text-sm"
    />
    <span className="text-xs font-semibold text-amber-500">
      {rating.toFixed(1)}
    </span>
  </div>
);

// ─── Skeleton Card ────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <Card className="h-full border border-gray-100 bg-white rounded-2xl shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton.Avatar active size={44} />
          <Skeleton active title={{ width: "40%" }} paragraph={false} />
        </div>
        <Skeleton active title={false} paragraph={{ rows: 3, width: ["100%", "85%", "65%"] }} />
        <Skeleton active title={{ width: "30%" }} paragraph={false} className="mt-3" />
      </div>
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
      message="Failed to load client reviews"
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

// ─── Review Card ──────────────────────────────────────────────────────────────

interface ReviewCardProps {
  review: any;
  isActive: boolean;
  onEdit: (r: any) => void;
  onDelete: (id: string) => void;
  deleteLoading: boolean;
}

const ReviewCard = ({
  review,
  isActive,
  onEdit,
  onDelete,
  deleteLoading,
}: ReviewCardProps) => (
  <Card
    className={`h-full transition-all duration-300 hover:shadow-md rounded-2xl border ${
      isActive
        ? "border-teal-400 bg-teal-50 shadow-md"
        : "border-gray-100 bg-white shadow-sm hover:border-teal-200"
    }`}
    styles={{ body: { padding: "24px", height: "100%" } }}
  >
    {/* Top row: action buttons aligned right */}
    <div className="flex justify-end gap-1 mb-3">
      <Tooltip title="Edit Review" placement="top">
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={(e) => { e.stopPropagation(); onEdit(review); }}
          className="!text-gray-400 hover:!text-teal-600 hover:!bg-teal-50 !rounded-lg"
        />
      </Tooltip>

      <Popconfirm
        title="Delete this review?"
        description="This action cannot be undone."
        okText="Yes, Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: deleteLoading }}
        onConfirm={(e) => { e?.stopPropagation(); onDelete(review.id); }}
        onCancel={(e) => e?.stopPropagation()}
      >
        <Tooltip title="Delete Review" placement="top">
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

    {/* Content row: avatar + text left, photo right */}
    <div className="flex items-start gap-4">
      {/* Left: avatar + name + review + stars */}
      <div className="flex-1 min-w-0">
        {/* Reviewer identity */}
        <div className="flex items-center gap-3 mb-3">
          {review.image ? (
            <Avatar
              src={review.image}
              size={44}
              className="flex-shrink-0 border-2 border-teal-100"
            />
          ) : (
            <Avatar
              icon={<UserOutlined />}
              size={44}
              className="flex-shrink-0 !bg-teal-100 !text-teal-600"
            />
          )}
          <Title level={5} className="!mb-0 !text-gray-800 !font-semibold leading-tight">
            {review.name}
          </Title>
        </div>

        {/* Review text */}
        <Paragraph
          ellipsis={{ rows: 3, tooltip: review.review }}
          className="!text-gray-500 !text-sm !mb-3 leading-relaxed"
        >
          {review.review}
        </Paragraph>

        {/* Star rating */}
        <StarDisplay rating={review.rating} />
      </div>
    </div>
  </Card>
);

// ─── Review Form Modal ────────────────────────────────────────────────────────

interface ReviewFormModalProps {
  open: boolean;
  onClose: () => void;
  editingReview: any | null;
}

const ReviewFormModal = ({
  open,
  onClose,
  editingReview,
}: ReviewFormModalProps) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const isEditing = !!editingReview;

  const [createClientReview, { isLoading: isCreating }] = useCreateClientReviewMutation();
  const [updateClientReview, { isLoading: isUpdating }] = useUpdateClientReviewMutation();

  const isSubmitting = isCreating || isUpdating;

  const handleClose = () => {
    form.resetFields();
    setFileList([]);
    onClose();
  };

  const handleFinish = async (values: {
    name: string;
    review: string;
    rating: number;
  }) => {
    try {
      // Build FormData — matches Postman: field "data" (JSON) + field "image" (File)
      const formData = new FormData();
      formData.append(
        "data",
        JSON.stringify({
          name: values.name,
          review: values.review,
          rating: values.rating,
        })
      );
      if (fileList[0]?.originFileObj) {
        formData.append("image", fileList[0].originFileObj as Blob);
      }

      if (isEditing) {
        await updateClientReview({ id: editingReview.id, data: formData }).unwrap();
        message.success("Review updated successfully!");
      } else {
        await createClientReview(formData).unwrap();
        message.success("Review created successfully!");
      }

      handleClose();
    } catch (err: any) {
      const errMsg = err?.data?.message || err?.message || "Something went wrong.";
      message.error(errMsg);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <StarFilled className="text-amber-400" />
          <span className="font-semibold text-gray-800">
            {isEditing ? "Update Review" : "Add Client Review"}
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
                name: editingReview.name,
                review: editingReview.review,
                rating: editingReview.rating,
              }
            : { rating: 5 }
        }
        className="mt-5"
      >
        {/* Reviewer Name */}
        <Form.Item
          label={<span className="font-medium text-gray-700">Client Name</span>}
          name="name"
          rules={[
            { required: true, message: "Please enter the client name" },
            { min: 2, message: "Name must be at least 2 characters" },
          ]}
        >
          <Input
            placeholder="Enter the client name"
            size="large"
            className="rounded-lg"
          />
        </Form.Item>

        {/* Review text */}
        <Form.Item
          label={<span className="font-medium text-gray-700">Review</span>}
          name="review"
          rules={[
            { required: true, message: "Please enter the review" },
            { min: 10, message: "Review must be at least 10 characters" },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="What did the client say about the service?"
            showCount
            maxLength={600}
            className="rounded-lg"
          />
        </Form.Item>

        {/* Star rating picker */}
        <Form.Item
          label={<span className="font-medium text-gray-700">Rating</span>}
          name="rating"
          rules={[{ required: true, message: "Please select a rating" }]}
        >
          {/* Ant Design <Rate> with allowHalf gives 0.5-step star selection */}
          <Rate
            allowHalf
            className="!text-amber-400 !text-2xl"
            character={<StarFilled />}
          />
        </Form.Item>

        {/* Numeric preview of chosen rating */}
        <Form.Item noStyle shouldUpdate={(prev, cur) => prev.rating !== cur.rating}>
          {({ getFieldValue }) => {
            const val: number = getFieldValue("rating") ?? 0;
            return val > 0 ? (
              <div className="mb-4 -mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-400">Selected:</span>
                <span className="text-sm font-semibold text-amber-500">
                  {val.toFixed(1)} / 5.0
                </span>
              </div>
            ) : null;
          }}
        </Form.Item>

        {/* Image upload — required on create, optional on update */}
        <Form.Item
          label={
            <span className="font-medium text-gray-700">
              Client Photo
              {!isEditing && <span className="ml-1 text-red-500">*</span>}
              {isEditing && (
                <span className="ml-2 text-xs text-gray-400 font-normal">
                  (leave empty to keep current photo)
                </span>
              )}
            </span>
          }
          name="image"
          rules={[
            {
              validator: () => {
                if (!isEditing && fileList.length === 0) {
                  return Promise.reject(new Error("Please upload a client photo"));
                }
                return Promise.resolve();
              },
            },
          ]}
          valuePropName="fileList"
          getValueFromEvent={() => fileList}
        >
          <Dragger
            listType="picture"
            maxCount={1}
            beforeUpload={() => false}
            fileList={fileList}
            onChange={({ fileList: fl }) => {
              setFileList(fl);
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
                  Click or drag photo to upload
                </p>
                <p className="ant-upload-hint text-gray-400 text-xs">
                  Supports PNG, JPG, JPEG, WEBP
                </p>
              </>
            ) : (
              <p className="text-teal-600 text-sm py-2">
                ✓ Photo selected — drag a new one to replace
              </p>
            )}
          </Dragger>
        </Form.Item>

        {/* Current photo preview on edit */}
        {isEditing && editingReview.image && fileList.length === 0 && (
          <div className="mb-4 flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <img
              src={editingReview.image}
              alt="Current"
              className="w-12 h-12 rounded-full object-cover border border-gray-200"
            />
            <div>
              <p className="text-xs font-medium text-gray-600 mb-0">Current photo</p>
              <p className="text-xs text-gray-400">Upload a new photo above to replace it</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <Form.Item className="!mb-0 pt-2">
          <div className="flex justify-end gap-3">
            <Button onClick={handleClose} className="rounded-lg" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              className="!bg-teal-500 !border-teal-500 hover:!bg-teal-600 !rounded-lg !font-medium"
            >
              {isEditing ? "Update Review" : "Add Review"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ClientReviewsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── RTK Query ──
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetAllClientReviewsQuery({ page: currentPage, limit: PAGE_SIZE });

  const [deleteClientReview] = useDeleteClientReviewMutation();

  const reviews: any[] = response?.data?.data ?? [];
  const totalItems = response?.data?.meta?.total ?? 0;

  // ── Handlers ──
  const handleOpenAdd = () => {
    setEditingReview(null);
    setModalOpen(true);
  };

  const handleEdit = (r: any) => {
    setEditingReview(r);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteClientReview(id).unwrap();
      message.success("Review deleted successfully!");
      if (reviews.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      }
    } catch (err: any) {
      const errMsg = err?.data?.message || err?.message || "Failed to delete review.";
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
    "Unable to fetch client reviews.";

  // ── Render ──
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Title level={3} className="!mb-1 !text-gray-800 !font-bold">
              Client Reviews
            </Title>
            <Text className="text-gray-500 text-sm">
              {isLoading
                ? "Loading reviews..."
                : isError
                ? "Could not load reviews"
                : `${totalItems} review${totalItems !== 1 ? "s" : ""} available`}
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
              Add Review
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
        {!isLoading && !isError && reviews.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-gray-400">
                  No reviews yet. Add your first client review.
                </span>
              }
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenAdd}
                className="!bg-teal-500 !border-teal-500 hover:!bg-teal-600 !rounded-lg"
              >
                Add First Review
              </Button>
            </Empty>
          </div>
        )}

        {/* Grid */}
        {!isLoading && !isError && reviews.length > 0 && (
          <>
            {isFetching && (
              <div className="mb-4">
                <Alert
                  type="info"
                  message="Refreshing reviews..."
                  banner
                  className="rounded-lg"
                />
              </div>
            )}

            <Row gutter={[24, 24]}>
              {reviews.map((r) => (
                <Col key={r.id} xs={24} sm={12} lg={8}>
                  <div
                    className="h-full cursor-pointer"
                    onClick={() => setActiveId(r.id === activeId ? null : r.id)}
                  >
                    <ReviewCard
                      review={r}
                      isActive={activeId === r.id}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      deleteLoading={deletingId === r.id}
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
                    `${range[0]}–${range[1]} of ${total} reviews`
                  }
                />
              </div>
            )}

            
          </>
        )}
      </div>

      {/* Modal */}
      <ReviewFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingReview(null); }}
        editingReview={editingReview}
      />
    </div>
  );
}