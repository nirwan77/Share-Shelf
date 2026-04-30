import { createFileRoute } from "@tanstack/react-router";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  Group,
  Loader,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import {
  IconBan,
  IconCheck,
  IconMessageReport,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import {
  useGetDeletedComments,
  useGetReports,
  useReportModerationActions,
} from "./-queries";
import type { DeletedCommentItem, ReportItem } from "./-queries";

export const Route = createFileRoute("/_withLayout/reports/")({
  component: ReportsModeration,
});

function ReportsModeration() {
  const [page, setPage] = useState(1);
  const [deletedCommentsPage, setDeletedCommentsPage] = useState(1);
  const [status, setStatus] = useState("PENDING");
  const { data, isLoading } = useGetReports(status, page);
  const { data: deletedComments, isLoading: deletedCommentsLoading } =
    useGetDeletedComments(deletedCommentsPage);
  const actions = useReportModerationActions();

  const isMutating =
    actions.deletePost.isPending ||
    actions.deleteComment.isPending ||
    actions.banUser.isPending ||
    actions.resolveReport.isPending ||
    actions.dismissReport.isPending;

  const confirmAction = (message: string, action: () => void) => {
    if (window.confirm(message)) action();
  };

  const rows = data?.data.map((report) => (
    <ReportRow
      key={report.id}
      report={report}
      isMutating={isMutating}
      onDeletePost={() =>
        report.post &&
        confirmAction("Remove this reported post?", () =>
          actions.deletePost.mutate(report.post!.id),
        )
      }
      onDeleteComment={() =>
        report.comment &&
        confirmAction("Remove this reported comment?", () =>
          actions.deleteComment.mutate(report.comment!.id),
        )
      }
      onBanUser={() =>
        confirmAction("Ban this user from the platform?", () =>
          actions.banUser.mutate(report.reportedUser.id),
        )
      }
      onResolve={() => actions.resolveReport.mutate(report.id)}
      onDismiss={() => actions.dismissReport.mutate(report.id)}
    />
  ));

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={1} fw={800} style={{ letterSpacing: "-0.02em" }}>
            Reports
          </Title>
          <Text c="dimmed" mt={4}>
            Review reported posts, comments, and users from the discuss forum.
          </Text>
        </div>
        <Select
          label="Status"
          value={status}
          onChange={(value) => {
            setStatus(value || "PENDING");
            setPage(1);
          }}
          data={[
            { value: "PENDING", label: "Pending" },
            { value: "RESOLVED", label: "Resolved" },
            { value: "DISMISSED", label: "Dismissed" },
            { value: "all", label: "All" },
          ]}
          w={180}
        />
      </Group>

      <Paper withBorder p="md" radius="md" shadow="xs">
        <Box pos="relative">
          {isLoading && (
            <Center p="xl">
              <Loader size="lg" />
            </Center>
          )}

          {!isLoading && data && (
            <>
              <Table verticalSpacing="md" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Report</Table.Th>
                    <Table.Th>Reported User</Table.Th>
                    <Table.Th>Content</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
              </Table>

              {data.data.length === 0 && (
                <Center py="xl">
                  <Stack align="center" gap="xs">
                    <IconMessageReport size={36} color="gray" />
                    <Text c="dimmed">No reports found.</Text>
                  </Stack>
                </Center>
              )}

              <Group justify="space-between" mt="md">
                <Text size="sm" c="dimmed">
                  Showing {data.data.length} of {data.meta.total} reports
                </Text>
                <Pagination
                  total={Math.max(1, data.meta.totalPages)}
                  value={page}
                  onChange={setPage}
                />
              </Group>
            </>
          )}
        </Box>
      </Paper>

      <Paper withBorder p="md" radius="md" shadow="xs">
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <div>
              <Title order={2} size="h3" fw={700}>
                Deleted comments
              </Title>
              <Text c="dimmed" size="sm" mt={2}>
                Comments removed by moderation are kept here for audit.
              </Text>
            </div>
            {deletedComments && (
              <Badge color="gray" variant="light">
                {deletedComments.meta.total} total
              </Badge>
            )}
          </Group>

          {deletedCommentsLoading && (
            <Center p="xl">
              <Loader size="md" />
            </Center>
          )}

          {!deletedCommentsLoading && deletedComments && (
            <>
              <Table verticalSpacing="md" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Comment</Table.Th>
                    <Table.Th>Author</Table.Th>
                    <Table.Th>Post</Table.Th>
                    <Table.Th>Deleted</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {deletedComments.data.map((comment) => (
                    <DeletedCommentRow key={comment.id} comment={comment} />
                  ))}
                </Table.Tbody>
              </Table>

              {deletedComments.data.length === 0 && (
                <Center py="xl">
                  <Stack align="center" gap="xs">
                    <IconTrash size={36} color="gray" />
                    <Text c="dimmed">No deleted comments found.</Text>
                  </Stack>
                </Center>
              )}

              <Group justify="space-between" mt="md">
                <Text size="sm" c="dimmed">
                  Showing {deletedComments.data.length} of{" "}
                  {deletedComments.meta.total} deleted comments
                </Text>
                <Pagination
                  total={Math.max(1, deletedComments.meta.totalPages)}
                  value={deletedCommentsPage}
                  onChange={setDeletedCommentsPage}
                />
              </Group>
            </>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}

function DeletedCommentRow({ comment }: { comment: DeletedCommentItem }) {
  return (
    <Table.Tr>
      <Table.Td maw={360}>
        <Text size="sm" fw={600} lineClamp={2}>
          {comment.comment}
        </Text>
        <Text size="xs" c="dimmed">
          Original comment ID: {comment.commentId}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={600}>
          {comment.userName || "Unknown user"}
        </Text>
        {comment.userEmail && (
          <Text size="xs" c="dimmed">
            {comment.userEmail}
          </Text>
        )}
      </Table.Td>
      <Table.Td maw={260}>
        <Text size="sm" lineClamp={1}>
          {comment.postTitle || "Deleted post"}
        </Text>
        <Text size="xs" c="dimmed">
          {comment.postId}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{new Date(comment.deletedAt).toLocaleString()}</Text>
      </Table.Td>
    </Table.Tr>
  );
}

function ReportRow({
  report,
  isMutating,
  onDeletePost,
  onDeleteComment,
  onBanUser,
  onResolve,
  onDismiss,
}: {
  report: ReportItem;
  isMutating: boolean;
  onDeletePost: () => void;
  onDeleteComment: () => void;
  onBanUser: () => void;
  onResolve: () => void;
  onDismiss: () => void;
}) {
  const contentTitle =
    report.targetType === "POST"
      ? report.post?.title || "Deleted post"
      : report.comment?.comment || "Deleted comment";
  const contentPreview =
    report.targetType === "POST" ? report.post?.content : report.comment?.comment;

  return (
    <Table.Tr>
      <Table.Td>
        <Stack gap={4}>
          <Group gap="xs">
            <Badge color={report.targetType === "POST" ? "orange" : "blue"}>
              {report.targetType}
            </Badge>
            <Text size="xs" c="dimmed">
              {new Date(report.createdAt).toLocaleString()}
            </Text>
          </Group>
          <Text size="sm" fw={700}>
            {report.reason}
          </Text>
          {report.details && (
            <Text size="xs" c="dimmed" lineClamp={2}>
              {report.details}
            </Text>
          )}
          <Text size="xs" c="dimmed">
            Reported by {report.reporter.name}
          </Text>
        </Stack>
      </Table.Td>
      <Table.Td>
        <Group gap="sm">
          <Avatar src={report.reportedUser.avatar} radius="xl" size={34} />
          <div>
            <Group gap="xs">
              <Text size="sm" fw={600}>
                {report.reportedUser.name}
              </Text>
              {report.reportedUser.isBanned && (
                <Badge color="red" size="xs">
                  Banned
                </Badge>
              )}
            </Group>
            <Text size="xs" c="dimmed">
              {report.reportedUser.email}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td maw={320}>
        <Text size="sm" fw={600} lineClamp={1}>
          {contentTitle}
        </Text>
        {contentPreview && (
          <Text size="xs" c="dimmed" lineClamp={2}>
            {contentPreview}
          </Text>
        )}
      </Table.Td>
      <Table.Td>
        <Badge
          color={
            report.status === "PENDING"
              ? "yellow"
              : report.status === "RESOLVED"
                ? "green"
                : "gray"
          }
        >
          {report.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          {report.targetType === "POST" ? (
            <Button
              size="xs"
              color="red"
              variant="light"
              leftSection={<IconTrash size={14} />}
              disabled={!report.post || isMutating}
              onClick={onDeletePost}
            >
              Remove post
            </Button>
          ) : (
            <Button
              size="xs"
              color="red"
              variant="light"
              leftSection={<IconTrash size={14} />}
              disabled={!report.comment || isMutating}
              onClick={onDeleteComment}
            >
              Remove comment
            </Button>
          )}
          <Button
            size="xs"
            color="red"
            variant="outline"
            leftSection={<IconBan size={14} />}
            disabled={report.reportedUser.isBanned || isMutating}
            onClick={onBanUser}
          >
            Ban user
          </Button>
          <Button
            size="xs"
            color="green"
            variant="light"
            leftSection={<IconCheck size={14} />}
            disabled={report.status !== "PENDING" || isMutating}
            onClick={onResolve}
          >
            Resolve
          </Button>
          <Button
            size="xs"
            color="gray"
            variant="subtle"
            leftSection={<IconX size={14} />}
            disabled={report.status !== "PENDING" || isMutating}
            onClick={onDismiss}
          >
            Dismiss
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}
