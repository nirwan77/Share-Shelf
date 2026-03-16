import { createFileRoute } from "@tanstack/react-router";
import {
  Title,
  Text,
  SimpleGrid,
  Paper,
  Group,
  Stack,
  Table,
  Badge,
  Avatar,
  Loader,
  Center,
  Box,
} from "@mantine/core";
import {
  IconUsers,
  IconBook,
  IconTags,
  IconMessageCircle,
  IconCoin,
} from "@tabler/icons-react";
import { useGetDashboardStats } from "./-queries";

export const Route = createFileRoute("/_withLayout/")({
  component: DashboardHome,
});

function DashboardHome() {
  const { data, isLoading, isError } = useGetDashboardStats();

  if (isLoading) {
    return (
      <Center h="60vh">
        <Stack align="center" gap="md">
          <Loader size="xl" variant="bars" />
          <Text c="dimmed" fw={500}>
            Loading your dashboard...
          </Text>
        </Stack>
      </Center>
    );
  }

  if (isError || !data) {
    return (
      <Center h="60vh">
        <Paper p="xl" withBorder radius="md" style={{ textAlign: "center" }}>
          <Text c="red" fw={700} size="lg">
            Error loading statistics
          </Text>
          <Text c="dimmed">
            Please make sure the backend is running and try again.
          </Text>
        </Paper>
      </Center>
    );
  }

  const stats = [
    {
      title: "Total Users",
      value: data.overview.totalUsers,
      icon: IconUsers,
      color: "blue",
    },
    {
      title: "Total Books",
      value: data.overview.totalBooks,
      icon: IconBook,
      color: "green",
    },
    {
      title: "Total Genres",
      value: data.overview.totalGenres,
      icon: IconTags,
      color: "grape",
    },
    {
      title: "Community Posts",
      value: data.overview.totalPosts,
      icon: IconMessageCircle,
      color: "orange",
    },
    {
      title: "Total Deposit",
      value: `Rs. ${data.overview.totalRevenue.toLocaleString()}`,
      icon: IconCoin,
      color: "teal",
    },
  ];

  const statCards = stats.map((stat) => (
    <Paper withBorder p="md" radius="md" key={stat.title} shadow="sm">
      <Group justify="space-between">
        <Text
          size="xs"
          c="dimmed"
          fw={700}
          style={{ textTransform: "uppercase" }}
        >
          {stat.title}
        </Text>
        <Box c={stat.color}>
          <stat.icon size={22} stroke={1.5} />
        </Box>
      </Group>

      <Group align="flex-end" gap="xs" mt={10}>
        <Text fw={700} size="xl">
          {stat.value}
        </Text>
      </Group>
    </Paper>
  ));

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={1} fw={800} style={{ letterSpacing: "-0.02em" }}>
            Dashboard Overview
          </Title>
          {/* <Text c="dimmed" mt={4}>
            Welcome back! Here's what's happening on Share Shelf today.
          </Text> */}
        </div>
      </Group>

      <SimpleGrid cols={{ base: 1, xs: 2, md: 3, lg: 5 }} spacing="md">
        {statCards}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl">
        <Paper withBorder p="lg" radius="md" shadow="sm">
          <Group mb="lg" justify="space-between">
            <Group>
              <Box c="blue">
                <IconUsers size={24} />
              </Box>
              <Title order={3}>Recent Users</Title>
            </Group>
            <Badge variant="light">Last 5 registrations</Badge>
          </Group>
          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>User</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Joined</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.recent.users.map((user) => (
                <Table.Tr key={user.id}>
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar src={user.avatar} size={26} radius="xl" />
                      <Text size="sm" fw={500}>
                        {user.name}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {user.email}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>

        <Paper withBorder p="lg" radius="md" shadow="sm">
          <Group mb="lg" justify="space-between">
            <Group>
              <Box c="green">
                <IconBook size={24} />
              </Box>
              <Title order={3}>Recent Books</Title>
            </Group>
            <Badge variant="light" color="green">
              Newly Added
            </Badge>
          </Group>
          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Book</Table.Th>
                <Table.Th>Author</Table.Th>
                <Table.Th>Price</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.recent.books.map((book) => (
                <Table.Tr key={book.id}>
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar
                        src={book.image}
                        size={26}
                        radius="sm"
                        variant="outline"
                      />
                      <Text size="sm" fw={500}>
                        {book.name}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {book.author}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={600}>
                      Rs. {book.price}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>

        {/* Recent Payments */}
        <Paper withBorder p="lg" radius="md" shadow="sm">
          <Group mb="lg" justify="space-between">
            <Group>
              <Box c="teal">
                <IconCoin size={24} />
              </Box>
              <Title order={3}>Recent Payments</Title>
            </Group>
            <Badge variant="light" color="teal">
              Success
            </Badge>
          </Group>
          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>User</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Date</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.recent.payments.map((payment) => (
                <Table.Tr key={payment.id}>
                  <Table.Td>
                    <Text size="sm" fw={500}>
                      {payment.user?.name || "Unknown"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">Rs. {payment.total_amount}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={payment.status === "SUCCESS" ? "green" : "red"}
                      size="sm"
                      variant="outline"
                    >
                      {payment.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>

        {/* Book Status Snapshot */}
        {/* <Paper withBorder p="lg" radius="md" shadow="sm">
          <Group mb="lg" justify="space-between">
            <Group>
              <Box c="grape">
                <IconActivity size={24} />
              </Box>
              <Title order={3}>Book Status Snapshot</Title>
            </Group>
            <Badge variant="light" color="grape">User Engagement</Badge>
          </Group>
          <Stack gap="md">
            {data.booksByStatus.length > 0 ? (
              data.booksByStatus.map((item) => (
                <Box key={item.status}>
                  <Group justify="space-between" mb={4}>
                    <Text size="sm" fw={500} style={{ textTransform: 'capitalize' }}>
                      {item.status.replace(/_/g, ' ').toLowerCase()}
                    </Text>
                    <Text size="sm" fw={700}>{item._count.status} books</Text>
                  </Group>
                  <Box
                    h={8}
                    bg="gray.1"
                    style={{ borderRadius: 4, overflow: 'hidden' }}
                  >
                    <Box
                      h="100%"
                      bg="grape.5"
                      style={{
                        width: `${(item._count.status / (data.overview.totalBooks || 1)) * 100}%`,
                        transition: 'width 1s ease'
                      }}
                    />
                  </Box>
                </Box>
              ))
            ) : (
              <Center p="xl">
                <Text c="dimmed">No book status data available yet.</Text>
              </Center>
            )}
          </Stack>
        </Paper> */}
      </SimpleGrid>
    </Stack>
  );
}
