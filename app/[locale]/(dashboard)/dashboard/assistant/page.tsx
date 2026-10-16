import AssistantPage from "@/components/assistant/AssistantPage";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("Assistant");
  return { title: t("titleLineOne") };
}

export default function BusinessAssistantPage() {
  return <AssistantPage />;
}
