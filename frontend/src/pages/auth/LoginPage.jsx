import { useState } from "react";

import {
  Dumbbell,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { motion } from "motion/react";

import { useForm } from "react-hook-form";

import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { loginUser } from "../../services/authService";

import { isAuthenticated } from "../../utils/authStorage";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] =
    useState(false);

  const [apiError, setApiError] =
    useState("");

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  if (isAuthenticated()) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  async function handleLogin(formData) {
    setApiError("");

    try {
      await loginUser(formData);

      const redirectPath =
        location.state?.from?.pathname ||
        "/dashboard";

      navigate(
        redirectPath,
        { replace: true }
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        "Unable to login. Please check your credentials.";

      setApiError(errorMessage);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950">
      <div className="grid-pattern absolute inset-0 opacity-60" />

      <motion.div
        className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-violet-600/25 blur-[110px]"
        animate={{
          x: [0, 60, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px]"
        animate={{
          x: [0, -50, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
        <section className="hidden items-center justify-center p-12 lg:flex">
          <motion.div
            initial={{
              opacity: 0,
              x: -40,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.75,
            }}
            className="max-w-xl"
          >
            <div className="mb-8 flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-2xl shadow-violet-500/30">
                <Dumbbell
                  size={29}
                  className="text-white"
                />
              </div>

              <div>
                <p className="text-2xl font-bold tracking-tight text-white">
                  GymFlow
                </p>

                <p className="text-sm text-zinc-500">
                  Gym management reimagined
                </p>
              </div>
            </div>

            <h1 className="text-5xl font-semibold leading-[1.08] tracking-[-0.04em] text-white xl:text-6xl">
              Run your gym with

              <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                clarity and confidence.
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-lg leading-8 text-zinc-400">
              Manage members, attendance,
              renewals, revenue and reports
              from one secure dashboard.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4">
              <FeatureCard
                value="1K+"
                label="Members ready"
                delay={0.25}
              />

              <FeatureCard
                value="24/7"
                label="Secure access"
                delay={0.35}
              />

              <FeatureCard
                value="100%"
                label="Gym isolation"
                delay={0.45}
              />
            </div>
          </motion.div>
        </section>

        <section className="flex items-center justify-center p-5 sm:p-10">
          <motion.div
            initial={{
              opacity: 0,
              y: 24,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="glass-panel w-full max-w-md rounded-[2rem] p-6 shadow-2xl shadow-black/30 sm:p-8"
          >
            <div className="mb-8 lg:hidden">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400">
                <Dumbbell
                  size={24}
                  className="text-white"
                />
              </div>

              <p className="text-xl font-bold text-white">
                GymFlow
              </p>
            </div>

            <p className="text-sm font-medium text-violet-300">
              Welcome back
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Sign in to continue
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Enter your gym owner or staff
              credentials.
            </p>

            {apiError && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
              >
                {apiError}
              </motion.div>
            )}

            <form
              onSubmit={handleSubmit(handleLogin)}
              className="mt-8 space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Username
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 transition focus-within:border-violet-400/50 focus-within:ring-4 focus-within:ring-violet-500/10">
                  <UserRound
                    size={18}
                    className="text-zinc-500"
                  />

                  <input
                    {...register(
                      "username",
                      {
                        required:
                          "Username is required.",
                      }
                    )}
                    type="text"
                    placeholder="Enter username"
                    autoComplete="username"
                    className="h-13 w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                  />
                </div>

                {errors.username && (
                  <p className="mt-2 text-xs text-rose-300">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Password
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 transition focus-within:border-violet-400/50 focus-within:ring-4 focus-within:ring-violet-500/10">
                  <LockKeyhole
                    size={18}
                    className="text-zinc-500"
                  />

                  <input
                    {...register(
                      "password",
                      {
                        required:
                          "Password is required.",
                      }
                    )}
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter password"
                    autoComplete="current-password"
                    className="h-13 w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (currentValue) =>
                          !currentValue
                      )
                    }
                    className="text-zinc-500 transition hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-2 text-xs text-rose-300">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <motion.button
                type="submit"
                whileHover={{
                  y: -2,
                }}
                whileTap={{
                  scale: 0.985,
                }}
                disabled={isSubmitting}
                className="relative flex h-13 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 text-sm font-semibold text-white shadow-xl shadow-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="relative z-10">
                  {isSubmitting
                    ? "Signing in..."
                    : "Sign in securely"}
                </span>

                <motion.span
                  className="absolute inset-y-0 w-20 rotate-12 bg-white/20 blur-xl"
                  animate={{
                    x: [-140, 500],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    repeatDelay: 1.5,
                  }}
                />
              </motion.button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-600">
              <ShieldCheck size={14} />

              <span>
                Secure JWT protected access
              </span>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

function FeatureCard({
  value,
  label,
  delay,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{ delay }}
      whileHover={{
        y: -4,
      }}
      className="glass-panel rounded-2xl p-4"
    >
      <p className="text-xl font-bold text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-500">
        {label}
      </p>
    </motion.div>
  );
}

export default LoginPage;