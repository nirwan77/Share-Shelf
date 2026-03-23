import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  TextInput,
  PasswordInput,
  Title,
  Button,
  Stack,
  Divider,
} from "@mantine/core";
import { IconAt, IconLock } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useAuth } from "../../contexts/AuthContext";
import { useLogin } from "./-queries";

export const Route = createFileRoute("/_auth/sign-in")({
  component: SignInRoute,
});

function SignInRoute() {
  const navigate = useNavigate();
  const { setAuthData } = useAuth();
  const { mutateAsync, isPending } = useLogin();

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length < 6 ? "Password must be at least 6 characters" : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await mutateAsync(values, {
        onSuccess: (response) => {
          setAuthData({
            id: "admin",
            accessToken: response.access_token,
            onboardedAt: new Date().toISOString(),
          });

          notifications.show({
            title: "Success",
            message: "Successfully logged in.",
            color: "green",
          });

          navigate({ to: "/" });
        },
        onError: (error: any) => {
          notifications.show({
            title: "Login Failed",
            message: error.response?.data?.message || "Something went wrong",
            color: "red",
          });
        },
      });
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <Stack gap="xl">
      <div>
        <Title
          order={2}
          fw={800}
          style={{ fontSize: "1.75rem", letterSpacing: "-0.02em" }}
        >
          Welcome back
        </Title>
      </div>

      <Divider />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Email address"
            placeholder="you@shareshelf.com"
            required
            size="md"
            leftSection={<IconAt size={16} stroke={1.5} />}
            styles={{
              input: {
                borderRadius: 10,
              },
            }}
            {...form.getInputProps("email")}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            size="md"
            leftSection={<IconLock size={16} stroke={1.5} />}
            styles={{
              input: {
                borderRadius: 10,
              },
            }}
            {...form.getInputProps("password")}
          />

          <Button
            type="submit"
            fullWidth
            size="md"
            radius={10}
            mt="sm"
            loading={isPending}
            style={{
              background: "linear-gradient(135deg, #228be6 0%, #1971c2 100%)",
              boxShadow: "0 4px 14px rgba(34, 139, 230, 0.35)",
              transition: "transform 150ms ease, box-shadow 150ms ease",
            }}
            onMouseEnter={(e) => {
              if (isPending) return;
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(34, 139, 230, 0.45)";
            }}
            onMouseLeave={(e) => {
              if (isPending) return;
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 14px rgba(34, 139, 230, 0.35)";
            }}
          >
            Sign in
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
