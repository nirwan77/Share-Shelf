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
  Button,
  Box,
  Divider,
  ScrollArea,
  Avatar,
  Image,
} from "@mantine/core";
import { IconCash, IconCheck, IconUser } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import {
  useGetPendingTransactions,
  useCompleteTransfer,
} from "./transactions/-queries";

export const Route = createFileRoute("/_withLayout/transactions")({
  component: TransactionsManagement,
});

function TransactionsManagement() {
  const { data: transactions, isLoading } = useGetPendingTransactions();
  const transferMutation = useCompleteTransfer();

  const handleTransfer = (id: string, amount: number) => {
    if (window.confirm(`Are you sure you want to transfer Rs. ${amount} to the seller?`)) {
      transferMutation.mutate(id, {
        onSuccess: () => {
          notifications.show({
            title: "Success",
            message: "Amount transferred to seller wallet",
            color: "green",
          });
        },
      });
    }
  };

  const rows = transactions?.map((tx) => (
    <Table.Tr key={tx.id}>
      <Table.Td>
        <Group gap="sm">
          <Image
            src={tx.book.image}
            h={40}
            w={30}
            radius="xs"
            fallbackSrc="https://placehold.co/30x40?text=Book"
          />
          <div>
            <Text size="sm" fw={500}>
              {tx.book.name}
            </Text>
            <Text size="xs" c="dimmed">
              {tx.book.author}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap="sm">
          <Avatar color="blue" radius="xl" size="sm">
            <IconUser size={14} />
          </Avatar>
          <div>
            <Text size="sm">{tx.buyer.name}</Text>
            <Text size="xs" c="dimmed">
              {tx.buyer.email}
            </Text>
            {tx.location && (
              <Badge size="xs" color="gray" variant="light" mt={4}>
                📍 {tx.location}
              </Badge>
            )}
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap="sm">
          <Avatar color="green" radius="xl" size="sm">
            <IconUser size={14} />
          </Avatar>
          <div>
            <Text size="sm">{tx.seller.name}</Text>
            <Text size="xs" c="dimmed">
              {tx.seller.email}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <Stack gap={0}>
          <Text size="sm" fw={700}>
            Rs. {tx.price}
          </Text>
          <Text size="xs" c="red">
            -{tx.commissionAmount} cut
          </Text>
        </Stack>
      </Table.Td>
      <Table.Td>
        <Text fw={700} c="green">
          Rs. {tx.sellerAmount}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge color="blue" variant="light">
          {tx.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {new Date(tx.updatedAt).toLocaleDateString()}
        </Text>
      </Table.Td>
      <Table.Td>
        <Button
          size="xs"
          leftSection={<IconCash size={14} />}
          onClick={() => handleTransfer(tx.id, tx.sellerAmount)}
          loading={transferMutation.isPending && transferMutation.variables === tx.id}
          color="green"
        >
          Transfer
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={1} fw={800} style={{ letterSpacing: "-0.02em" }}>
            Transactions Management
          </Title>
          <Text c="dimmed" mt={4}>
            View pending payments and release funds to sellers.
          </Text>
        </div>
      </Group>

      <Paper withBorder p="md" radius="md" shadow="xs">
        <Box pos="relative">
          {isLoading && (
            <Center p="xl">
              <Loader size="lg" />
            </Center>
          )}

          {!isLoading && (!transactions || transactions.length === 0) && (
            <Center p="xl">
              <Stack align="center" gap="xs">
                <IconCheck size={40} color="var(--mantine-color-dimmed)" />
                <Text c="dimmed">No pending transactions found.</Text>
              </Stack>
            </Center>
          )}

          {!isLoading && transactions && transactions.length > 0 && (
            <>
              <ScrollArea h={500}>
                <Table verticalSpacing="sm" highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Book</Table.Th>
                      <Table.Th>Buyer / Location</Table.Th>
                      <Table.Th>Seller</Table.Th>
                      <Table.Th>Total Price</Table.Th>
                      <Table.Th>Seller Earning</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Payment Date</Table.Th>
                      <Table.Th />
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>{rows}</Table.Tbody>
                </Table>
              </ScrollArea>
              <Divider mt="md" />
              <Group justify="space-between" mt="md">
                <Text size="sm" c="dimmed">
                  Showing {transactions.length} pending transactions
                </Text>
              </Group>
            </>
          )}
        </Box>
      </Paper>
    </Stack>
  );
}
