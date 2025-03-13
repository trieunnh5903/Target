package expo.modules.zalopay

import android.util.Log
import androidx.core.os.bundleOf
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import vn.zalopay.sdk.Environment
import vn.zalopay.sdk.ZaloPayError
import vn.zalopay.sdk.ZaloPaySDK
import vn.zalopay.sdk.listeners.PayOrderListener
import java.net.URL

class ZaloPayModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ZaloPay")

    OnCreate {
      ZaloPaySDK.init(2554, Environment.SANDBOX)
    }

    OnNewIntent {
      ZaloPaySDK.getInstance().onResult(it)
    }

    Events("onZaloPayResult")

    Function("payOrder"){transToken: String ->
      ZaloPaySDK.getInstance().payOrder(appContext.throwingActivity, transToken, "target://payment", object : PayOrderListener{
        override fun onPaymentSucceeded(p0: String?, p1: String?, p2: String?) {
          Log.d("onPaymentSucceeded", "onPaymentSucceeded")
          this@ZaloPayModule.sendEvent(
            "onZaloPayResult",
            bundleOf(
              "returnCode" to 1
            )
          )
        }

        override fun onPaymentCanceled(p0: String?, p1: String?) {
          Log.d(">onPaymentCanceled>", "onPaymentCanceled")
          this@ZaloPayModule.sendEvent(
            "onZaloPayResult",
            bundleOf(
              "returnCode" to 3
            )
          )
        }

        override fun onPaymentError(p0: ZaloPayError?, p1: String?, p2: String?) {
          Log.d("onPaymentError", "onPaymentError")
          this@ZaloPayModule.sendEvent(
            "onZaloPayResult",
            bundleOf(
              "zaloPayErrorCode" to p0,
              "returnCode" to 2
            )
          )
        }

      })
    }

  }
}
