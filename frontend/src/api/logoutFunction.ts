export async function logout() {
  const response = await fetch("http://localhost:3000/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error ?? "Logout failed");
  }

  return response.json();
}
