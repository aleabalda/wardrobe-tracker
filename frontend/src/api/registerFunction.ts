interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export async function register(data: RegisterRequest) {
  const res = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // safe to include
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Registration failed");
  }

  return res.json();
}
