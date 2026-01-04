import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-6" />
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Sorry, we couldn't find the page you're looking for. It might have been moved
        or doesn't exist.
      </p>
      <div className="flex gap-4 justify-center">
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
        <Link href="/projects">
          <Button variant="outline">Browse Projects</Button>
        </Link>
      </div>
    </div>
  );
}
