export default function Skeleton({ className = "" }) {
    return <div className={`bg-muted/60 rounded-xl animate-pulse ${className}`} />;
}