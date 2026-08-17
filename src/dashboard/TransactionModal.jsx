import { useMemo, useState } from "react";
import {
  getTransactionFee,
  processDepositTransaction,
  processWithdrawalTransaction,
  validateDepositForm,
  validateWithdrawalForm,
} from "./services/transactionService";

const paymentMethods = [
  { value: "mtn", label: "MTN Mobile Money", short: "M" },
  { value: "airtel", label: "Airtel Money", short: "A" },
  { value: "card", label: "Visa / Mastercard", short: "V" },
];

const createEmptyForm = (type) => ({
  amount: "",
  paymentMethod: type === "deposit" ? "mtn" : "mtn",
  phone: "",
  accountNumber: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
  cardholderName: "",
});

const formatCardNumber = (value) => value.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const TransactionModal = ({ type, balance, userId, onClose, onTransactionSuccess }) => {
  const isDeposit = type === "deposit";
  const [form, setForm] = useState(createEmptyForm(type));
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ kind: "idle", message: "", referenceId: "" });

  const amountValue = Number(form.amount || 0);
  const feeValue = amountValue > 0 ? getTransactionFee(amountValue, form.paymentMethod) : 0;
  const totalValue = isDeposit ? amountValue + feeValue : amountValue;
  const netValue = isDeposit ? totalValue : Math.max(amountValue - feeValue, 0);

  const selectedMethod = useMemo(
    () => paymentMethods.find((method) => method.value === form.paymentMethod) || paymentMethods[0],
    [form.paymentMethod]
  );

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validation = isDeposit
      ? validateDepositForm({
          ...form,
          amount: form.amount,
          paymentMethod: form.paymentMethod,
          phone: form.phone,
          cardNumber: form.cardNumber,
          expiry: form.expiry,
          cvv: form.cvv,
          cardholderName: form.cardholderName,
        })
      : validateWithdrawalForm({
          amount: form.amount,
          balance,
          paymentMethod: form.paymentMethod,
          phone: form.phone,
          accountNumber: form.accountNumber,
        });

    if (!validation.isValid) {
      setStatus({ kind: "error", message: validation.message, referenceId: "" });
      return;
    }

    setSubmitting(true);
    setStatus({ kind: "processing", message: isDeposit ? "Processing your deposit request..." : "Submitting withdrawal request...", referenceId: "" });

    try {
      const result = isDeposit
        ? await processDepositTransaction({
            userId,
            amount: form.amount,
            paymentMethod: form.paymentMethod,
            phone: form.phone,
            cardNumber: form.cardNumber,
            expiry: form.expiry,
            cvv: form.cvv,
            cardholderName: form.cardholderName,
          })
        : await processWithdrawalTransaction({
            userId,
            amount: form.amount,
            paymentMethod: form.paymentMethod,
            phone: form.phone,
            accountNumber: form.accountNumber,
            balance,
          });

      setStatus({ kind: "success", message: result.message, referenceId: result.referenceId || "" });
      if (typeof onTransactionSuccess === "function") {
        await onTransactionSuccess();
      }
    } catch (error) {
      setStatus({ kind: "error", message: error?.message || "Something went wrong. Please try again.", referenceId: "" });
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = () => {
    if (form.paymentMethod === "card") {
      return (
        <div className="transaction-form__card-grid">
          <label className="transaction-form__field transaction-form__field--full">
            <span>Card Number</span>
            <input
              type="text"
              value={form.cardNumber}
              onChange={(event) => updateField("cardNumber", formatCardNumber(event.target.value))}
              placeholder="1234 5678 9012 3456"
              inputMode="numeric"
            />
          </label>

          <label className="transaction-form__field">
            <span>Expiry</span>
            <input
              type="text"
              value={form.expiry}
              onChange={(event) => updateField("expiry", formatExpiry(event.target.value))}
              placeholder="MM/YY"
            />
          </label>

          <label className="transaction-form__field">
            <span>CVV</span>
            <input
              type="password"
              value={form.cvv}
              onChange={(event) => updateField("cvv", event.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="123"
              inputMode="numeric"
            />
          </label>

          <label className="transaction-form__field transaction-form__field--full">
            <span>Cardholder Name</span>
            <input
              type="text"
              value={form.cardholderName}
              onChange={(event) => updateField("cardholderName", event.target.value)}
              placeholder="John Doe"
            />
          </label>
        </div>
      );
    }

    return (
      <label className="transaction-form__field transaction-form__field--full">
        <span>{selectedMethod.label.includes("MTN") || selectedMethod.label.includes("Airtel") ? "Phone number" : "Account details"}</span>
        <input
          type="tel"
          value={form.phone || form.accountNumber}
          onChange={(event) => {
            const value = event.target.value.replace(/\D/g, "").slice(0, 14);
            if (form.paymentMethod === "card") {
              updateField("accountNumber", value);
              return;
            }
            updateField("phone", value);
          }}
          placeholder={form.paymentMethod === "card" ? "Account number" : "2567..."}
          inputMode="numeric"
        />
      </label>
    );
  };

  return (
    <div className="transaction-modal-overlay" onClick={onClose}>
      <div className="transaction-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={isDeposit ? "Top up transaction form" : "Withdrawal form"}>
        <div className="transaction-modal__header">
          <div>
            <p className="transaction-modal__eyebrow">{isDeposit ? "Deposit" : "Withdraw"}</p>
            <h3 className="transaction-modal__title">{isDeposit ? "Top Up Wallet" : "Withdraw Funds"}</h3>
          </div>
          <button type="button" className="transaction-modal__close" onClick={onClose} aria-label="Close transaction form">
            ×
          </button>
        </div>

        <form className="transaction-form" onSubmit={handleSubmit}>
          <div className="transaction-form__field">
            <label htmlFor="transaction-amount">Amount</label>
            <div className="transaction-form__currency-input">
              <span>UGX</span>
              <input
                id="transaction-amount"
                type="number"
                min="1"
                step="1"
                value={form.amount}
                onChange={(event) => updateField("amount", event.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="transaction-form__section">
            <p className="transaction-form__label">Payment method</p>
            <div className="transaction-methods">
              {paymentMethods.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  className={`transaction-method ${form.paymentMethod === method.value ? "transaction-method--selected" : ""}`}
                  onClick={() => updateField("paymentMethod", method.value)}
                >
                  <span className={`transaction-method__icon transaction-method__icon--${method.value}`}>{method.short}</span>
                  <span>{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {renderField()}

          <div className="transaction-summary">
            <div className="transaction-summary__row">
              <span>{isDeposit ? "Deposit amount" : "Withdrawal amount"}</span>
              <strong>UGX {Number(form.amount || 0).toLocaleString()}</strong>
            </div>
            <div className="transaction-summary__row">
              <span>Transaction fee</span>
              <strong>UGX {feeValue.toLocaleString()}</strong>
            </div>
            <div className="transaction-summary__row transaction-summary__row--total">
              <span>{isDeposit ? "Total amount" : "Amount to receive"}</span>
              <strong>UGX {Number(netValue || totalValue || 0).toLocaleString()}</strong>
            </div>
            {isDeposit ? null : (
              <div className="transaction-summary__row">
                <span>Available balance</span>
                <strong>UGX {Number(balance || 0).toLocaleString()}</strong>
              </div>
            )}
          </div>

          {status.kind !== "idle" && (
            <div className={`transaction-status transaction-status--${status.kind}`} role="status" aria-live="polite">
              <span>{status.message}</span>
              {status.referenceId ? <strong>Ref: {status.referenceId}</strong> : null}
            </div>
          )}

          <button type="submit" className="transaction-form__submit" disabled={submitting}>
            {submitting ? (isDeposit ? "Processing deposit..." : "Processing withdrawal...") : isDeposit ? "Confirm Deposit" : "Confirm Withdrawal"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
