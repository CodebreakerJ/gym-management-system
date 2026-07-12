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

      navigate(redirectPath, {
        replace: true,
      });
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Unable to login. Please check your credentials.";

      setApiError(message);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8f7ff]">
      {/* Background grid */}
      <div className="grid-pattern absolute inset-0" />

      {/* Decorative gradient circles */}
      <motion.div
        className="absolute -left-28 -top-24 h-96 w-96 rounded-full bg-violet-300/35 blur-[110px]"
        animate={{
          x: [0, 45, 0],
          y: [0, 35, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute -bottom-32 -right-24 h-[430px] w-[430px] rounded-full bg-cyan-200/40 blur-[120px]"
        animate={{
          x: [0, -45, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute left-[42%] top-[12%] h-64 w-64 rounded-full bg-fuchsia-200/25 blur-[100px]"
        animate={{
          scale: [1, 1.12, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
        {/* Left section */}
        <section className="hidden items-center justify-center px-12 py-10 lg:flex">
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
              duration: 0.7,
            }}
            className="max-w-xl"
          >
            <div className="mb-9 flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-xl shadow-violet-500/25">
                <Dumbbell
                  size={28}
                  className="text-white"
                />
              </div>

              <div>
                <p className="text-2xl font-bold tracking-tight text-slate-900">
                  GymFlow
                </p>

                <p className="text-sm text-slate-500">
                  Gym management reimagined
                </p>
              </div>
            </div>

            <h1 className="text-5xl font-semibold leading-[1.08] tracking-[-0.04em] text-slate-900 xl:text-6xl">
              Run your gym with

              <span className="mt-2 block bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
                clarity and confidence.
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-lg leading-8 text-slate-600">
              Manage members, attendance, renewals,
              revenue and reports from one secure,
              beautifully organised dashboard.
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

        {/* Login section */}
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
            className="w-full max-w-md rounded-[2rem] border border-violet-100 bg-white/95 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur-xl sm:p-8"
          >
            {/* Mobile logo */}
            <div className="mb-8 lg:hidden">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-500/20">
                <Dumbbell
                  size={24}
                  className="text-white"
                />
              </div>

              <p className="text-xl font-bold text-slate-900">
                GymFlow
              </p>
            </div>

            <p className="text-sm font-semibold text-violet-600">
              Welcome back
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              Sign in to continue
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Enter your gym owner or staff credentials.
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
                className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600"
              >
                {apiError}
              </motion.div>
            )}

            <form
              onSubmit={handleSubmit(handleLogin)}
              className="mt-8 space-y-5"
            >
              {/* Username */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Username
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-violet-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-100">
                  <UserRound
                    size={18}
                    className="text-slate-400"
                  />

                  <input
                    {...register("username", {
                      required:
                        "Username is required.",
                    })}
                    type="text"
                    placeholder="Enter username"
                    autoComplete="username"
                    className="h-13 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>

                {errors.username && (
                  <p className="mt-2 text-xs font-medium text-rose-500">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-violet-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-100">
                  <LockKeyhole
                    size={18}
                    className="text-slate-400"
                  />

                  <input
                    {...register("password", {
                      required:
                        "Password is required.",
                    })}
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter password"
                    autoComplete="current-password"
                    className="h-13 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current
                      )
                    }
                    className="rounded-lg p-1 text-slate-400 transition hover:bg-violet-50 hover:text-violet-600"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-2 text-xs font-medium text-rose-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <motion.button
                type="submit"
                whileHover={{
                  y: -2,
                }}
                whileTap={{
                  scale: 0.985,
                }}
                disabled={isSubmitting}
                className="relative flex h-13 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 text-sm font-semibold text-white shadow-xl shadow-violet-500/25 transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="relative z-10">
                  {isSubmitting
                    ? "Signing in..."
                    : "Sign in securely"}
                </span>

                <motion.span
                  className="absolute inset-y-0 w-20 rotate-12 bg-white/25 blur-xl"
                  animate={{
                    x: [-150, 520],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    repeatDelay: 1.5,
                  }}
                />
              </motion.button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck
                size={14}
                className="text-violet-500"
              />

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
      transition={{
        delay,
      }}
      whileHover={{
        y: -5,
        scale: 1.02,
      }}
      className="rounded-2xl border border-violet-100 bg-white/90 p-4 shadow-lg shadow-violet-950/[0.05] backdrop-blur-lg"
    >
      <p className="text-xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {label}
      </p>
    </motion.div>
  );
}

export default LoginPage;