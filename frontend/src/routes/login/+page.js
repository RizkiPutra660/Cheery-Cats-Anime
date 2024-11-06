import { goto } from "$app/navigation";
import { browser } from "$app/environment";

export async function load({ parent }) {
  if (!browser) return;
  const { isLoggedIn } = await parent();
  if (isLoggedIn) goto("/my-articles", { replaceState: true });
}