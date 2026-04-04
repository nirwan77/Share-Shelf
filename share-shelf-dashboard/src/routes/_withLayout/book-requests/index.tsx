import { createFileRoute } from "@tanstack/react-router";
import {
  Title,
  Text,
  Paper,
  Group,
  Stack,
  Table,
  Badge,
  Loader,
  Center,
  Pagination,
  Button,
  Box,
  Divider,
  ScrollArea,
  Avatar,
  SegmentedControl,
} from "@mantine/core";
import { useState } from "react";
import { IconCheck, IconX } from "@tabler/icons-react";
import {
  useGetBookRequests,
  useApproveRequest,
  useRejectRequest,
} from "./-queries";
import { notifications } from "@mantine/notifications";

export const Route = createFileRoute("/_withLayout/book-requests/")({
  component: BookRequestsManagement,
});

function BookRequestsManagement() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");

  const { data, isLoading } = useGetBookRequests({
    page,
    limit: 10,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  const approveMutation = useApproveRequest();
  const rejectMutation = useRejectRequest();

  const handleApprove = (id: string) => {
    if (window.confirm("Approve this book request? You can then add the book to the catalog.")) {
      approveMutation.mutate(id, {
        onSuccess: () => {
          notifications.show({
            title: "Success",
            message: "Request approved successfully.",
            color: "green",
          });
        },
      });
    }
  };

  const handleReject = (id: string) => {
    if (window.confirm("Are you sure you want to reject this request?")) {
      rejectMutation.mutate(id, {
        onSuccess: () => {
          notifications.show({
            title: "Success",
            message: "Request rejected.",
            color: "red",
          });
        },
      });
    }
  };

  const rows = data?.data.map((req) => (
    <Table.Tr key={req.id}>
      <Table.Td>
        <Group gap="sm">
          <Avatar src={req.user.avatar} size={30} radius="xl" color="blue">
            {req.user.name.charAt(0)}
          </Avatar>
          <Text size="sm" fw={500}>
            {req.user.name}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={600}>
          {req.title}
        </Text>
        <Text size="xs" c="dimmed">
          by {req.author}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" lineClamp={2} maw={250}>
          {req.description || "-"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge
          color={
            req.status === "APPROVED"
              ? "green"
              : req.status === "REJECTED"
                ? "red"
                : "orange"
          }
          variant="light"
        >
          {req.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {new Date(req.createdAt).toLocaleDateString()}
        </Text>
      </Table.Td>
      <Table.Td>
        {req.status === "PENDING" && (
          <Group gap="xs" justify="flex-end">
            <Button
              variant="light"
              color="green"
              size="xs"
              leftSection={<IconCheck size={14} />}
              onClick={() => handleApprove(req.id)}
              loading={approveMutation.isPending}
            >
              Approve
            </Button>
            <Button
              variant="light"
              color="red"
              size="xs"
              leftSection={<IconX size={14} />}
              onClick={() => handleReject(req.id)}
              loading={rejectMutation.isPending}
            >
              Reject
            </Button>
          </Group>
        )}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={1} fw={800} style={{ letterSpacing: "-0.02em" }}>
            Book Requests
          </Title>
          <Text c="dimmed" mt={4}>
            Review and manage user requests for missing books.
          </Text>
        </div>
      </Group>

      <Paper withBorder p="md" radius="md" shadow="xs">
        <Stack gap="md">
          <SegmentedControl
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            data={[
              { label: "Pending", value: "PENDING" },
              { label: "Approved", value: "APPROVED" },
              { label: "Rejected", value: "REJECTED" },
              { label: "All", value: "ALL" },
            ]}
          />

          <Box pos="relative">
            {isLoading && (
              <Center p="xl">
                <Loader size="lg" />
              </Center>
            )}

            {!isLoading && data && (
              <>
                {data.data.length === 0 ? (
                  <Center p="xl">
                    <Text c="dimmed">No {statusFilter.toLowerCase()} requests found.</Text>
                  </Center>
                ) : (
                  <ScrollArea h={500}>
                    <Table verticalSpacing="sm" highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>User</Table.Th>
                          <Table.Th>Book Details</Table.Th>
                          <Table.Th>Description</Table.Th>
                          <Table.Th>Status</Table.Th>
                          <Table.Th>Date</Table.Th>
                          <Table.Th />
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>{rows}</Table.Tbody>
                    </Table>
                  </ScrollArea>
                )}

                {data.data.length > 0 && (
                  <>
                    <Divider mt="md" />
                    <Group justify="space-between" mt="md">
                      <Text size="sm" c="dimmed">
                        Showing {data.data.length} of {data.meta.total} requests
                      </Text>
                      <Pagination
                        total={data.meta.totalPages}
                        value={page}
                        onChange={setPage}
                        radius="md"
                      />
                    </Group>
                  </>
                )}
              </>
            )}
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
}
