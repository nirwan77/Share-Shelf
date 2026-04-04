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
  TextInput,
  Pagination,
  Button,
  Modal,
  Box,
  Divider,
  ScrollArea,
  ActionIcon,
  Textarea,
  MultiSelect,
  Image,
  FileButton,
  rem,
  Select,
  Switch,
} from "@mantine/core";
import { useDisclosure, useDebouncedValue } from "@mantine/hooks";
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCalendar,
  IconUpload,
  IconPhoto,
  IconFilter,
  IconX,
} from "@tabler/icons-react";
import { useState, useEffect, useRef } from "react";
import { useForm } from "@mantine/form";
import { DateInput } from "@mantine/dates";
import "dayjs/locale/en";
import {
  useGetBooks,
  useCreateBook,
  useUpdateBook,
  useDeleteBook,
  useGetGenres,
  type Book,
} from "./books/-queries";
import { notifications } from "@mantine/notifications";
import { instance } from "@/lib/axios";

export const Route = createFileRoute("/_withLayout/books")({
  component: BooksManagement,
});

function BooksManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const resetRef = useRef<() => void>(null);

  // Filter state
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [genreFilter, setGenreFilter] = useState<string | null>(null);

  const { data, isLoading } = useGetBooks({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    genre: genreFilter || undefined,
  });
  const { data: genres } = useGetGenres();
  const createMutation = useCreateBook();
  const updateMutation = useUpdateBook();
  const deleteMutation = useDeleteBook();

  const hasActiveFilters = !!dateFrom || !!dateTo || !!genreFilter;

  const clearFilters = () => {
    setDateFrom(null);
    setDateTo(null);
    setGenreFilter(null);
    setPage(1);
  };

  const form = useForm({
    initialValues: {
      name: "",
      author: "",
      description: "",
      price: 0,
      image: "",
      releaseDate: new Date(),
      genres: [] as string[],
      isPopular: false,
      isFeatured: false,
    },
    validate: {
      name: (value) => (value.length < 2 ? "Name is too short" : null),
      author: (value) =>
        value.length < 2 ? "Author name is too short" : null,
      image: (value) =>
        value.length < 2 ? "Please upload a book cover image" : null,
    },
  });

  useEffect(() => {
    if (editingBook) {
      form.setValues({
        name: editingBook.name,
        author: editingBook.author,
        description: editingBook.description,
        price: editingBook.price,
        image: editingBook.image,
        releaseDate: new Date(editingBook.releaseDate),
        genres: editingBook.bookGenres.map((bg) => bg.genre.name),
        isPopular: editingBook.isPopular,
        isFeatured: editingBook.isFeatured,
      });
      setImagePreview(editingBook.image);
    } else {
      form.reset();
      setImagePreview(null);
    }
  }, [editingBook]);

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data: result } = await instance.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      form.setFieldValue("image", result.url);
      setImagePreview(result.url);
      notifications.show({
        title: "Uploaded",
        message: "Image uploaded successfully",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Upload Failed",
        message: "Could not upload image. Please try again.",
        color: "red",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (values: typeof form.values) => {
    if (editingBook) {
      updateMutation.mutate(
        { id: editingBook.id, ...values },
        {
          onSuccess: () => {
            notifications.show({
              title: "Success",
              message: "Book updated successfully",
            });
            close();
            setEditingBook(null);
            setImagePreview(null);
          },
        }
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          notifications.show({
            title: "Success",
            message: "Book added successfully",
          });
          close();
          setImagePreview(null);
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          notifications.show({
            title: "Success",
            message: "Book deleted successfully",
          });
        },
      });
    }
  };

  const rows = data?.data.map((book) => (
    <Table.Tr key={book.id}>
      <Table.Td>
        <Group gap="sm">
          <Image
            src={book.image}
            h={40}
            w={30}
            radius="xs"
            fallbackSrc="https://placehold.co/30x40?text=Book"
          />
          <div>
            <Text size="sm" fw={500}>
              {book.name}
            </Text>
            <Text size="xs" c="dimmed">
              {book.author}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap={4}>
          {book.bookGenres.slice(0, 2).map((bg) => (
            <Badge key={bg.genre.id} variant="outline" size="xs">
              {bg.genre.name}
            </Badge>
          ))}
          {book.bookGenres.length > 2 && (
            <Badge variant="outline" size="xs">
              +{book.bookGenres.length - 2}
            </Badge>
          )}
        </Group>
      </Table.Td>
      <Table.Td>
        <Stack gap={2}>
          <Text size="sm" fw={600} c={book.lowestPrice !== null ? "green" : "dimmed"}>
            {book.lowestPrice !== null ? `From Rs. ${book.lowestPrice}` : "No active offers"}
          </Text>
          <Text size="xs" c="dimmed">
            {book.sellCount} selling · {book.tradeCount} trading
          </Text>
        </Stack>
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {new Date(book.releaseDate).toLocaleDateString()}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Switch
            checked={book.isPopular}
            onChange={(e) =>
              updateMutation.mutate({
                id: book.id,
                isPopular: e.currentTarget.checked,
              })
            }
            size="xs"
            color="orange"
            label="Popular"
            disabled={updateMutation.isPending}
          />
          <Switch
            checked={book.isFeatured}
            onChange={(e) =>
              updateMutation.mutate({
                id: book.id,
                isFeatured: e.currentTarget.checked,
              })
            }
            size="xs"
            color="blue"
            label="Featured"
            disabled={updateMutation.isPending}
          />
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap="xs" justify="flex-end">
          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={() => {
              setEditingBook(book);
              open();
            }}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => handleDelete(book.id)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={1} fw={800} style={{ letterSpacing: "-0.02em" }}>
            Book Management
          </Title>
          <Text c="dimmed" mt={4}>
            Add, update, and manage the books catalog.
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={18} />}
          radius="md"
          size="md"
          onClick={() => {
            setEditingBook(null);
            setImagePreview(null);
            open();
          }}
        >
          Add New Book
        </Button>
      </Group>

      <Paper withBorder p="md" radius="md" shadow="xs">
        <Stack gap="md">
          <TextInput
            placeholder="Search by name, author, or description..."
            leftSection={<IconSearch size={16} stroke={1.5} />}
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setPage(1);
            }}
            size="md"
            radius="md"
          />

          {/* Filters Row */}
          <Group gap="sm" align="flex-end">
            <DateInput
              label="From Date"
              placeholder="Start date"
              valueFormat="YYYY-MM-DD"
              value={dateFrom ? new Date(dateFrom) : null}
              onChange={(val) => { setDateFrom(val ? new Date(val as any).toISOString() : null); setPage(1); }}
              leftSection={<IconCalendar size={16} />}
              clearable
              size="sm"
              radius="md"
              style={{ flex: 1 }}
            />
            <DateInput
              label="To Date"
              placeholder="End date"
              valueFormat="YYYY-MM-DD"
              value={dateTo ? new Date(dateTo) : null}
              onChange={(val) => { setDateTo(val ? new Date(val as any).toISOString() : null); setPage(1); }}
              leftSection={<IconCalendar size={16} />}
              clearable
              size="sm"
              radius="md"
              style={{ flex: 1 }}
            />
            <Select
              label="Genre"
              placeholder="All genres"
              data={genres?.map((g) => g.name) || []}
              value={genreFilter}
              onChange={(val) => { setGenreFilter(val); setPage(1); }}
              clearable
              searchable
              leftSection={<IconFilter size={16} />}
              size="sm"
              radius="md"
              style={{ flex: 1 }}
            />
            {hasActiveFilters && (
              <Button
                variant="subtle"
                color="gray"
                size="sm"
                leftSection={<IconX size={14} />}
                onClick={clearFilters}
              >
                Clear
              </Button>
            )}
          </Group>

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
                        <Table.Th>Book</Table.Th>
                        <Table.Th>Genres</Table.Th>
                        <Table.Th>Market Info</Table.Th>
                        <Table.Th>Release Date</Table.Th>
                        <Table.Th>Status Flags</Table.Th>
                        <Table.Th />
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{rows}</Table.Tbody>
                  </Table>
                </ScrollArea>

                <Divider mt="md" />

                <Group justify="space-between" mt="md">
                  <Text size="sm" c="dimmed">
                    Showing {data.data.length} of {data.meta.total} books
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

      <Modal
        opened={opened}
        onClose={() => {
          close();
          setEditingBook(null);
          setImagePreview(null);
        }}
        title={editingBook ? "Edit Book" : "Add New Book"}
        size="lg"
        radius="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Book Name"
              placeholder="Enter book name"
              required
              {...form.getInputProps("name")}
            />
            <TextInput
              label="Author"
              placeholder="Enter author name"
              required
              {...form.getInputProps("author")}
            />
            <Textarea
              label="Description"
              placeholder="Enter book description"
              minRows={3}
              {...form.getInputProps("description")}
            />
            <Group grow>
              <DateInput
                label="Release Date"
                placeholder="Pick date"
                required
                leftSection={<IconCalendar size={16} />}
                {...form.getInputProps("releaseDate")}
              />
            </Group>

            {/* Image Upload with Preview */}
            <Box>
              <Text size="sm" fw={500} mb={4}>
                Book Cover Image <span style={{ color: "var(--mantine-color-red-6)" }}>*</span>
              </Text>

              {imagePreview ? (
                <Box pos="relative" w={160} mx="auto">
                  <Image
                    src={imagePreview}
                    h={220}
                    w={160}
                    radius="md"
                    fit="cover"
                    fallbackSrc="https://placehold.co/160x220?text=Book"
                    style={{ border: "1px solid var(--mantine-color-default-border)" }}
                  />
                  <Group justify="center" mt="xs" gap="xs">
                    <FileButton
                      resetRef={resetRef}
                      onChange={handleImageUpload}
                      accept="image/png,image/jpeg,image/webp"
                    >
                      {(props) => (
                        <Button
                          {...props}
                          variant="light"
                          size="xs"
                          leftSection={<IconUpload size={14} />}
                          loading={isUploading}
                        >
                          Change
                        </Button>
                      )}
                    </FileButton>
                  </Group>
                </Box>
              ) : (
                <FileButton
                  resetRef={resetRef}
                  onChange={handleImageUpload}
                  accept="image/png,image/jpeg,image/webp"
                >
                  {(props) => (
                    <Paper
                      {...props}
                      component="button"
                      type="button"
                      withBorder
                      p="xl"
                      radius="md"
                      style={{
                        cursor: "pointer",
                        borderStyle: "dashed",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: rem(160),
                        width: "100%",
                        background: "transparent",
                      }}
                    >
                      {isUploading ? (
                        <Loader size="md" />
                      ) : (
                        <>
                          <IconPhoto
                            size={40}
                            stroke={1.2}
                            color="var(--mantine-color-dimmed)"
                          />
                          <Text size="sm" c="dimmed" mt="sm" ta="center">
                            Click to upload a book cover image
                          </Text>
                          <Text size="xs" c="dimmed" mt={4}>
                            PNG, JPG or WebP
                          </Text>
                        </>
                      )}
                    </Paper>
                  )}
                </FileButton>
              )}

              {form.errors.image && (
                <Text size="xs" c="red" mt={4}>
                  {form.errors.image}
                </Text>
              )}
            </Box>

            <MultiSelect
              label="Genres"
              placeholder="Select genres"
              data={[
                "Fiction",
                "Non-fiction",
                "Fantasy",
                "Mystery",
                "Sci-Fi",
                "Biography",
                "Romance",
                "History",
              ]}
              searchable
              {...form.getInputProps("genres")}
            />
            <Group>
              <Switch
                label="Mark as Popular"
                {...form.getInputProps("isPopular", { type: "checkbox" })}
              />
              <Switch
                label="Mark as Featured"
                {...form.getInputProps("isFeatured", { type: "checkbox" })}
              />
            </Group>

            <Group justify="flex-end" mt="xl">
              <Button
                variant="light"
                onClick={() => {
                  close();
                  setEditingBook(null);
                  setImagePreview(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingBook ? "Save Changes" : "Add Book"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
