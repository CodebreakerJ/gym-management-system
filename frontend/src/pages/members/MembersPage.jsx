import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  ChevronDown,
  Filter,
  Plus,
  RotateCcw,
  Search,
  Users,
  X,
} from "lucide-react";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import MemberTable from "../../components/members/MemberTable";

import {
  deleteMember,
  getMembers,
} from "../../services/memberService";

function MembersPage() {
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const membersQuery = useQuery({
    queryKey: ["members", search, page, pageSize],
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
    Math.ceil(totalMembers / pageSize),
  );

  function handleEdit(member) {
    console.log("Edit member:", member);
  }

  function handleRenew(member) {
    console.log("Renew member:", member);
  }

  function handleDelete(member) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${member.name}? You can restore this member later.`,
    );

    if (!confirmed) return;

    deleteMutation.mutate(member.id);
  }

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        eyebrow="Member management"
        title="Members"
        description="Search, update, renew and manage all gym members."
        actions={
          <>
            <Button
              variant="outline"
              leftIcon={RotateCcw}
            >
              Deleted members
            </Button>

            <Button
              variant="gradient"
              leftIcon={Plus}
            >
              Add new member
            </Button>
          </>
        }
      />

      <Card
        padding="small"
        className="overflow-hidden"
      >
        <div className="mb-5 flex flex-col gap-4 border-b border-[#E5E7EB] pb-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="w-full max-w-2xl">
            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search
                  size={18}
                  className="text-[#94A3B8] transition group-focus-within:text-[#4F46E5]"
                />
              </div>

              <input
                type="search"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Search by name, phone, email, address or plan"
                className="h-12 w-full rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] pl-11 pr-24 text-sm text-[#111827] outline-none transition placeholder:text-[#94A3B8] focus:border-[#4F46E5] focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />

              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute inset-y-0 right-3 my-auto grid h-8 w-8 place-items-center rounded-xl text-[#94A3B8] transition hover:bg-slate-100 hover:text-[#111827]"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-11 items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#64748B] shadow-sm">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-50 text-[#4F46E5]">
                <Users size={15} />
              </div>

              <span className="font-semibold text-[#111827]">
                {totalMembers}
              </span>

              members
            </div>

            <div className="relative">
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
                className="h-11 appearance-none rounded-2xl border border-[#E5E7EB] bg-white pl-4 pr-10 text-sm font-medium text-[#374151] shadow-sm outline-none transition focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-100"
              >
                <option value="10">10 rows</option>
                <option value="20">20 rows</option>
                <option value="50">50 rows</option>
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              aria-label="Open filters"
            >
              <Filter size={18} />
            </Button>
          </div>
        </div>

        {membersQuery.isLoading ? (
          <MembersLoading />
        ) : membersQuery.isError ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-[#EF4444]">
            Members could not be loaded. Check that Django is running and the members API URL is correct.
          </div>
        ) : (
          <MemberTable
            members={members}
            onEdit={handleEdit}
            onRenew={handleRenew}
            onDelete={handleDelete}
            deletingMemberId={deleteMutation.variables}
            isDeleting={deleteMutation.isPending}
          />
        )}

        <div className="mt-5 flex flex-col gap-4 border-t border-[#E5E7EB] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-[#64748B]">
              Page{" "}
              <span className="font-semibold text-[#111827]">
                {page}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[#111827]">
                {totalPages}
              </span>
            </p>

            <p className="mt-1 text-xs text-[#94A3B8]">
              Showing up to {pageSize} members per page
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() =>
                setPage((currentPage) => currentPage - 1)
              }
            >
              Previous
            </Button>

            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((currentPage) => currentPage + 1)
              }
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function MembersLoading() {
  return (
    <div className="space-y-3 py-4">
      {Array.from({ length: 7 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.04 }}
          className="h-16 animate-pulse rounded-2xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100"
        />
      ))}
    </div>
  );
}

export default MembersPage;