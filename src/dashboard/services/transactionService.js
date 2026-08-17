import { supabase } from "../../lib/supabaseClient";

const TEST_MODE = true;

const paymentMethodMeta = {
  mtn: { label: "MTN Mobile Money", feeRate: 0.005 },
  airtel: { label: "Airtel Money", feeRate: 0.005 },
  card: { label: "Visa / Mastercard", feeRate: 0.015 },
};

const createReferenceId = (type) => {
  const prefix = type === "deposit" ? "DEP" : "WDR";
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
};

export const getPaymentMethodLabel = (method) => paymentMethodMeta[method]?.label || "Payment method";

export const getTransactionFee = (amount, paymentMethod) => {
  const numericAmount = Number(amount) || 0;
  const feeRate = paymentMethodMeta[paymentMethod]?.feeRate || 0;
  return Number((numericAmount * feeRate).toFixed(2));
};

export const validateDepositForm = ({ amount, paymentMethod, phone, cardNumber, expiry, cvv, cardholderName }) => {
  const numericAmount = Number(amount);

  if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
    return { isValid: false, message: "Enter a valid deposit amount greater than zero." };
  }

  if (paymentMethod === "mtn" || paymentMethod === "airtel") {
    const cleanPhone = (phone || "").replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return { isValid: false, message: "Enter a valid phone number for the selected mobile money provider." };
    }
  }

  if (paymentMethod === "card") {
    const cleanCard = (cardNumber || "").replace(/\s+/g, "");
    if (cleanCard.length < 13 || cleanCard.length > 19 || Number.isNaN(Number(cleanCard))) {
      return { isValid: false, message: "Enter a valid card number." };
    }

    if (!/^(0[1-9]|1[0-2])\/?\d{2}$/.test(expiry || "")) {
      return { isValid: false, message: "Enter a valid expiry date in MM/YY format." };
    }

    if (!/^\d{3,4}$/.test(cvv || "")) {
      return { isValid: false, message: "Enter a valid CVV." };
    }

    if (!cardholderName || cardholderName.trim().length < 2) {
      return { isValid: false, message: "Enter the cardholder name." };
    }
  }

  return { isValid: true, message: "" };
};

export const validateWithdrawalForm = ({ amount, balance, paymentMethod, phone, accountNumber }) => {
  const numericAmount = Number(amount);
  const availableBalance = Number(balance) || 0;

  if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
    return { isValid: false, message: "Enter a valid withdrawal amount greater than zero." };
  }

  if (numericAmount > availableBalance) {
    return { isValid: false, message: "Withdrawal amount exceeds the available balance." };
  }

  if (paymentMethod === "mtn" || paymentMethod === "airtel") {
    const cleanPhone = (phone || "").replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return { isValid: false, message: "Enter a valid phone number for the selected mobile money provider." };
    }
  }

  if (paymentMethod === "card") {
    const cleanAccount = (accountNumber || "").replace(/\s+/g, "");
    if (cleanAccount.length < 10) {
      return { isValid: false, message: "Enter a valid card/account reference." };
    }
  }

  return { isValid: true, message: "" };
};

const buildMockPaymentProcessor = (paymentMethod) => ({
  async processDeposit({ amount }) {
    if (!TEST_MODE) {
      throw new Error("Payment gateway is not enabled in production mode.");
    }

    await new Promise((resolve) => window.setTimeout(resolve, 1200));

    if (Number(amount) <= 0) {
      return { success: false, message: "The amount is invalid." };
    }

    return {
      success: true,
      message: "Test mode payment was approved.",
      providerLabel: getPaymentMethodLabel(paymentMethod),
      referenceId: createReferenceId("deposit"),
    };
  },

  async processWithdrawal({ amount, paymentMethod: method }) {
    if (!TEST_MODE) {
      throw new Error("Payment gateway is not enabled in production mode.");
    }

    await new Promise((resolve) => window.setTimeout(resolve, 1400));

    if (Number(amount) <= 0) {
      return { success: false, message: "The withdrawal amount is invalid." };
    }

    return {
      success: true,
      message: `Test mode withdrawal request approved via ${getPaymentMethodLabel(method)}.`,
      providerLabel: getPaymentMethodLabel(method),
      referenceId: createReferenceId("withdrawal"),
    };
  },
});

