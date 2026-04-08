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
  Tabs,
  Card,
} from "@mantine/core";
import { IconCash, IconCheck, IconUser, IconWallet, IconX, IconCircleCheck } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import {
  useGetPendingTransactions,
  useGetAllTransactions,
  useCompleteTransfer,
  type TopupTransaction,
} from "./transactions/-queries";

export const Route = createFileRoute("/_withLayout/transactions")({
  component: TransactionsManagement,
});

function TransactionsManagement() {
  const { data: transactions, isLoading: pendingLoading } = useGetPendingTransactions();
  const { data: allTransactions, isLoading: allLoading } = useGetAllTransactions();
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

  const renderTopupTransactions = (topups: TopupTransaction[]) => {
    return topups.map((tx) => (
      <Table.Tr key={tx.id}>
        <Table.Td>
          <Group gap="sm">
            <Avatar color="blue" radius="xl" size="sm">
              <IconWallet size={14} />
            </Avatar>
            <div>
              <Text size="sm" fw={500}>
                Wallet Topup
              </Text>
              <Text size="xs" c="dimmed">
                {tx.transaction_uuid}
              </Text>
            </div>
          </Group>
        </Table.Td>
        <Table.Td>
          <Group gap="sm">
            <Avatar color="green" radius="xl" size="sm">
              <IconUser size={14} />
            </Avatar>
            <div>
              <Text size="sm">{tx.user.name}</Text>
              <Text size="xs" c="dimmed">
                {tx.user.email}
              </Text>
            </div>
          </Group>
        </Table.Td>
        <Table.Td>
          <Text size="sm" fw={700}>
            Rs. {tx.total_amount}
          </Text>
        </Table.Td>
        <Table.Td>
          <Badge
            color={tx.status === 'SUCCESS' ? 'green' : tx.status === 'FAILED' ? 'red' : 'yellow'}
            variant="light"
            leftSection={tx.status === 'SUCCESS' ? <IconCircleCheck size={12} /> : tx.status === 'FAILED' ? <IconX size={12} /> : null}
          >
            {tx.status}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Text size="sm">
            {new Date(tx.createdAt).toLocaleDateString()}
          </Text>
        </Table.Td>
      </Table.Tr>
    ));
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
            View all transactions including wallet topups and book purchases.
          </Text>
        </div>
      </Group>

      <Paper withBorder p="md" radius="md" shadow="xs">
        <Tabs defaultValue="pending" variant="outline">
          <Tabs.List>
            <Tabs.Tab value="pending" leftSection={<IconCash size={14} />}>
              Pending Transfers ({transactions?.length || 0})
            </Tabs.Tab>
            <Tabs.Tab value="all" leftSection={<IconWallet size={14} />}>
              All Transactions ({(allTransactions?.purchases?.length || 0) + (allTransactions?.topups?.length || 0)})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="pending" pt="md">
            <Box pos="relative">
              {pendingLoading && (
                <Center p="xl">
                  <Loader size="lg" />
                </Center>
              )}

              {!pendingLoading && (!transactions || transactions.length === 0) && (
                <Center p="xl">
                  <Stack align="center" gap="xs">
                    <IconCheck size={40} color="var(--mantine-color-dimmed)" />
                    <Text c="dimmed">No pending transactions found.</Text>
                  </Stack>
                </Center>
              )}

              {!pendingLoading && transactions && transactions.length > 0 && (
                <>
                  <ScrollArea h={400}>
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
          </Tabs.Panel>

          <Tabs.Panel value="all" pt="md">
            <Box pos="relative">
              {allLoading && (
                <Center p="xl">
                  <Loader size="lg" />
                </Center>
              )}

              {!allLoading && allTransactions && (
                <Stack gap="lg">
                  {/* Wallet Topups */}
                  <Card withBorder p="sm" radius="md">
                    <Title order={3} mb="md">Wallet Topups</Title>
                    {(!allTransactions.topups || allTransactions.topups.length === 0) ? (
                      <Center p="md">
                        <Text c="dimmed">No wallet topups found.</Text>
                      </Center>
                    ) : (
                      <ScrollArea h={300}>
                        <Table verticalSpacing="sm" highlightOnHover>
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th>Type</Table.Th>
                              <Table.Th>User</Table.Th>
                              <Table.Th>Amount</Table.Th>
                              <Table.Th>Status</Table.Th>
                              <Table.Th>Date</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>{renderTopupTransactions(allTransactions.topups || [])}</Table.Tbody>
                        </Table>
                      </ScrollArea>
                    )}
                  </Card>

                  {/* Book Purchases */}
                  <Card withBorder p="sm" radius="md">
                    <Title order={3} mb="md">Book Purchases</Title>
                    {(!allTransactions.purchases || allTransactions.purchases.length === 0) ? (
                      <Center p="md">
                        <Text c="dimmed">No book purchases found.</Text>
                      </Center>
                    ) : (
                      <ScrollArea h={300}>
                        <Table verticalSpacing="sm" highlightOnHover>
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th>Book</Table.Th>
                              <Table.Th>Buyer</Table.Th>
                              <Table.Th>Seller</Table.Th>
                              <Table.Th>Total Price</Table.Th>
                              <Table.Th>Status</Table.Th>
                              <Table.Th>Date</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {allTransactions.purchases.map((tx) => (
                              <Table.Tr key={tx.id}>
                                <Table.Td>
                                  <Group gap="sm">
                                    <Image
                                      src={tx.book.image}
                                      h={30}
                                      w={20}
                                      radius="xs"
                                      fallbackSrc="https://placehold.co/20x30?text=Book"
                                    />
                                    <div>
                                      <Text size="xs" fw={500}>
                                        {tx.book.name}
                                      </Text>
                                    </div>
                                  </Group>
                                </Table.Td>
                                <Table.Td>
                                  <Text size="xs">{tx.buyer.name}</Text>
                                </Table.Td>
                                <Table.Td>
                                  <Text size="xs">{tx.seller.name}</Text>
                                </Table.Td>
                                <Table.Td>
                                  <Text size="xs" fw={700}>
                                    Rs. {tx.price}
                                  </Text>
                                </Table.Td>
                                <Table.Td>
                                  <Badge
                                    color={tx.status === 'COMPLETED' ? 'green' : tx.status === 'FAILED' ? 'red' : 'blue'}
                                    variant="light"
                                    size="xs"
                                  >
                                    {tx.status}
                                  </Badge>
                                </Table.Td>
                                <Table.Td>
                                  <Text size="xs">
                                    {new Date(tx.createdAt).toLocaleDateString()}
                                  </Text>
                                </Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                      </ScrollArea>
                    )}
                  </Card>
                </Stack>
              )}
            </Box>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Stack>
  );
}
