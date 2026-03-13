import { AppShell, Container } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

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
        <span style={{ fontWeight: 700 }}>Share Shelf Dashboard</span>
      </AppShell.Header>

      <AppShell.Navbar px="md" zIndex={101}>
        <span>Navigation</span>
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

