import {
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { motion } from "motion/react";

import Badge from "../ui/Badge";
import Button from "../ui/Button";

function MemberTable({
  members,
  onEdit,
  onRenew,
  onDelete,
  deletingMemberId,
  isDeleting,
}) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-[#E5E7EB] bg-[#F8FAFC]">
            <tr>
              <TableHeading>Member</TableHeading>
              <TableHeading>Phone</TableHeading>
              <TableHeading>Plan</TableHeading>
              <TableHeading>Joining</TableHeading>
              <TableHeading>Expiry</TableHeading>
              <TableHeading>Status</TableHeading>
              <TableHeading align="right">
                Actions
              </TableHeading>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E5E7EB]">
            {members.map((member, index) => (
              <motion.tr
                key={member.id}
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: Math.min(index * 0.025, 0.3),
                }}
                className="group transition-colors duration-200 hover:bg-[#F8FAFC]"
              >
                <td className="px-5 py-4">
                  <div className="flex min-w-56 items-center gap-3">
                    <MemberAvatar member={member} />

                    <div>
                      <p className="font-semibold text-[#111827]">
                        {member.name}
                      </p>

                      <p className="mt-1 max-w-48 truncate text-xs text-[#94A3B8]">
                        {member.email || "No email provided"}
                      </p>
                    </div>
                  </div>
                </td>

                <TableCell>
                  {member.phone || "—"}
                </TableCell>

                <TableCell>
                  <Badge variant="primary">
                    {member.plan_name ||
                      member.plan ||
                      "No plan"}
                  </Badge>
                </TableCell>

                <TableCell>
                  {member.joining_date || "—"}
                </TableCell>

                <TableCell>
                  {member.expiry_date || "—"}
                </TableCell>

                <TableCell>
                  <StatusBadge member={member} />
                </TableCell>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Edit member"
                      onClick={() => onEdit(member)}
                    >
                      <Pencil size={16} />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className="text-[#06B6D4] hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                      aria-label="Renew membership"
                      onClick={() => onRenew(member)}
                    >
                      <RefreshCw size={16} />
                    </Button>

                    <Button
                      variant="danger"
                      size="icon"
                      aria-label="Delete member"
                      disabled={
                        isDeleting &&
                        deletingMemberId === member.id
                      }
                      loading={
                        isDeleting &&
                        deletingMemberId === member.id
                      }
                      onClick={() => onDelete(member)}
                    >
                      {!(
                        isDeleting &&
                        deletingMemberId === member.id
                      ) && <Trash2 size={16} />}
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}

            {members.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="px-5 py-16 text-center"
                >
                  <div className="mx-auto max-w-sm">
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-[#4F46E5]">
                      <span className="text-2xl">👥</span>
                    </div>

                    <p className="mt-4 font-semibold text-[#111827]">
                      No members found
                    </p>

                    <p className="mt-2 text-sm text-[#64748B]">
                      Try changing your search or add a new gym member.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MemberAvatar({ member }) {
  const photo =
    member.photo_url || member.photo;

  if (photo) {
    return (
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] shadow-sm">
        <img
          src={photo}
          alt={member.name}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  const initial =
    member.name
      ?.trim()
      .charAt(0)
      .toUpperCase() || "M";

  return (
    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] text-sm font-bold text-white shadow-md shadow-indigo-500/20">
      {initial}
    </div>
  );
}

function TableHeading({
  children,
  align = "left",
}) {
  return (
    <th
      className={`whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#64748B] ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function TableCell({ children }) {
  return (
    <td className="whitespace-nowrap px-5 py-4 text-sm text-[#64748B]">
      {children}
    </td>
  );
}

function StatusBadge({ member }) {
  let status = member.membership_status;

  if (!status) {
    status = member.is_active
      ? "active"
      : "expired";
  }

  const map = {
    active: {
      label: "Active",
      variant: "success",
    },
    expiring_soon: {
      label: "Expiring soon",
      variant: "warning",
    },
    expired: {
      label: "Expired",
      variant: "danger",
    },
    inactive: {
      label: "Inactive",
      variant: "neutral",
    },
  };

  const current = map[status] || map.inactive;

  return (
    <Badge
      variant={current.variant}
      dot
    >
      {current.label}
    </Badge>
  );
}

export default MemberTable;