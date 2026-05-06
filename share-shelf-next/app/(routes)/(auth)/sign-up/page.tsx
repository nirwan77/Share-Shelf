"use client";

import Input from "@/app/Components/Input";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useSignUp } from "./data";

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().trim().min(7, "Phone number is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  acceptPolicies: z.boolean().refine((value) => value, {
    message: "You must accept the Terms and Privacy Policy",
  }),
});

type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useSignUp();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      acceptPolicies: false,
    },
  });

  const onSubmit = async (data: SignUpForm) => {
    await mutateAsync(
      {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        acceptTerms: data.acceptPolicies,
        acceptPrivacy: data.acceptPolicies,
      },
      {
        onSuccess: () => {
          toast("Account created successfully");
          router.push(`/verify?email=${data.email}`);
        },
        onError: (err: any) => {
          toast(err.response?.data?.message || "Something went wrong");
        },
      },
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <header className="flex flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-8">
        <Link href="/" className="text-2xl font-bold tracking-tight text-white">
          Share Shelf
        </Link>
        <div className="text-sm text-zinc-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#ff7a00] hover:text-[#ffb36d]"
          >
            Log In
          </Link>
        </div>
      </header>

      <main className="flex grow flex-col items-center justify-center px-4 py-10 text-center">
        <div className="app-card w-full max-w-sm p-7 sm:p-10">
          <h1 className="heading-3 mb-4 font-bold">Sign Up</h1>
          <p className="mb-8 text-sm leading-6 text-zinc-400">
            Create an account to discover, share, and connect with the
            community.
          </p>

          <form
            className="flex flex-col space-y-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Input
              {...register("name")}
              placeholder="Name"
              error={errors.name?.message}
            />
            <Input
              {...register("email")}
              placeholder="Email"
              error={errors.email?.message}
            />
            <Input
              {...register("phone")}
              type="tel"
              placeholder="Phone number"
              error={errors.phone?.message}
            />
            <Input
              {...register("password")}
              type="password"
              placeholder="Password"
              error={errors.password?.message}
            />

            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4 text-left">
              <Controller
                name="acceptPolicies"
                control={control}
                render={({ field }) => (
                  <label className="flex items-start gap-3 text-sm leading-6 text-zinc-300">
                    <Checkbox
                      checked={field.value}
                      className="mt-1"
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                    <span>
                      I agree to Share Shelf&apos;s{" "}
                      <Link
                        href="/terms-and-conditions"
                        className="font-semibold text-[#ff7a00] hover:text-[#ffb36d]"
                      >
                        Terms and Conditions
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy-policy"
                        className="font-semibold text-[#ff7a00] hover:text-[#ffb36d]"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>
                )}
              />
              {errors.acceptPolicies && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.acceptPolicies.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-[#ff7a00] py-3 font-bold text-black transition-all hover:-translate-y-0.5 hover:bg-[#ff922f] hover:shadow-[0_14px_36px_rgba(255,122,0,0.25)] disabled:opacity-50"
            >
              {isPending ? "Signing up..." : "Sign up"}
            </button>
          </form>
        </div>
      </main>

      <footer className="border-t border-white/10 py-4 text-center text-sm text-zinc-500">
        &copy; 2025 Share Shelf
      </footer>
    </div>
  );
}
