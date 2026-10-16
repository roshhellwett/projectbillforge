import HelpPage from "@/components/help/HelpPage";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("Help");
  return { title: t("title") };
}

export default function HelpRoute() {
  return <HelpPage />;
}
