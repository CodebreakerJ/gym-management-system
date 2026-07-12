import axiosClient from "../api/axiosClient";

export async function getMembers(params = {}) {
  const response = await axiosClient.get("/members/", {
    params,
  });

  return response.data;
}

export async function getDeletedMembers(params = {}) {
  const response = await axiosClient.get(
    "/members/deleted/",
    {
      params,
    }
  );

  return response.data;
}

export async function deleteMember(memberId) {
  const response = await axiosClient.delete(
    `/members/${memberId}/`
  );

  return response.data;
}

export async function restoreMember(memberId) {
  const response = await axiosClient.post(
    `/members/${memberId}/restore/`
  );

  return response.data;
}