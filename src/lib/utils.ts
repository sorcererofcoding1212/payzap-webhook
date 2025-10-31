export const generateWalletId = (email: string) => {
  const walletId = `${email.split("@")[0]}@payzap`;
  return walletId;
};