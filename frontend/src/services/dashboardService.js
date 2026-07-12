import axiosClient from "../api/axiosClient";

export async function getDashboardSummary() {
  const response = await axiosClient.get(
    "/dashboard/summary/"
  );

  return response.data;
}

export async function getRevenueSummary() {
  const response = await axiosClient.get(
    "/dashboard/revenue-summary/"
  );

  return response.data;
}

export async function getGenderDistribution() {
  const response = await axiosClient.get(
    "/dashboard/gender-distribution/"
  );

  return response.data;
}

export async function getAttendanceTrend(days = 7) {
  const response = await axiosClient.get(
    `/dashboard/attendance-trend/?days=${days}`
  );

  return response.data;
}

export async function getRecentMembers() {
  const response = await axiosClient.get(
    "/dashboard/recent-members/"
  );

  return response.data;
}

export async function getExpiringMembers() {
  const response = await axiosClient.get(
    "/dashboard/expiring-soon/"
  );

  return response.data;
}

export async function getNotificationSummary() {
  const response = await axiosClient.get(
    "/notifications/summary/"
  );

  return response.data;
}