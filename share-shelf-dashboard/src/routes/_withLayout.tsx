import {
  AppShell,
  Container,
  Stack,
  NavLink,
  Group,
  Button,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  createFileRoute,
  Outlet,
  redirect,
  Link,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import {
  IconLayoutDashboard,
  IconUsers,
  IconLogout,
} from "@tabler/icons-react";
import { useAuth } from "../contexts/AuthContext";

export const Route = createFileRoute("/_withLayout")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!context.isLoggedIn) {
      throw redirect({
        to: "/sign-in",
      });
    }
  },
});

function RouteComponent() {
  const [opened] = useDisclosure();
  const location = useLocation();
  const { setAuthData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setAuthData(null);
    navigate({ to: "/sign-in" });
  };

  return (
    <AppShell
      header={{ height: { base: 60, md: 64 } }}
      withBorder={false}
      navbar={{
        width: 300,
        breakpoint: "md",
        collapsed: { mobile: !opened },
      }}
      padding={0}
    >
      <AppShell.Header p="md">
        <Group justify="space-between" h="100%">
          <span style={{ fontWeight: 700 }}>Share Shelf Dashboard</span>
          <Button
            variant="light"
            color="red"
            size="xs"
            leftSection={<IconLogout size={16} />}
            onClick={handleLogout}
          >
            Log out
          </Button>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar px="md" py="xl" zIndex={101}>
        <Stack gap="xs">
          <NavLink
            component={Link}
            to="/"
            label="Dashboard"
            leftSection={<IconLayoutDashboard size={18} stroke={1.5} />}
            active={location.pathname === "/"}
          />
          <NavLink
            component={Link}
            to="/users"
            label="Users"
            leftSection={<IconUsers size={18} stroke={1.5} />}
            active={location.pathname.startsWith("/users")}
          />
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Container
          px={{ base: "md", sm: "md", md: "3rem" }}
          pt={{ base: "1.75rem", sm: "1.75rem", md: "2rem" }}
          pb={152}
          maw={{ sm: "48rem", md: "75rem", lg: "84.375rem" }}
        >
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
