import { Waybill, Transaction, ValidationResult } from '../types';

/**
 * Waybill Validation Engine for Cooknow Business Management System
 * Performs deterministic multi-point verification against transaction and fleet records.
 */
export function validateWaybill(
  waybill: Partial<Waybill>,
  allTransactions: Transaction[],
  allWaybills: Waybill[],
  currentWaybillId?: string
): ValidationResult {
  const discrepancies: string[] = [];

  const checkedFields = {
    transactionExists: false,
    customerMatches: false,
    referenceUnique: false,
    itemsAndQtyMatch: false,
    requiredFieldsPresent: false,
    transactionPermitsWaybill: false,
  };

  // 1. Required fields presence
  if (
    !waybill.waybillNumber?.trim() ||
    !waybill.transactionRef?.trim() ||
    !waybill.destination?.trim() ||
    !waybill.dispatchDate?.trim() ||
    !waybill.recordedBy?.trim()
  ) {
    const missing: string[] = [];
    if (!waybill.waybillNumber?.trim()) missing.push('Waybill Number');
    if (!waybill.transactionRef?.trim()) missing.push('Associated Transaction Reference');
    if (!waybill.destination?.trim()) missing.push('Delivery Destination');
    if (!waybill.dispatchDate?.trim()) missing.push('Dispatch Date');
    if (!waybill.recordedBy?.trim()) missing.push('Recorded By (Officer)');

    discrepancies.push(`Missing mandatory fields: ${missing.join(', ')}.`);
    checkedFields.requiredFieldsPresent = false;
  } else {
    checkedFields.requiredFieldsPresent = true;
  }

  // 2. Waybill reference uniqueness
  const duplicateWaybill = allWaybills.find(
    w =>
      w.waybillNumber.trim().toUpperCase() === waybill.waybillNumber?.trim().toUpperCase() &&
      w.id !== currentWaybillId &&
      w.id !== waybill.id
  );

  if (duplicateWaybill) {
    discrepancies.push(
      `Duplicate Waybill Reference: '${waybill.waybillNumber}' is already registered on record ${duplicateWaybill.id} for Transaction ${duplicateWaybill.transactionRef}.`
    );
    checkedFields.referenceUnique = false;
  } else {
    checkedFields.referenceUnique = true;
  }

  // 3. Associated Transaction Reference existence
  const matchedTx = allTransactions.find(
    tx => tx.reference.trim().toUpperCase() === waybill.transactionRef?.trim().toUpperCase()
  );

  if (!matchedTx) {
    discrepancies.push(
      `Transaction reference '${waybill.transactionRef}' not found in active order records. Please confirm the sales order reference.`
    );
    checkedFields.transactionExists = false;
  } else {
    checkedFields.transactionExists = true;

    // 4. Transaction status permits waybill dispatch
    if (matchedTx.transactionStatus === 'Cancelled') {
      discrepancies.push(
        `Transaction status violation: '${matchedTx.reference}' is marked as 'Cancelled'. Dispatches cannot be processed for cancelled sales.`
      );
      checkedFields.transactionPermitsWaybill = false;
    } else if (matchedTx.transactionStatus === 'Draft') {
      discrepancies.push(
        `Transaction '${matchedTx.reference}' is still in 'Draft' state. Orders must be confirmed or completed before waybill release.`
      );
      checkedFields.transactionPermitsWaybill = false;
    } else {
      checkedFields.transactionPermitsWaybill = true;
    }

    // 5. Customer match
    // Compare customer names or customer IDs
    const txCustName = matchedTx.customerName.trim().toLowerCase();
    const wbCustName = (waybill.customerName || '').trim().toLowerCase();

    if (wbCustName && !txCustName.includes(wbCustName) && !wbCustName.includes(txCustName)) {
      discrepancies.push(
        `Customer Mismatch: Waybill names '${waybill.customerName}' but Transaction ${matchedTx.reference} belongs to '${matchedTx.customerName}'.`
      );
      checkedFields.customerMatches = false;
    } else {
      checkedFields.customerMatches = true;
    }

    // 6. Quantity and line item match
    const txTotalUnits = matchedTx.items.reduce((sum, item) => sum + item.quantity, 0);
    const wbTotalUnits = waybill.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) ?? (waybill.totalUnits || 0);

    if (wbTotalUnits !== txTotalUnits) {
      discrepancies.push(
        `Quantity Discrepancy: Waybill specifies ${wbTotalUnits} total units, but Transaction ${matchedTx.reference} authorized exactly ${txTotalUnits} units (${matchedTx.items.map(i => `${i.quantity}x ${i.itemName}`).join(', ')}).`
      );
      checkedFields.itemsAndQtyMatch = false;
    } else {
      checkedFields.itemsAndQtyMatch = true;
    }

    // 7. Check if another active waybill was already accepted for this transaction
    const otherWaybillWithSameTx = allWaybills.find(
      w =>
        w.transactionRef.trim().toUpperCase() === matchedTx.reference.toUpperCase() &&
        w.id !== currentWaybillId &&
        w.id !== waybill.id &&
        w.validationStatus === 'Validation Passed' &&
        w.deliveryStatus !== 'Cancelled'
    );

    if (otherWaybillWithSameTx) {
      discrepancies.push(
        `Duplicate Dispatch Alert: Transaction ${matchedTx.reference} already has a validated waybill (${otherWaybillWithSameTx.waybillNumber}). Multiple active waybills require administrative override.`
      );
    }
  }

  const isValid = discrepancies.length === 0;
  const status = isValid
    ? 'Validation Passed'
    : discrepancies.some(d => d.includes('Violation') || d.includes('Mismatch') || d.includes('Duplicate'))
    ? 'Requires Review'
    : 'Rejected';

  return {
    isValid,
    status,
    discrepancies,
    checkedFields,
  };
}
