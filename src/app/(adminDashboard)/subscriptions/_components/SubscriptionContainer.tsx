"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Spin,
  Switch,
  Tag,
  Typography,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import {
  useGetPackagesQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation,
} from "@/redux/api/packages";

const { Title, Text, Paragraph } = Typography;

interface Package {
  id: string;
  name: string;
  duration: number;
  productId: string;
  description: string;
  price: number;
  isRecommended: boolean;
}

interface PackageFormValues {
  name: string;
  duration: number;
  productId: string;
  description: string;
  price: number;
  isRecommended: boolean;
}

export default function SubscriptionContainer() {
  const { data, isLoading, isFetching } = useGetPackagesQuery(undefined);
  const [createPackage, { isLoading: isCreating }] = useCreatePackageMutation();
  const [updatePackage, { isLoading: isUpdating }] = useUpdatePackageMutation();
  const [deletePackage] = useDeletePackageMutation();

  const [form] = Form.useForm<PackageFormValues>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const packages: Package[] = data?.data?.data ?? data?.data ?? data ?? [];

  const isEditMode = Boolean(editingPackage);
  const isSubmitting = isCreating || isUpdating;

  // Reset / prefill form whenever modal opens
  useEffect(() => {
    if (isModalOpen) {
      if (editingPackage) {
        form.setFieldsValue({
          name: editingPackage.name,
          duration: editingPackage.duration,
          productId: editingPackage.productId,
          description: editingPackage.description,
          price: editingPackage.price,
          isRecommended: editingPackage.isRecommended,
        });
      } else {
        form.resetFields();
      }
    }
  }, [isModalOpen, editingPackage, form]);

  const openAddModal = () => {
    setEditingPackage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: Package) => {
    setEditingPackage(pkg);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEditMode && editingPackage) {
        await updatePackage({ id: editingPackage.id, ...values }).unwrap();
        message.success("Plan updated successfully");
      } else {
        await createPackage(values).unwrap();
        message.success("Plan created successfully");
      }

      closeModal();
    } catch (err: any) {
      if (err?.errorFields) return; // antd validation error, do nothing extra
      message.error(err?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deletePackage(id).unwrap();
      message.success("Plan deleted successfully");
    } catch (err: any) {
      message.error(err?.data?.message || "Failed to delete plan");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <Title level={3} className="!mb-0">
          Subscription Plans
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
          Add Plan
        </Button>
      </div>

      <Spin spinning={isLoading || isFetching}>
        {packages.length === 0 && !isLoading ? (
          <Empty description="No plans found" className="py-16" />
        ) : (
          <Row gutter={[16, 16]}>
            {packages?.map((pkg) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={pkg.id}>
                <Card
                  className="h-full border border-[#00C0B5]/20"
                  actions={[
                    <EditOutlined
                      key="edit"
                      onClick={() => openEditModal(pkg)}
                      className="!text-lg"
                    />,
                    <Popconfirm
                      key="delete"
                      title="Delete this plan?"
                      description="This action cannot be undone."
                      okText="Delete"
                      cancelText="Cancel"
                      okButtonProps={{
                        danger: true,
                        loading: deletingId === pkg.id,
                      }}
                      onConfirm={() => handleDelete(pkg.id)}
                    >
                      <DeleteOutlined className="!text-lg" />
                    </Popconfirm>,
                  ]}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Title level={5} className="!mb-0">
                      {pkg.name}
                    </Title>
                    {pkg.isRecommended && (
                      <Tag color="gold" icon={<CheckCircleFilled />}>
                        Recommended
                      </Tag>
                    )}
                  </div>

                  <Text strong className="text-2xl">
                    ${(pkg.price).toFixed(2)}
                  </Text>
                  <Text> / {pkg.duration} days</Text>

                  <div className="mt-3 text-sm text-gray-500">
                    {pkg.description}
                  </div>

                  <Text
                    type="secondary"
                    className="text-xs !text-gray-500 block mt-2"
                  >
                    Product ID: {pkg.productId}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>

      <Modal
        title={isEditMode ? "Edit Plan" : "Add Plan"}
        open={isModalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        confirmLoading={isSubmitting}
        okText={isEditMode ? "Save Changes" : "Create Plan"}
        destroyOnClose
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            label="Plan Name"
            name="name"
            rules={[{ required: true, message: "Plan name is required" }]}
          >
            <Input
              placeholder="e.g. Premium Monthly Plan"
              className="py-2.5 bg-gray-100"
            />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Duration (days)"
                name="duration"
                rules={[{ required: true, message: "Duration is required" }]}
              >
                <InputNumber
                  min={1}
                  className="w-full py-2 bg-gray-100 border-[#00C0B5]"
                  placeholder="Enter duration in days"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Price"
                name="price"
                rules={[{ required: true, message: "Price is required" }]}
              >
                <InputNumber
                  min={0}
                  className="w-full py-2 bg-gray-100 border-[#00C0B5]"
                  placeholder="Enter price"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Product ID"
            name="productId"
            rules={[{ required: true, message: "Product ID is required" }]}
          >
            <Input
              placeholder="Enter product ID"
              className="py-2.5 bg-gray-100"
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Description is required" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Enjoy unlimited property listings, premium visibility..."
              className=" bg-gray-100"
            />
          </Form.Item>

          <Form.Item
            label="Recommended Plan"
            name="isRecommended"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
