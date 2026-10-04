export const SHOP = {
  shippingFeeKobo: 500000, // ₦5,000 in kobo
  freeShippingThresholdKobo: 100000000, // ₦1,000,000 in kobo

  bankTransfer: {
    bankName: 'Zenith Bank',
    accountName: 'Dave Store Nigeria Ltd.',
    accountNumber: '1234567890',
    instructions: 'Transfer the exact order total. Include your Order Number in the payment narration.',
  },

  payOnDeliverySupportedStates: ['Lagos', 'Anambra'],
};

export function isPayOnDeliverySupported(stateName: string): boolean {
  if (!stateName) return false;
  return SHOP.payOnDeliverySupportedStates.some(
    (s) => s.toLowerCase() === stateName.trim().toLowerCase()
  );
}
