import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  ChevronDown,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

import MemberTable from "../../components/members/MemberTable";

import {
  deleteMember,
  getMembers,
} from "../../services/memberService";

function MembersPage() {
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(20);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchInput]);

  const membersQuery = useQuery({
    queryKey: [
      "members",
      search,
      page,
      pageSize,
    ],

    queryFn: () =>
      getMembers({
        search,
        page,
        page_size: pageSize,
        ordering: "-id",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMember,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["members"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard-summary"],
      });
    },
  });

  const members =
    membersQuery.data?.results || [];

  const totalMembers =
    membersQuery.data?.count || 0;

  const totalPages = Math.max(
    1,
    Math.ceil(totalMembers / pageSize)
  );

  function handleEdit(member) {
    console.log("Edit member:", member);
  }

  function handleRenew(member) {
    console.log("Renew member:", member);
  }

  function handleDelete(member) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${member.name}? You can restore this member later.`
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(member.id);
  }

  return (
    <div className="mx-auto max-w-[1600px]">
      {/* Page heading */}
      <motion.section
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"
      >
        <div>
          <p className="text-sm font-semibold text-violet-600">
            Member management
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Members
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Search, update, renew and manage
            all gym members.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <motion.button
            type="button"
            whileHover={{
              y: -2,
            }}
            whileTap={{
              scale: 0.98,
            }}
            className="flex items-center gap-2 rounded-2xl border border-violet-100 bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 hover:shadow-md"
          >
            <RotateCcw size={17} />

            Deleted members
          </motion.button>

          <motion.button
            type="button"
            whileHover={{
              y: -3,
            }}
            whileTap={{
              scale: 0.97,
            }}
            className="relative flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-violet-500/25"
          >
            <span className="absolute inset-0 bg-white/0 transition hover:bg-white/10" />

            <Plus
              size={18}
              className="relative"
            />

            <span className="relative">
              Add new member
            </span>
          </motion.button>
        </div>
      </motion.section>

      {/* Main card */}
      <motion.section
        initial={{
          opacity: 0,
          y: 16,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.1,
        }}
        className="rounded-3xl border border-violet-100/80 bg-white p-4 shadow-xl shadow-violet-950/[0.05] sm:p-5"
      >
        {/* Search and filters */}
        <div className="mb-6 rounded-3xl border border-violet-100 bg-gradient-to-r from-violet-50/70 via-white to-fuchsia-50/60 p-4 shadow-sm">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            {/* Search */}
            <motion.div
              whileHover={{
                y: -1,
              }}
              className="w-full max-w-2xl"
            >
              <div className="group relative overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm transition-all duration-300 focus-within:border-violet-300 focus-within:shadow-lg focus-within:shadow-violet-500/10 focus-within:ring-4 focus-within:ring-violet-100">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-md shadow-violet-500/20">
                    <Search size={16} />
                  </div>
                </div>

                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) =>
                    setSearchInput(
                      event.target.value
                    )
                  }
                  placeholder="Search member by name, phone, email or plan"
                  className="h-14 w-full bg-transparent pl-14 pr-24 text-sm font-medium text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400"
                />

                {searchInput && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearchInput("")
                    }
                    className="absolute inset-y-0 right-3 my-auto h-8 rounded-xl bg-slate-100 px-3 text-xs font-medium text-slate-500 transition hover:bg-violet-100 hover:text-violet-700"
                  >
                    Clear
                  </button>
                )}
              </div>
            </motion.div>

            {/* Right controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-11 items-center gap-2 rounded-2xl border border-violet-100 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm">
                <div className="grid h-7 w-7 place-items-center rounded-lg bg-violet-100 text-violet-600">
                  <Users size={15} />
                </div>

                {totalMembers}
                <span className="font-normal text-slate-400">
                  members
                </span>
              </div>

              <div className="relative">
                <select
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(
                      Number(event.target.value)
                    );

                    setPage(1);
                  }}
                  className="h-11 appearance-none rounded-2xl border border-violet-100 bg-white pl-4 pr-10 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                >
                  <option value="10">
                    10 rows
                  </option>

                  <option value="20">
                    20 rows
                  </option>

                  <option value="50">
                    50 rows
                  </option>
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              <motion.button
                type="button"
                title="Advanced filters"
                whileHover={{
                  y: -2,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                className="grid h-11 w-11 place-items-center rounded-2xl border border-violet-100 bg-white text-violet-600 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:shadow-md"
              >
                <SlidersHorizontal size={18} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Table */}
        {membersQuery.isLoading ? (
          <MembersLoading />
        ) : membersQuery.isError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-600">
            Members could not be loaded.
            Check that Django is running and
            the members API URL is correct.
          </div>
        ) : (
          <MemberTable
            members={members}
            onEdit={handleEdit}
            onRenew={handleRenew}
            onDelete={handleDelete}
            deletingMemberId={
              deleteMutation.variables
            }
            isDeleting={
              deleteMutation.isPending
            }
          />
        )}

        {/* Pagination */}
        <div className="mt-5 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-5 sm:flex-row">
          <div>
            <p className="text-sm text-slate-500">
              Page{" "}
              <span className="font-semibold text-slate-900">
                {page}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">
                {totalPages}
              </span>
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Showing up to {pageSize} records
              per page
            </p>
          </div>

          <div className="flex gap-2">
            <PaginationButton
              disabled={page <= 1}
              onClick={() =>
                setPage(
                  (currentPage) =>
                    currentPage - 1
                )
              }
            >
              Previous
            </PaginationButton>

            <PaginationButton
              disabled={
                page >= totalPages
              }
              onClick={() =>
                setPage(
                  (currentPage) =>
                    currentPage + 1
                )
              }
            >
              Next
            </PaginationButton>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

function MembersLoading() {
  return (
    <div className="space-y-3 py-4">
      {Array.from({
        length: 6,
      }).map((_, index) => (
        <motion.div
          key={index}
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: index * 0.05,
          }}
          className="h-16 animate-pulse rounded-2xl bg-gradient-to-r from-violet-50 via-slate-50 to-violet-50"
        />
      ))}
    </div>
  );
}

function PaginationButton({
  children,
  onClick,
  disabled,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300 disabled:shadow-none"
    >
      {children}
    </button>
  );
}

export default MembersPage;