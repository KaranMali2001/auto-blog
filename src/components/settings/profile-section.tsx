import { User2 } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/types/index";

export function ProfileSection({ user }: { user: User | undefined }) {
  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* User Info Card */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          {user.imageUrl ? (
            <Image src={user.imageUrl} alt={user.name || "User"} width={96} height={96} className="h-24 w-24 rounded-full border-2 border-border object-cover" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-border bg-muted">
              <User2 className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          {/* User Details */}
          <div className="flex-1 space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={user.name || "Not set"} disabled className="mt-2" />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled className="mt-2" />
            </div>

            <p className="text-xs text-muted-foreground">Profile information is managed through your authentication provider</p>
          </div>
        </div>
      </div>
    </div>
  );
}
