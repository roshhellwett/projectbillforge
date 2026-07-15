import test from "node:test";
import assert from "node:assert/strict";
import { allocatePaymentAcrossInvoices, calculateLateFee } from "../lib/accounting.ts";

test("E2E Simulation: Multi-item GST Invoice Tax Breakup and Total Calculation Flow", () => {
  const cartItems = [
    { productId: "p1", productName: "Cooking Oil 1L", quantity: 10, rate: 150, gstRate: 5 },
    { productId: "p2", productName: "Detergent Powder 2kg", quantity: 5, rate: 200, gstRate: 18 },
  ];

  const isInterState = false; 

  const calculatedItems = cartItems.map(item => {
    const amount = Number((item.quantity * item.rate).toFixed(2));
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isInterState) {
      igst = Number(((amount * item.gstRate) / 100).toFixed(2));
    } else {
      cgst = Number(((amount * (item.gstRate / 2)) / 100).toFixed(2));
      sgst = Number(((amount * (item.gstRate / 2)) / 100).toFixed(2));
    }

    return { ...item, amount, cgst, sgst, igst };
  });

  assert.equal(calculatedItems[0].amount, 1500, "Cooking oil base amount should be 1500");
  assert.equal(calculatedItems[0].cgst, 37.5, "Cooking oil CGST (2.5%) should be 37.5");
  assert.equal(calculatedItems[0].sgst, 37.5, "Cooking oil SGST (2.5%) should be 37.5");
  assert.equal(calculatedItems[0].igst, 0, "Intra-state IGST must be 0");

  assert.equal(calculatedItems[1].amount, 1000, "Detergent base amount should be 1000");
  assert.equal(calculatedItems[1].cgst, 90, "Detergent CGST (9%) should be 90");
  assert.equal(calculatedItems[1].sgst, 90, "Detergent SGST (9%) should be 90");

  const subtotal = calculatedItems.reduce((acc, i) => acc + i.amount, 0);
  const totalTax = calculatedItems.reduce((acc, i) => acc + i.cgst + i.sgst + i.igst, 0);
  const grandTotal = Number((subtotal + totalTax).toFixed(2));

  assert.equal(subtotal, 2500, "Subtotal should be 2500");
  assert.equal(totalTax, 255, "Total tax should be 255");
  assert.equal(grandTotal, 2755, "Grand total of GST invoice must be exact 2755");
});

test("E2E Simulation: Khata Ledger Customer Credit Limit & FIFO Payment Settlement Flow", () => {
  const customer = {
    id: "cust-101",
    name: "Mahalakshmi General Store",
    creditLimit: 20000,
    currentBalance: 12500, 
  };

  const newPurchaseAmount = 8500;
  const projectedBalance = customer.currentBalance + newPurchaseAmount;
  const isOverLimit = projectedBalance > customer.creditLimit;

  assert.equal(projectedBalance, 21000, "Projected balance is 21000");
  assert.equal(isOverLimit, true, "Should trigger over-credit-limit alert when balance exceeds 20000");

  const pendingInvoices = [
    { id: "inv-201", total: 4000, amountPaid: 1000 }, 
    { id: "inv-202", total: 5500, amountPaid: 0 },    
    { id: "inv-203", total: 4000, amountPaid: 0 },    
  ];

  const paymentReceived = 6000;
  const settlement = allocatePaymentAcrossInvoices(pendingInvoices, paymentReceived);

  assert.deepEqual(settlement.updates, [
    { id: "inv-201", amountPaid: 4000, status: "paid" },     
    { id: "inv-202", amountPaid: 3000, status: "partial" },  
  ]);
  assert.equal(settlement.remaining, 0, "No remaining unallocated funds after exact FIFO allocation");

  const updatedCustomerBalance = customer.currentBalance - paymentReceived;
  assert.equal(updatedCustomerBalance, 6500, "Customer net ledger balance should drop from 12500 to 6500");
});

test("E2E Simulation: Inventory Stock Lifecycle & Low Stock Alert Evaluation Flow", () => {
  const catalog = [
    { id: "p-1", name: "Amul Butter 500g", stockQuantity: 50, lowStockThreshold: 10 },
    { id: "p-2", name: "Tata Salt 1kg", stockQuantity: 12, lowStockThreshold: 15 },
    { id: "p-3", name: "Maggi Noodles Pack", stockQuantity: 5, lowStockThreshold: 0 }, 
  ];

  const initialLowStockItems = catalog.filter(
    p => p.lowStockThreshold > 0 && p.stockQuantity <= p.lowStockThreshold
  );
  assert.equal(initialLowStockItems.length, 1, "Only Tata Salt starts in low stock state");
  assert.equal(initialLowStockItems[0].name, "Tata Salt 1kg");

  const orderQuantity = 42;
  catalog[0].stockQuantity -= orderQuantity; 

  assert.equal(catalog[0].stockQuantity, 8, "Amul Butter stock drops to 8");

  const updatedLowStockItems = catalog.filter(
    p => p.lowStockThreshold > 0 && p.stockQuantity <= p.lowStockThreshold
  );
  assert.equal(updatedLowStockItems.length, 2, "Both Amul Butter and Tata Salt are now low stock");
  assert.ok(updatedLowStockItems.some(p => p.id === "p-1"));
  assert.ok(updatedLowStockItems.some(p => p.id === "p-2"));
});

test("E2E Simulation: Business Udhaar Grace Period & Multi-Cycle Late Fee Calculation", () => {
  const fineSettings = {
    redemptionPeriodDays: 30, 
    finePercentage: 3.5,      
    fineFrequencyDays: 15,    
  };

  const invoice = {
    invoiceDate: "2026-04-01",
    paymentStatus: "unpaid",
    total: 50000,
    amountPaid: 0,
  };

  const withinGraceDate = new Date("2026-04-25");
  const feeDuringGrace = calculateLateFee(invoice, fineSettings, withinGraceDate);
  assert.equal(feeDuringGrace, 0, "No fines accrued within the 30-day grace window");

  const firstCycleOverdueDate = new Date("2026-05-18"); 
  const feeFirstCycle = calculateLateFee(invoice, fineSettings, firstCycleOverdueDate);
  assert.equal(feeFirstCycle, 1750, "First 15-day period penalty must be exactly 3.5% of 50000 = 1750");

  const secondCycleOverdueDate = new Date("2026-06-03"); 
  const feeSecondCycle = calculateLateFee(invoice, fineSettings, secondCycleOverdueDate);
  assert.equal(feeSecondCycle, 3500, "Two 15-day periods penalty must be exactly 3500");
});
