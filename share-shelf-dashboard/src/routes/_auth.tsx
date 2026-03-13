import { Box, Flex, Image } from "@mantine/core";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    if (context.isLoggedIn) {
      throw redirect({
        to: "/",
      });
    }
  },
});

function RouteComponent() {
  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      style={{ minHeight: "100vh" }}
    >
      <Box
        visibleFrom="md"
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Image
          src="/heroImage.jpg"
          alt="Share Shelf"
          fit="cover"
          h="100%"
          w="100%"
          style={{
            position: "absolute",
            inset: 0,
          }}
        />
      </Box>

      <Flex
        flex={1}
        justify="center"
        align="center"
        p={{ base: "md", md: "xl" }}
      >
        <Box w={{ base: "100%", md: "420px" }}>
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}

