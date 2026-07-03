import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

export type CurrentShop = {
  id: string;
  name: string;
  role: string;
};

export type CurrentContext = {
  user: User | null;
  shop: CurrentShop | null;
  dbError: string | null;
};

export async function getCurrentContext(): Promise<CurrentContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, shop: null, dbError: null };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("shop_members")
    .select("shop_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError) {
    return {
      user,
      shop: null,
      dbError: membershipError.message,
    };
  }

  if (!membership?.shop_id) {
    return { user, shop: null, dbError: null };
  }

  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .select("id, name")
    .eq("id", membership.shop_id)
    .single();

  if (shopError) {
    return {
      user,
      shop: null,
      dbError: shopError.message,
    };
  }

  return {
    user,
    shop: {
      id: shop.id,
      name: shop.name,
      role: membership.role,
    },
    dbError: null,
  };
}

export async function requireCurrentShop() {
  const context = await getCurrentContext();

  if (!context.user || !context.shop) {
    throw new Error("Usuario sem loja ativa.");
  }

  return { user: context.user, shop: context.shop };
}
