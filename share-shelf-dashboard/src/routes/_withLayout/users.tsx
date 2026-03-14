import { createFileRoute } from '@tanstack/react-router'
import {
  Title,
  Text,
  Paper,
  Group,
  Stack,
  Table,
  Badge,
  Avatar,
  Loader,
  Center,
  TextInput,
  Pagination,
  Button,
  Drawer,
  SimpleGrid,
  Box,
  Divider,
  ScrollArea,
} from '@mantine/core'
import { useDisclosure, useDebouncedValue } from '@mantine/hooks'
import {
  IconSearch,
  IconBook,
  IconMessageCircle,
  IconCoin,
  IconExternalLink,
  IconChevronRight,
  IconActivity,
} from '@tabler/icons-react'
import { useState } from 'react'
import { useGetUsers, useGetUserDetails } from './users/-queries'

export const Route = createFileRoute('/_withLayout/users')({
  component: UsersManagement,
})

function UsersManagement() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 300)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [opened, { open, close }] = useDisclosure(false)

  const { data, isLoading } = useGetUsers(page, 10, debouncedSearch)
  const { data: userDetails, isLoading: isLoadingDetails } = useGetUserDetails(selectedUserId)

  const handleRowClick = (userId: string) => {
    setSelectedUserId(userId)
    open()
  }

  const rows = data?.data.map((user) => (
    <Table.Tr
      key={user.id}
      onClick={() => handleRowClick(user.id)}
      style={{ cursor: 'pointer' }}
    >
      <Table.Td>
        <Group gap="sm">
          <Avatar src={user.avatar} radius="xl" size={30} />
          <div>
            <Text size="sm" fw={500}>{user.name}</Text>
            <Text size="xs" c="dimmed">{user.email}</Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge color={user.isVerified ? 'blue' : 'gray'} variant="light">
          {user.isVerified ? 'Verified' : 'Unverified'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{user._count.userBookStatuses} Books</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{user._count.posts} Posts</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{new Date(user.createdAt).toLocaleDateString()}</Text>
      </Table.Td>
      <Table.Td>
        <IconChevronRight size={16} color="gray" />
      </Table.Td>
    </Table.Tr>
  ))

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={1} fw={800} style={{ letterSpacing: '-0.02em' }}>
            User Management
          </Title>
          <Text c="dimmed" mt={4}>
            View and manage all users registered on the platform.
          </Text>
        </div>
      </Group>

      <Paper withBorder p="md" radius="md" shadow="xs">
        <Stack gap="md">
          <TextInput
            placeholder="Search by name or email..."
            leftSection={<IconSearch size={16} stroke={1.5} />}
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value)
              setPage(1)
            }}
            size="md"
            radius="md"
          />

          <Box pos="relative">
            {isLoading && (
              <Center p="xl">
                <Loader size="lg" />
              </Center>
            )}

            {!isLoading && data && (
              <>
                <ScrollArea h={500}>
                  <Table verticalSpacing="sm" highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>User</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Library</Table.Th>
                        <Table.Th>Activity</Table.Th>
                        <Table.Th>Joined</Table.Th>
                        <Table.Th />
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{rows}</Table.Tbody>
                  </Table>
                </ScrollArea>

                <Divider mt="md" />

                <Group justify="space-between" mt="md">
                  <Text size="sm" c="dimmed">
                    Showing {data.data.length} of {data.meta.total} users
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
          </Box>
        </Stack>
      </Paper>

      <Drawer
        opened={opened}
        onClose={close}
        title={<Text fw={700} size="lg">User Statistics</Text>}
        position="right"
        size="md"
        padding="xl"
      >
        {isLoadingDetails && (
          <Center h="100%">
            <Loader size="lg" />
          </Center>
        )}

        {!isLoadingDetails && userDetails && (
          <Stack gap="xl">
            <Group>
              <Avatar src={userDetails.user.avatar} size={70} radius="xl" />
              <div>
                <Title order={3}>{userDetails.user.name}</Title>
                <Text c="dimmed">{userDetails.user.email}</Text>
                <Badge mt={5} color={userDetails.user.isVerified ? 'green' : 'gray'}>
                  {userDetails.user.isVerified ? 'Verified Member' : 'Guest'}
                </Badge>
              </div>
            </Group>

            <SimpleGrid cols={2} spacing="md">
              <StatCard
                title="Total Revenue"
                value={`Rs. ${userDetails.stats.payments.totalAmount}`}
                icon={IconCoin}
                color="teal"
              />
              <StatCard
                title="Books"
                value={userDetails.user._count.userBookStatuses}
                icon={IconBook}
                color="blue"
              />
              <StatCard
                title="Posts"
                value={userDetails.user._count.posts}
                icon={IconMessageCircle}
                color="orange"
              />
              <StatCard
                title="Payments"
                value={userDetails.stats.payments.successCount}
                icon={IconActivity}
                color="grape"
              />
            </SimpleGrid>

            <Box>
              <Text fw={700} mb="md">Library Snapshot</Text>
              <Stack gap="xs">
                {userDetails.stats.bookStatuses.map((item) => (
                  <Box key={item.status}>
                    <Group justify="space-between" mb={2}>
                      <Text size="xs" fw={500} style={{ textTransform: 'capitalize' }}>
                        {item.status.replace(/_/g, ' ').toLowerCase()}
                      </Text>
                      <Text size="xs" fw={700}>{item._count.status}</Text>
                    </Group>
                    <Box h={6} bg="gray.1" style={{ borderRadius: 3, overflow: 'hidden' }}>
                      <Box
                        h="100%"
                        bg="blue.5"
                        style={{ width: `${(item._count.status / (userDetails.user._count.userBookStatuses || 1)) * 100}%` }}
                      />
                    </Box>
                  </Box>
                ))}
                {userDetails.stats.bookStatuses.length === 0 && (
                  <Text size="sm" c="dimmed" fs="italic">No books in library yet.</Text>
                )}
              </Stack>
            </Box>

            <Box>
              <Text fw={700} mb="sm">Recent Payments</Text>
              <Stack gap="xs">
                {userDetails.stats.recentPayments.map((p) => (
                  <Paper key={p.id} withBorder p="xs" radius="sm">
                    <Group justify="space-between">
                      <div>
                        <Text size="sm" fw={600}>Rs. {p.total_amount}</Text>
                        <Text size="xs" c="dimmed">{new Date(p.createdAt).toLocaleDateString()}</Text>
                      </div>
                      <Badge size="xs" color={p.status === 'SUCCESS' ? 'green' : 'red'}>
                        {p.status}
                      </Badge>
                    </Group>
                  </Paper>
                ))}
                {userDetails.stats.recentPayments.length === 0 && (
                  <Text size="sm" c="dimmed" fs="italic">No payment history found.</Text>
                )}
              </Stack>
            </Box>

            <Button variant="light" fullWidth mt="xl" rightSection={<IconExternalLink size={14} />}>
              View Full Profile
            </Button>
          </Stack>
        )}
      </Drawer>
    </Stack>
  )
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between">
        <Text size="xs" c="dimmed" fw={700} style={{ textTransform: 'uppercase' }}>{title}</Text>
        <Box c={color}><Icon size={18} stroke={1.5} /></Box>
      </Group>
      <Text fw={700} size="lg" mt={5}>{value}</Text>
    </Paper>
  )
}
