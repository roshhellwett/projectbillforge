import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { requireBusinessSession, AuthError } from "@/lib/session";
import { db } from "@/lib/db";
import { businesses, customers, invoices, khataResets, khataTransactions, products } from "@/lib/schema";
import { checkActionRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireBusinessSession();
    const rateCheck = await checkActionRateLimit(session.id, "exportData", 2, "10 m");
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: { code: "RATE_LIMITED", message: "Please wait before requesting another export." } },
        { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": "600" } },
      );
    }

    const [business, customerRows, productRows, invoiceRows, transactionRows, resetRows] = await Promise.all([
      db.query.businesses.findFirst({
        where: eq(businesses.id, session.id),
        columns: {
          id: true,
          name: true,
          gstin: true,
          address: true,
          phone: true,
          state: true,
          pincode: true,
          termsAndConditions: true,
          industryType: true,
          createdAt: true,
        },
      }),
      db.query.customers.findMany({ where: eq(customers.businessId, session.id) }),
      db.query.products.findMany({ where: eq(products.businessId, session.id) }),
      db.query.invoices.findMany({ where: eq(invoices.businessId, session.id) }),
      db.query.khataTransactions.findMany({ where: eq(khataTransactions.businessId, session.id) }),
      db.query.khataResets.findMany({ where: eq(khataResets.businessId, session.id) }),
    ]);

    if (!business) {
      return NextResponse.json(
        { error: { code: "BUSINESS_NOT_FOUND", message: "Workspace data could not be found." } },
        { status: 404, headers: { "Cache-Control": "no-store" } },
      );
    }

    const exportPayload = {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      workspace: business,
      customers: customerRows,
      products: productRows,
      invoices: invoiceRows,
      khataTransactions: transactionRows,
      khataResets: resetRows,
    };

    const date = new Date().toISOString().slice(0, 10);
    return NextResponse.json(exportPayload, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="billforge-export-${date}.json"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Sign in to export workspace data." } },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    console.error("Workspace data export failed", error);
    return NextResponse.json(
      { error: { code: "EXPORT_UNAVAILABLE", message: "Workspace export is temporarily unavailable." } },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
