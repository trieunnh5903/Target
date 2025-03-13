import { NativeModule, requireNativeModule } from "expo";
import { ZaloPayModuleEvents } from "./ZaloPay.types";

declare class ZaloPayModule extends NativeModule<ZaloPayModuleEvents> {
  payOrder: (zpTransToken: string) => void;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ZaloPayModule>("ZaloPay");
