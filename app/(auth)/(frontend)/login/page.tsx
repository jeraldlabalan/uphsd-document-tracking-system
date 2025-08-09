import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Login from "./loginform"; // your client component!

export default async function LoginPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (session) {
    const parts = session.value.split(":");
    const role = parts[2];
    if (role === "Admin") {
      redirect("/admin/dashboard"); // Already logged in? Skip login.
    } else if (role === "Employee") {
      redirect("/employee2/dashboard");
    }
  }

  return <Login />;
}
