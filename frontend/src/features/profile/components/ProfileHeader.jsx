import { CheckCircle2 } from "lucide-react";

export default function ProfileHeader({ profileSaved }) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-foreground">Profile Data</h1>
                <p className="text-sm text-muted-foreground mt-1">Your professional profile powers all AI resume generation.</p>
            </div>
            {profileSaved && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full font-semibold">
                    <CheckCircle2 size={13} /> Changes saved
                </span>
            )}
        </div>
    )
}