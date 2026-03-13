import { createFileRoute } from '@tanstack/react-router'
import {
  TextInput,
  PasswordInput,
  Title,
  Text,
  Button,
  Stack,
  Divider,
  Anchor,
  Group,
  Checkbox,
} from '@mantine/core'
import { IconAt, IconLock } from '@tabler/icons-react'

export const Route = createFileRoute('/_auth/sign-in')({
  component: SignInRoute,
})

function SignInRoute() {
  return (
    <Stack gap="xl">
      <div>
        <Title
          order={2}
          fw={800}
          style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}
        >
          Welcome back
        </Title>
      </div>

      <Divider />

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
        />

        <Button
          fullWidth
          size="md"
          radius={10}
          mt="sm"
          style={{
            background: 'linear-gradient(135deg, #228be6 0%, #1971c2 100%)',
            boxShadow: '0 4px 14px rgba(34, 139, 230, 0.35)',
            transition: 'transform 150ms ease, box-shadow 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(34, 139, 230, 0.45)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(34, 139, 230, 0.35)'
          }}
        >
          Sign in
        </Button>
      </Stack>
    </Stack>
  )
}
