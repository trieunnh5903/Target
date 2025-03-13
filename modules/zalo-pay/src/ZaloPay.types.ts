export type PaymentPayload = {
  returnCode: number;
  zaloPayErrorCode?: number;
};

export type ZaloPayModuleEvents = {
  onZaloPayResult: (params: PaymentPayload) => void;
};
