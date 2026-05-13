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
  SimpleGrid,
} from "@mantine/core";
import { IconBell, IconCash, IconCheck, IconUser, IconWallet, IconX, IconCircleCheck } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import {
  useGetPendingTransactions,
  useGetAllTransactions,
  useGetPurchaseSummary,
  useCompleteTransfer,
  useNotifySeller,
  type TopupTransaction,
} from "./transactions/-queries";

export const Route = createFileRoute("/_withLayout/transactions")({
  component: TransactionsManagement,
});

function TransactionsManagement() {
  const { data: transactions, isLoading: pendingLoading } = useGetPendingTransactions();
  const { data: allTransactions, isLoading: allLoading } = useGetAllTransactions();
  const { data: summary, isLoading: summaryLoading } = useGetPurchaseSummary();
  const transferMutation = useCompleteTransfer();
  const notifySellerMutation = useNotifySeller();
  const completedPayouts =
    allTransactions?.purchases.filter((tx) => tx.status === "COMPLETED") ?? [];

  const handleTransfer = (
    id: string,
    amount: number,
    sellerEsewaNumber: string,
  ) => {
    if (
      window.confirm(
        `Mark Rs. ${amount} as sent to seller eSewa number ${sellerEsewaNumber}?`,
      )
    ) {
      transferMutation.mutate(id, {
        onSuccess: () => {
          notifications.show({
            title: "Success",
            message: "Seller payout marked as completed",
            color: "green",
          });
        },
      });
    }
  };

  const handleNotifySeller = (id: string) => {
    notifySellerMutation.mutate(id, {
      onSuccess: () => {
        notifications.show({
          title: "Seller notified",
          message: "Seller has been prompted with the buyer location",
          color: "blue",
        });
      },
      onError: () => {
        notifications.show({
          title: "Notification failed",
          message: "Could not notify the seller. Please try again.",
          color: "red",
        });
      },
    });
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
            {tx.buyer.phone && (
              <Text size="xs" c="dimmed">
                {tx.buyer.phone}
              </Text>
            )}
            {tx.location && (
              <Badge size="xs" color="gray" variant="light" mt={4}>
                Location: {tx.location}
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
            {tx.seller.phone && (
              <Text size="xs" c="dimmed">
                {tx.seller.phone}
              </Text>
            )}
            <Badge
              size="xs"
              color={tx.offer.sellerEsewaNumber ? "teal" : "gray"}
              variant="light"
              mt={4}
            >
              eSewa: {tx.offer.sellerEsewaNumber || "Not provided"}
            </Badge>
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
        <Badge
          color={tx.status === "BUYER_CONFIRMED" ? "green" : "blue"}
          variant="light"
        >
          {tx.status === "BUYER_CONFIRMED" ? "Buyer confirmed" : tx.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {new Date(tx.updatedAt).toLocaleDateString()}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <Button
            size="xs"
            variant="light"
            leftSection={<IconBell size={14} />}
            onClick={() => handleNotifySeller(tx.id)}
            disabled={tx.status !== "PAID"}
            loading={notifySellerMutation.isPending && notifySellerMutation.variables === tx.id}
          >
            Notify Seller
          </Button>
          <Button
            size="xs"
            leftSection={<IconCash size={14} />}
            onClick={() =>
              tx.offer.sellerEsewaNumber &&
              handleTransfer(tx.id, tx.sellerAmount, tx.offer.sellerEsewaNumber)
            }
            disabled={!tx.offer.sellerEsewaNumber}
            loading={transferMutation.isPending && transferMutation.variables === tx.id}
            color="green"
          >
            Mark Paid
          </Button>
        </Group>
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
            View wallet topups, paid book orders, seller prompts, and payouts.
          </Text>
        </div>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                Commission Earned
              </Text>
              <Text fw={800} size="xl" mt={4}>
                Rs. {summaryLoading ? "..." : summary?.totalCommissionEarned ?? 0}
              </Text>
              <Text size="xs" c="dimmed" mt={2}>
                From paid and completed book sales
              </Text>
            </div>
            <Avatar color="orange" radius="xl">
              <IconCash size={18} />
            </Avatar>
          </Group>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                Paid To Sellers
              </Text>
              <Text fw={800} size="xl" mt={4}>
                Rs. {summaryLoading ? "..." : summary?.totalSellerPayoutSent ?? 0}
              </Text>
              <Text size="xs" c="dimmed" mt={2}>
                Marked paid by admin
              </Text>
            </div>
            <Avatar color="green" radius="xl">
              <IconWallet size={18} />
            </Avatar>
          </Group>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                Pending Payout
              </Text>
              <Text fw={800} size="xl" mt={4}>
                Rs. {summaryLoading ? "..." : summary?.pendingSellerPayout ?? 0}
              </Text>
              <Text size="xs" c="dimmed" mt={2}>
                Paid orders not sent yet
              </Text>
            </div>
            <Avatar color="blue" radius="xl">
              <IconCash size={18} />
            </Avatar>
          </Group>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                Completed Payouts
              </Text>
              <Text fw={800} size="xl" mt={4}>
                {summaryLoading ? "..." : summary?.completedPayoutCount ?? 0}
              </Text>
              <Text size="xs" c="dimmed" mt={2}>
                Seller transfers recorded
              </Text>
            </div>
            <Avatar color="teal" radius="xl">
              <IconCircleCheck size={18} />
            </Avatar>
          </Group>
        </Paper>
      </SimpleGrid>

      <Paper withBorder p="md" radius="md" shadow="xs">
        <Tabs defaultValue="pending" variant="outline">
          <Tabs.List>
            <Tabs.Tab value="pending" leftSection={<IconCash size={14} />}>
              Paid Orders ({transactions?.length || 0})
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
                    <Text c="dimmed">No paid or buyer-confirmed orders found.</Text>
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
                      Showing {transactions.length} paid or buyer-confirmed orders
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
                                    color={tx.status === 'COMPLETED' || tx.status === 'BUYER_CONFIRMED' ? 'green' : tx.status === 'FAILED' ? 'red' : 'blue'}
                                    variant="light"
                                    size="xs"
                                  >
                                    {tx.status === 'BUYER_CONFIRMED' ? 'BUYER CONFIRMED' : tx.status}
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

                  <Card withBorder p="sm" radius="md">
                    <Group justify="space-between" mb="md">
                      <Title order={3}>Seller Payouts Sent</Title>
                      <Badge color="green" variant="light">
                        Rs. {summary?.totalSellerPayoutSent ?? 0}
                      </Badge>
                    </Group>
                    {completedPayouts.length === 0 ? (
                      <Center p="md">
                        <Text c="dimmed">No seller payouts have been marked paid yet.</Text>
                      </Center>
                    ) : (
                      <ScrollArea h={300}>
                        <Table verticalSpacing="sm" highlightOnHover>
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th>Book</Table.Th>
                              <Table.Th>Seller</Table.Th>
                              <Table.Th>eSewa</Table.Th>
                              <Table.Th>Amount Sent</Table.Th>
                              <Table.Th>Commission Kept</Table.Th>
                              <Table.Th>Paid Date</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {completedPayouts.map((tx) => (
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
                                    <Text size="xs" fw={500}>
                                      {tx.book.name}
                                    </Text>
                                  </Group>
                                </Table.Td>
                                <Table.Td>
                                  <div>
                                    <Text size="xs">{tx.seller.name}</Text>
                                    <Text size="xs" c="dimmed">
                                      {tx.seller.email}
                                    </Text>
                                  </div>
                                </Table.Td>
                                <Table.Td>
                                  <Text size="xs">
                                    {tx.offer.sellerEsewaNumber || "Not provided"}
                                  </Text>
                                </Table.Td>
                                <Table.Td>
                                  <Text size="xs" fw={700} c="green">
                                    Rs. {tx.sellerAmount}
                                  </Text>
                                </Table.Td>
                                <Table.Td>
                                  <Text size="xs" fw={700} c="orange">
                                    Rs. {tx.commissionAmount}
                                  </Text>
                                </Table.Td>
                                <Table.Td>
                                  <Text size="xs">
                                    {new Date(tx.updatedAt).toLocaleDateString()}
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