const getWalletBalance = async (userId) => {
  const { data, error } = await supabase
    .from("wallets")
    .select("balance, currency")
    .eq("user_id", userId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return {
    balance: Number(data?.balance || 0),
    currency: data?.currency || "UGX",
  };
};

const upsertWalletBalance = async (userId, nextBalance, currency = "UGX") => {
  const { error } = await supabase
    .from("wallets")
    .upsert(
      {
        user_id: userId,
        balance: Number(nextBalance),
        currency,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) {
    throw error;
  }
};

export const processDepositTransaction = async ({ userId, amount, paymentMethod, phone, cardNumber, expiry, cvv, cardholderName }) => {
  const numericAmount = Number(amount);
  const validation = validateDepositForm({ amount: numericAmount, paymentMethod, phone, cardNumber, expiry, cvv, cardholderName });

  if (!validation.isValid) {
    throw new Error(validation.message);
  }

  const provider = buildMockPaymentProcessor(paymentMethod);
  const providerResult = await provider.processDeposit({ amount: numericAmount, paymentMethod });

  if (!providerResult.success) {
    throw new Error(providerResult.message || "Deposit could not be processed.");
  }

  const wallet = await getWalletBalance(userId);
  const nextBalance = wallet.balance + numericAmount;
  await upsertWalletBalance(userId, nextBalance, wallet.currency);

  const { data: transaction, error: transactionError } = await supabase
    .from("transactions")
    .insert([
      {
        user_id: userId,
        type: "deposit",
        amount: numericAmount,
        status: "successful",
        description: `Top up via ${getPaymentMethodLabel(paymentMethod)}.`,
        payment_method: paymentMethod,
        reference_id: providerResult.referenceId,
        payment_account: paymentMethod === "card" ? (cardNumber || "") : (phone || ""),
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (transactionError) {
    throw transactionError;
  }

  return {
    success: true,
    status: "successful",
    message: "Your deposit was confirmed successfully.",
    referenceId: providerResult.referenceId,
    transaction,
    newBalance: nextBalance,
  };
};

export const processWithdrawalTransaction = async ({ userId, amount, paymentMethod, phone, accountNumber, balance }) => {
  const numericAmount = Number(amount);
  const validation = validateWithdrawalForm({ amount: numericAmount, balance, paymentMethod, phone, accountNumber });

  if (!validation.isValid) {
    throw new Error(validation.message);
  }

  const referenceId = createReferenceId("withdrawal");
  const { data: pendingTransaction, error: insertError } = await supabase
    .from("transactions")
    .insert([
      {
        user_id: userId,
        type: "withdrawal",
        amount: numericAmount,
        status: "pending",
        description: `Withdrawal request via ${getPaymentMethodLabel(paymentMethod)} pending approval.`,
        payment_method: paymentMethod,
        reference_id: referenceId,
        payment_account: paymentMethod === "card" ? (accountNumber || "") : (phone || ""),
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (insertError) {
    throw insertError;
  }

  const provider = buildMockPaymentProcessor(paymentMethod);
  const providerResult = await provider.processWithdrawal({ amount: numericAmount, paymentMethod });

  if (!providerResult.success) {
    await supabase
      .from("transactions")
      .update({
        status: "failed",
        description: providerResult.message || "Withdrawal failed.",
        processed_at: new Date().toISOString(),
      })
      .eq("id", pendingTransaction.id);

    throw new Error(providerResult.message || "Withdrawal could not be processed.");
  }

  const wallet = await getWalletBalance(userId);
  if (wallet.balance < numericAmount) {
    await supabase
      .from("transactions")
      .update({
        status: "failed",
        description: "Withdrawal failed: insufficient funds.",
        processed_at: new Date().toISOString(),
      })
      .eq("id", pendingTransaction.id);

    throw new Error("Withdrawal failed because your available balance is insufficient.");
  }

  const nextBalance = wallet.balance - numericAmount;
  await upsertWalletBalance(userId, nextBalance, wallet.currency);

  const { data: finalizedTransaction, error: finalizeError } = await supabase
    .from("transactions")
    .update({
      status: "successful",
      description: `Withdrawal paid to ${getPaymentMethodLabel(paymentMethod)}.`,
      reference_id: providerResult.referenceId || referenceId,
      processed_at: new Date().toISOString(),
    })
    .eq("id", pendingTransaction.id)
    .select()
    .single();

  if (finalizeError) {
    throw finalizeError;
  }

  return {
    success: true,
    status: "successful",
    message: "Your withdrawal has been processed successfully.",
    referenceId: providerResult.referenceId || referenceId,
    transaction: finalizedTransaction,
    newBalance: nextBalance,
  };
};
