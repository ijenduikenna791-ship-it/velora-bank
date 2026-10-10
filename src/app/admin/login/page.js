import { notFound } from "next/navigation";

// The admin entrance moved to a private, unguessable path. This old route
// no longer exists publicly — anyone hitting it gets a standard 404.
export default function Page() {
  notFound();
}
