const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured.");
}

type ApiMessageResponse = {
  message: string;
};

async function getErrorMessage(response: Response) {
  try {
    const data = await response.json();

    if (typeof data?.message === "string") {
      return data.message;
    }

    if (Array.isArray(data?.message)) {
      return data.message.join(" ");
    }
  } catch {
    // Ignore JSON parsing error
  }

  return "Something went wrong. Please try again.";
}

export async function requestPasswordReset(
  email: string,
): Promise<ApiMessageResponse> {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
    }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<ApiMessageResponse>;
}

export async function resetPassword(params: {
  token: string;
  newPassword: string;
}): Promise<ApiMessageResponse> {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<ApiMessageResponse>;
}