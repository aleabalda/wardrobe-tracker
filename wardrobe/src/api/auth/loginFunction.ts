interface LoginRequest {
  email: string;
  password: string;
}

export async function login(data: LoginRequest) {
  const response = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // 🔥 THIS IS REQUIRED
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error ?? "Login failed");
  }

  return response.json();
}
