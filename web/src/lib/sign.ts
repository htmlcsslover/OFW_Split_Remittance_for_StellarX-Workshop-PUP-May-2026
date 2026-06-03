import { NETWORK_PASSPHRASE } from "./stellar";
import { submitSignedXDR, pollTransaction } from "./payment";

/**
 * Sign an unsigned XDR with Freighter, submit it, and poll to finality.
 * Returns the transaction hash. Use for simple "one-shot" actions
 * (trustlines, contract calls) that don't need granular status UI.
 */

interface FreighterSignResponse {
  signedTxXdr?: string;
  result?: string;
  error?: string;
}

export async function signAndSubmit(xdr: string, address: string): Promise<string> {
  // Dynamic import only — static import of freighter-api breaks SSR.
  const freighter = await import("@stellar/freighter-api");
  const signed = (await freighter.signTransaction(xdr, {
    networkPassphrase: NETWORK_PASSPHRASE,
    address,
  })) as unknown as (FreighterSignResponse | string);

  let signedTxXdr: string | undefined;
  let error: string | undefined;

  if (typeof signed === "string") {
    signedTxXdr = signed;
  } else {
    signedTxXdr = signed.signedTxXdr || signed.result;
    error = signed.error;
  }

  if (error) {
    throw new Error(
      typeof error === "string" ? error : "Signing was rejected"
    );
  }

  if (!signedTxXdr) {
    throw new Error("Failed to retrieve signed transaction XDR");
  }

  const hash = await submitSignedXDR(signedTxXdr);
  await pollTransaction(hash);
  return hash;
}
