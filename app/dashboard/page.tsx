import { redirect } from "next/navigation";

export default function DashboardPage() {
    // For now, redirect to projects as it's the main feature requested
    redirect("/dashboard/projects");
}
